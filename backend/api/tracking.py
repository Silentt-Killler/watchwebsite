# backend/api/tracking.py
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import hashlib
import hmac
import requests
import json
from datetime import datetime
import redis
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

# MongoDB Connection
MONGODB_URL = os.getenv("MONGODB_URL")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.ecommerce

# Redis Connection for caching
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD"),
    decode_responses=True
)

# Facebook Conversions API Configuration
FB_ACCESS_TOKEN = os.getenv("FB_ACCESS_TOKEN")
FB_PIXEL_ID = os.getenv("FB_PIXEL_ID")
FB_API_VERSION = "v18.0"

# Google Measurement Protocol Configuration
GA_MEASUREMENT_ID = os.getenv("GA_MEASUREMENT_ID")
GA_API_SECRET = os.getenv("GA_API_SECRET")


# Pydantic Models
class FacebookEventData(BaseModel):
    event_name: str
    event_time: Optional[int] = None
    user_data: Dict[str, Any]
    custom_data: Dict[str, Any]
    action_source: str = "website"
    event_source_url: str
    event_id: Optional[str] = None


class GoogleEventData(BaseModel):
    client_id: str
    user_id: Optional[str] = None
    events: List[Dict[str, Any]]
    user_properties: Optional[Dict[str, Any]] = None


class OrderCreate(BaseModel):
    items: List[Dict[str, Any]]
    shipping_address: Dict[str, str]
    delivery_option: str
    payment_method: str
    subtotal: float
    delivery_charge: float
    total_amount: float
    note: Optional[str] = ""


# Helper Functions
def hash_data(data: str) -> str:
    """Hash user data using SHA-256 for privacy"""
    return hashlib.sha256(data.lower().strip().encode()).hexdigest()


def generate_event_id() -> str:
    """Generate unique event ID for deduplication"""
    return hashlib.md5(f"{datetime.utcnow().isoformat()}".encode()).hexdigest()


# Facebook Conversions API Endpoint
@router.post("/api/tracking/facebook")
async def facebook_capi(request: Request, event_data: FacebookEventData):
    """Send events to Facebook Conversions API"""
    try:
        # Get IP address from request
        client_ip = request.client.host

        # Prepare data for Facebook CAPI
        payload = {
            "data": [{
                "event_name": event_data.event_name,
                "event_time": event_data.event_time or int(datetime.utcnow().timestamp()),
                "event_id": event_data.event_id or generate_event_id(),
                "user_data": {
                    **event_data.user_data,
                    "client_ip_address": client_ip,
                    "client_user_agent": request.headers.get("user-agent", "")
                },
                "custom_data": event_data.custom_data,
                "action_source": event_data.action_source,
                "event_source_url": event_data.event_source_url
            }],
            "test_event_code": os.getenv("FB_TEST_EVENT_CODE", "")  # Remove in production
        }

        # Send to Facebook
        url = f"https://graph.facebook.com/{FB_API_VERSION}/{FB_PIXEL_ID}/events"
        params = {"access_token": FB_ACCESS_TOKEN}

        response = requests.post(url, json=payload, params=params)
        response_data = response.json()

        # Log event in MongoDB for analytics
        await db.tracking_events.insert_one({
            "platform": "facebook",
            "event_name": event_data.event_name,
            "event_id": payload["data"][0]["event_id"],
            "timestamp": datetime.utcnow(),
            "response": response_data
        })

        return {
            "success": response.status_code == 200,
            "event_id": payload["data"][0]["event_id"],
            "response": response_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Google Analytics 4 Measurement Protocol Endpoint
@router.post("/api/tracking/google")
async def google_mp(event_data: GoogleEventData):
    """Send events to Google Analytics 4 Measurement Protocol"""
    try:
        # Prepare payload for GA4
        payload = {
            "client_id": event_data.client_id,
            "events": event_data.events,
            "non_personalized_ads": False
        }

        if event_data.user_id:
            payload["user_id"] = event_data.user_id

        if event_data.user_properties:
            payload["user_properties"] = event_data.user_properties

        # Send to Google Analytics
        url = f"https://www.google-analytics.com/mp/collect"
        params = {
            "measurement_id": GA_MEASUREMENT_ID,
            "api_secret": GA_API_SECRET
        }

        response = requests.post(url, json=payload, params=params)

        # Log event in MongoDB
        await db.tracking_events.insert_one({
            "platform": "google",
            "events": event_data.events,
            "client_id": event_data.client_id,
            "timestamp": datetime.utcnow(),
            "status_code": response.status_code
        })

        return {
            "success": response.status_code == 204,
            "status_code": response.status_code
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Order Management Endpoints
@router.post("/api/orders")
async def create_order(request: Request, order_data: OrderCreate):
    """Create new order with tracking"""
    try:
        # Get user from token (assuming you have auth middleware)
        user_id = request.state.user_id if hasattr(request.state, 'user_id') else None

        # Generate order ID
        order_count = await db.orders.count_documents({})
        order_id = f"ORD{datetime.utcnow().strftime('%Y%m%d')}{order_count + 1:05d}"

        # Prepare order document
        order_doc = {
            "order_id": order_id,
            "user_id": user_id,
            "items": order_data.items,
            "shipping_address": order_data.shipping_address,
            "delivery_option": order_data.delivery_option,
            "payment_method": order_data.payment_method,
            "subtotal": order_data.subtotal,
            "delivery_charge": order_data.delivery_charge,
            "total_amount": order_data.total_amount,
            "note": order_data.note,
            "order_status": "pending",
            "payment_status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Insert order to MongoDB
        result = await db.orders.insert_one(order_doc)
        order_doc["_id"] = str(result.inserted_id)

        # Cache order data in Redis for quick access
        redis_client.setex(
            f"order:{order_id}",
            3600,  # 1 hour expiry
            json.dumps(order_doc, default=str)
        )

        # Trigger server-side tracking
        await trigger_purchase_tracking(request, order_doc)

        # Send order confirmation email (implement separately)
        # await send_order_confirmation_email(order_doc)

        return {
            "success": True,
            "order_id": order_id,
            "order": order_doc
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def trigger_purchase_tracking(request: Request, order: dict):
    """Trigger purchase tracking for Facebook and Google"""

    # Prepare Facebook CAPI data
    fb_event = FacebookEventData(
        event_name="Purchase",
        user_data={
            "em": hash_data(order["shipping_address"]["email"]),
            "ph": hash_data(order["shipping_address"]["phone"]),
            "fn": hash_data(order["shipping_address"]["full_name"].split()[0]),
            "ln": hash_data(order["shipping_address"]["full_name"].split()[-1]) if len(
                order["shipping_address"]["full_name"].split()) > 1 else "",
            "ct": hash_data(order["shipping_address"]["city"]),
            "country": hash_data("BD")
        },
        custom_data={
            "currency": "BDT",
            "value": order["total_amount"],
            "content_ids": [item["id"] for item in order["items"]],
            "contents": [{"id": item["id"], "quantity": item["quantity"]} for item in order["items"]],
            "content_type": "product",
            "order_id": order["order_id"]
        },
        event_source_url=str(request.url)
    )

    # Send to Facebook
    await facebook_capi(request, fb_event)

    # Prepare Google Analytics data
    ga_event = GoogleEventData(
        client_id=request.cookies.get("_ga", "").replace("GA1.1.", "") or generate_event_id(),
        events=[{
            "name": "purchase",
            "params": {
                "transaction_id": order["order_id"],
                "value": order["total_amount"],
                "currency": "BDT",
                "shipping": order["delivery_charge"],
                "items": [{
                    "item_id": item["id"],
                    "item_name": item["name"],
                    "price": item["price"],
                    "quantity": item["quantity"]
                } for item in order["items"]]
            }
        }]
    )

    # Send to Google Analytics
    await google_mp(ga_event)


# Get Order Status
@router.get("/api/orders/{order_id}")
async def get_order(order_id: str):
    """Get order details"""
    try:
        # Try to get from cache first
        cached_order = redis_client.get(f"order:{order_id}")
        if cached_order:
            return json.loads(cached_order)

        # Get from MongoDB
        order = await db.orders.find_one({"order_id": order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        order["_id"] = str(order["_id"])

        # Cache for future requests
        redis_client.setex(
            f"order:{order_id}",
            3600,
            json.dumps(order, default=str)
        )

        return order

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Update Order Status (Admin)
@router.put("/api/orders/{order_id}/status")
async def update_order_status(
        order_id: str,
        status: str,
        payment_status: Optional[str] = None
):
    """Update order status (Admin only)"""
    try:
        update_data = {
            "order_status": status,
            "updated_at": datetime.utcnow()
        }

        if payment_status:
            update_data["payment_status"] = payment_status

        result = await db.orders.update_one(
            {"order_id": order_id},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")

        # Clear cache
        redis_client.delete(f"order:{order_id}")

        return {"success": True, "message": "Order status updated"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Analytics Dashboard Data
@router.get("/api/analytics/overview")
async def get_analytics_overview(date_from: str, date_to: str):
    """Get analytics overview for dashboard"""
    try:
        from_date = datetime.strptime(date_from, "%Y-%m-%d")
        to_date = datetime.strptime(date_to, "%Y-%m-%d")

        # Aggregate data from MongoDB
        pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": from_date, "$lte": to_date}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_orders": {"$sum": 1},
                    "total_revenue": {"$sum": "$total_amount"},
                    "avg_order_value": {"$avg": "$total_amount"},
                    "total_items_sold": {"$sum": {"$size": "$items"}}
                }
            }
        ]

        result = await db.orders.aggregate(pipeline).to_list(1)

        if not result:
            return {
                "total_orders": 0,
                "total_revenue": 0,
                "avg_order_value": 0,
                "total_items_sold": 0
            }

        return result[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))