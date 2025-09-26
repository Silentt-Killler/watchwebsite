# backend/api/payment.py
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
import httpx
import hashlib
import hmac
import json
import uuid
from datetime import datetime, timedelta
import base64
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter()

# MongoDB Connection
MONGODB_URL = os.getenv("MONGODB_URL")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.ecommerce

# Payment Gateway Configurations
BKASH_CONFIG = {
    "app_key": os.getenv("BKASH_APP_KEY"),
    "app_secret": os.getenv("BKASH_APP_SECRET"),
    "username": os.getenv("BKASH_USERNAME"),
    "password": os.getenv("BKASH_PASSWORD"),
    "base_url": os.getenv("BKASH_BASE_URL", "https://tokenized.sandbox.bka.sh/v1.2.0-beta"),
    "callback_url": os.getenv("BKASH_CALLBACK_URL")
}

NAGAD_CONFIG = {
    "merchant_id": os.getenv("NAGAD_MERCHANT_ID"),
    "merchant_public_key": os.getenv("NAGAD_PUBLIC_KEY"),
    "merchant_private_key": os.getenv("NAGAD_PRIVATE_KEY"),
    "base_url": os.getenv("NAGAD_BASE_URL", "https://api.mynagad.com"),
    "callback_url": os.getenv("NAGAD_CALLBACK_URL")
}

UPAY_CONFIG = {
    "merchant_id": os.getenv("UPAY_MERCHANT_ID"),
    "merchant_key": os.getenv("UPAY_MERCHANT_KEY"),
    "base_url": os.getenv("UPAY_BASE_URL", "https://api.upay.com"),
    "callback_url": os.getenv("UPAY_CALLBACK_URL")
}


# Pydantic Models
class PaymentInitiate(BaseModel):
    order_id: str
    amount: float
    payment_method: str  # bkash, nagad, upay
    customer_name: str
    customer_phone: str
    customer_email: str


class PaymentCallback(BaseModel):
    payment_id: str
    order_id: str
    status: str
    transaction_id: Optional[str] = None
    amount: Optional[float] = None
    payment_method: str


# bKash Integration
class BkashGateway:
    def __init__(self):
        self.config = BKASH_CONFIG
        self.token = None
        self.token_expiry = None

    async def get_token(self):
        """Get bKash access token"""
        if self.token and self.token_expiry and datetime.utcnow() < self.token_expiry:
            return self.token

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.config['base_url']}/tokenized/checkout/token/grant",
                json={
                    "app_key": self.config['app_key'],
                    "app_secret": self.config['app_secret']
                },
                headers={
                    "username": self.config['username'],
                    "password": self.config['password']
                }
            )

            if response.status_code == 200:
                data = response.json()
                self.token = data['id_token']
                self.token_expiry = datetime.utcnow() + timedelta(seconds=data['expires_in'])
                return self.token
            else:
                raise HTTPException(status_code=500, detail="Failed to get bKash token")

    async def create_payment(self, order_id: str, amount: float, reference: str):
        """Create bKash payment"""
        token = await self.get_token()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.config['base_url']}/tokenized/checkout/create",
                json={
                    "mode": "0011",
                    "payerReference": reference,
                    "callbackURL": f"{self.config['callback_url']}/{order_id}",
                    "amount": str(amount),
                    "currency": "BDT",
                    "intent": "sale",
                    "merchantInvoiceNumber": order_id
                },
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-APP-Key": self.config['app_key']
                }
            )

            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=500, detail="Failed to create bKash payment")

    async def execute_payment(self, payment_id: str):
        """Execute bKash payment after user approval"""
        token = await self.get_token()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.config['base_url']}/tokenized/checkout/execute",
                json={"paymentID": payment_id},
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-APP-Key": self.config['app_key']
                }
            )

            return response.json()

    async def query_payment(self, payment_id: str):
        """Query bKash payment status"""
        token = await self.get_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.config['base_url']}/tokenized/checkout/payment/status",
                params={"paymentID": payment_id},
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-APP-Key": self.config['app_key']
                }
            )

            return response.json()


# Nagad Integration
class NagadGateway:
    def __init__(self):
        self.config = NAGAD_CONFIG

    def generate_signature(self, data: dict) -> str:
        """Generate Nagad signature"""
        sorted_data = json.dumps(data, sort_keys=True, separators=(',', ':'))
        private_key = base64.b64decode(self.config['merchant_private_key'])
        signature = hmac.new(private_key, sorted_data.encode(), hashlib.sha256).hexdigest()
        return signature

    async def create_payment(self, order_id: str, amount: float, customer_phone: str):
        """Create Nagad payment"""
        timestamp = datetime.utcnow().isoformat()
        challenge = str(uuid.uuid4())

        payment_data = {
            "merchantId": self.config['merchant_id'],
            "orderId": order_id,
            "amount": str(amount),
            "currency": "BDT",
            "challenge": challenge,
            "timestamp": timestamp,
            "redirectUrl": f"{self.config['callback_url']}/{order_id}",
            "customerMobile": customer_phone
        }

        signature = self.generate_signature(payment_data)
        payment_data['signature'] = signature

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.config['base_url']}/payment/create",
                json=payment_data
            )

            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=500, detail="Failed to create Nagad payment")

    async def verify_payment(self, payment_ref: str):
        """Verify Nagad payment"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.config['base_url']}/payment/verify/{payment_ref}",
                params={"merchantId": self.config['merchant_id']}
            )

            return response.json()


# Upay Integration
class UpayGateway:
    def __init__(self):
        self.config = UPAY_CONFIG

    def generate_hash(self, data: str) -> str:
        """Generate Upay hash"""
        secret = self.config['merchant_key']
        return hashlib.sha256((data + secret).encode()).hexdigest()

    async def create_payment(self, order_id: str, amount: float, customer_info: dict):
        """Create Upay payment"""
        payment_data = {
            "merchant_id": self.config['merchant_id'],
            "order_id": order_id,
            "amount": amount,
            "currency": "BDT",
            "customer_name": customer_info['name'],
            "customer_email": customer_info['email'],
            "customer_phone": customer_info['phone'],
            "redirect_url": f"{self.config['callback_url']}/{order_id}",
            "cancel_url": f"{self.config['callback_url']}/{order_id}/cancel",
            "timestamp": int(datetime.utcnow().timestamp())
        }

        # Generate hash
        hash_string = f"{payment_data['merchant_id']}{payment_data['order_id']}{payment_data['amount']}"
        payment_data['hash'] = self.generate_hash(hash_string)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.config['base_url']}/payment/init",
                json=payment_data
            )

            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=500, detail="Failed to create Upay payment")

    async def verify_payment(self, transaction_id: str):
        """Verify Upay payment"""
        verify_data = {
            "merchant_id": self.config['merchant_id'],
            "transaction_id": transaction_id
        }

        hash_string = f"{verify_data['merchant_id']}{verify_data['transaction_id']}"
        verify_data['hash'] = self.generate_hash(hash_string)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.config['base_url']}/payment/verify",
                json=verify_data
            )

            return response.json()


# API Endpoints
@router.post("/api/payment/initiate")
async def initiate_payment(payment_data: PaymentInitiate):
    """Initiate payment with selected gateway"""
    try:
        # Save payment initiation in database
        payment_doc = {
            "payment_id": str(uuid.uuid4()),
            "order_id": payment_data.order_id,
            "amount": payment_data.amount,
            "payment_method": payment_data.payment_method,
            "customer_name": payment_data.customer_name,
            "customer_phone": payment_data.customer_phone,
            "customer_email": payment_data.customer_email,
            "status": "initiated",
            "created_at": datetime.utcnow()
        }

        await db.payments.insert_one(payment_doc)

        # Process based on payment method
        if payment_data.payment_method == "bkash":
            gateway = BkashGateway()
            result = await gateway.create_payment(
                payment_data.order_id,
                payment_data.amount,
                payment_data.customer_phone
            )

            # Update payment doc with gateway response
            await db.payments.update_one(
                {"payment_id": payment_doc["payment_id"]},
                {"$set": {
                    "gateway_payment_id": result.get("paymentID"),
                    "payment_url": result.get("bkashURL"),
                    "updated_at": datetime.utcnow()
                }}
            )

            return {
                "success": True,
                "payment_id": payment_doc["payment_id"],
                "payment_url": result.get("bkashURL"),
                "gateway_payment_id": result.get("paymentID")
            }

        elif payment_data.payment_method == "nagad":
            gateway = NagadGateway()
            result = await gateway.create_payment(
                payment_data.order_id,
                payment_data.amount,
                payment_data.customer_phone
            )

            await db.payments.update_one(
                {"payment_id": payment_doc["payment_id"]},
                {"$set": {
                    "gateway_payment_ref": result.get("paymentRef"),
                    "payment_url": result.get("redirectUrl"),
                    "updated_at": datetime.utcnow()
                }}
            )

            return {
                "success": True,
                "payment_id": payment_doc["payment_id"],
                "payment_url": result.get("redirectUrl"),
                "gateway_payment_ref": result.get("paymentRef")
            }

        elif payment_data.payment_method == "upay":
            gateway = UpayGateway()
            result = await gateway.create_payment(
                payment_data.order_id,
                payment_data.amount,
                {
                    "name": payment_data.customer_name,
                    "email": payment_data.customer_email,
                    "phone": payment_data.customer_phone
                }
            )

            await db.payments.update_one(
                {"payment_id": payment_doc["payment_id"]},
                {"$set": {
                    "gateway_transaction_id": result.get("transaction_id"),
                    "payment_url": result.get("payment_url"),
                    "updated_at": datetime.utcnow()
                }}
            )

            return {
                "success": True,
                "payment_id": payment_doc["payment_id"],
                "payment_url": result.get("payment_url"),
                "gateway_transaction_id": result.get("transaction_id")
            }

        else:
            raise HTTPException(status_code=400, detail="Invalid payment method")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/payment/callback/{order_id}")
async def payment_callback(order_id: str, request: Request, background_tasks: BackgroundTasks):
    """Handle payment gateway callbacks"""
    try:
        # Get request data
        callback_data = await request.json()

        # Find payment record
        payment = await db.payments.find_one({"order_id": order_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        # Process based on payment method
        if payment["payment_method"] == "bkash":
            gateway = BkashGateway()

            if callback_data.get("status") == "success":
                # Execute payment
                execution_result = await gateway.execute_payment(callback_data.get("paymentID"))

                if execution_result.get("statusCode") == "0000":
                    # Payment successful
                    await db.payments.update_one(
                        {"order_id": order_id},
                        {"$set": {
                            "status": "completed",
                            "transaction_id": execution_result.get("trxID"),
                            "completed_at": datetime.utcnow()
                        }}
                    )

                    # Update order status
                    await db.orders.update_one(
                        {"order_id": order_id},
                        {"$set": {
                            "payment_status": "paid",
                            "updated_at": datetime.utcnow()
                        }}
                    )

                    background_tasks.add_task(track_purchase_completion, order_id)

                    return {"success": True, "message": "Payment completed successfully"}

        elif payment["payment_method"] == "upay":
            gateway = UpayGateway()

            if callback_data.get("status") == "SUCCESS":
                # Verify payment
                verification = await gateway.verify_payment(callback_data.get("transaction_id"))

                if verification.get("status") == "SUCCESS":
                    await db.payments.update_one(
                        {"order_id": order_id},
                        {"$set": {
                            "status": "completed",
                            "transaction_id": verification.get("transaction_id"),
                            "completed_at": datetime.utcnow()
                        }}
                    )

                    await db.orders.update_one(
                        {"order_id": order_id},
                        {"$set": {
                            "payment_status": "paid",
                            "updated_at": datetime.utcnow()
                        }}
                    )

                    background_tasks.add_task(track_purchase_completion, order_id)

                    return {"success": True, "message": "Payment completed successfully"}

        # Payment failed or cancelled
        await db.payments.update_one(
            {"order_id": order_id},
            {"$set": {
                "status": "failed",
                "failed_at": datetime.utcnow()
            }}
        )

        return {"success": False, "message": "Payment failed"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/payment/status/{payment_id}")
async def get_payment_status(payment_id: str):
    """Get payment status"""
    try:
        payment = await db.payments.find_one({"payment_id": payment_id})

        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        payment["_id"] = str(payment["_id"])

        return {
            "success": True,
            "payment": payment
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def track_purchase_completion(order_id: str):
    """Background task to track purchase completion"""
    try:
        # Get order details
        order = await db.orders.find_one({"order_id": order_id})

        if order:
            # Send server-side tracking events
            # Implementation depends on your tracking setup
            pass

    except Exception as e:
        print(f"Error tracking purchase: {e}")
        status
        ": "
        paid
        ",
        "updated_at": datetime.utcnow()
    }}
    )

    # Track purchase event
    background_tasks.add_task(track_purchase_completion, order_id)

    return {"success": True, "message": "Payment completed successfully"}

    elif payment["payment_method"] == "nagad":
    gateway = NagadGateway()

    if callback_data.get("status") == "Success":
        # Verify payment
        verification = await gateway.verify_payment(callback_data.get("payment_ref"))

        if verification.get("status") == "Success":
            await db.payments.update_one(
                {"order_id": order_id},
                {"$set": {
                    "status": "completed",
                    "transaction_id": verification.get("issuerPaymentRefNo"),
                    "completed_at": datetime.utcnow()
                }}
            )

            await db.orders.update_one(
                {"order_id": order_id},
                {"$set": {
                    "payment_