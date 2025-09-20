from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import Response
from urllib.parse import quote_plus
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta
from typing import Optional, List
import os
import csv
import io
from dotenv import load_dotenv
from enum import Enum
import bcrypt
from bson import ObjectId



# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Timora API",
    description="Premium Watch eCommerce Backend API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
username = quote_plus("timoraAdmin")
password = quote_plus("n@zi@redow@n")
cluster = "timora-cluster.ruaqmjs.mongodb.net"
MONGODB_URL = f"mongodb+srv://{username}:{password}@{cluster}/?retryWrites=true&w=majority"
DATABASE_NAME = "timora_db"

# Security configuration
SECRET_KEY = "your-secret-key-change-in-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 43200  # 30 days

# MongoDB client
client = None
db = None

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


# -------------------- Pydantic Models --------------------

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    confirm_password: str


class UserLogin(BaseModel):
    email_or_phone: str
    password: str


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    brand: str
    stock: int
    images: list[str] = []
    is_featured: bool = False
    is_active: bool = True
    specifications: Optional[dict] = None

    # Item specifications
    model: Optional[str] = None
    series: Optional[str] = None
    gender: Optional[str] = None
    brand_origin: Optional[str] = None
    upc: Optional[str] = None

    # Case specifications
    case_size: Optional[str] = None
    case_thickness: Optional[str] = None
    lug_to_lug: Optional[str] = None
    case_material: Optional[str] = None
    case_color: Optional[str] = None
    case_back: Optional[str] = None
    case_shape: Optional[str] = None

    # Dial specifications
    dial_color: Optional[str] = None
    crystal: Optional[str] = None
    crystal_coating: Optional[str] = None
    crown: Optional[str] = None
    bezel: Optional[str] = None
    bezel_color: Optional[str] = None
    bezel_material: Optional[str] = None
    lumibrite: Optional[str] = None

    # Movement specifications
    movement: Optional[str] = None
    movement_source: Optional[str] = None
    engine: Optional[str] = None
    jewels: Optional[str] = None
    power_reserve: Optional[str] = None
    magnetic_resistance: Optional[str] = None

    # Band specifications
    band_material: Optional[str] = None
    band_type: Optional[str] = None
    band_width: Optional[str] = None
    band_color: Optional[str] = None
    clasp: Optional[str] = None

    # Additional Information
    water_resistance: Optional[str] = None
    functions: Optional[str] = None
    calendar: Optional[str] = None
    watch_style: Optional[str] = None
    weight: Optional[str] = None
    warranty: Optional[str] = None
    also_known_as: Optional[str] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    original_price: Optional[float]
    category: str
    brand: str
    stock: int
    images: list[str]
    model: Optional[str]
    movement: Optional[str]
    case_size: Optional[str]
    water_resistance: Optional[str]
    warranty: Optional[str]
    is_featured: bool
    is_active: bool
    created_at: datetime


class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: str
    brand: str
    stock: int
    images: list[str]
    is_featured: bool
    is_active: bool
    created_at: datetime


class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)


class CartResponse(BaseModel):
    user_id: str
    items: list[dict]
    total: float
    updated_at: datetime


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    district: str
    postal_code: str


class CreateOrder(BaseModel):
    shipping_address: ShippingAddress
    payment_method: str  # "cod" or "online"
    items: list[dict]
    subtotal: float
    shipping_cost: float = 100.0
    total_amount: float
    notes: Optional[str] = None


# -------------------- Additional Models for Customer Management --------------------

class CustomerFilter(BaseModel):
    status: Optional[str] = None  # "active", "inactive", "all"
    has_orders: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

class CustomerUpdate(BaseModel):
    is_active: Optional[bool] = None
    notes: Optional[str] = None


# -------------------- Brand Endpoints--------------------

class BrandCreate(BaseModel):
    name: str
    slug: str
    image: str
    description: Optional[str] = None
    is_active: bool = True

class BrandResponse(BaseModel):
    id: str
    name: str
    slug: str
    image: str
    description: Optional[str]
    is_active: bool
    created_at: datetime


# ========== SLIDER MODELS - TITLE OPTIONAL ==========
class DeviceType(str, Enum):
    DESKTOP = "desktop"
    MOBILE = "mobile"


class SliderCreate(BaseModel):
    title: Optional[str] = None  # OPTIONAL - can be None
    subtitle: Optional[str] = None  # OPTIONAL
    image_url: str  # REQUIRED
    button_text: Optional[str] = None  # OPTIONAL
    button_link: Optional[str] = None  # OPTIONAL
    device_type: DeviceType
    order_index: int = 1
    is_active: bool = True


class SliderResponse(BaseModel):
    id: str
    title: Optional[str]
    subtitle: Optional[str]
    image_url: str
    button_text: Optional[str]
    button_link: Optional[str]
    device_type: str
    order_index: int
    is_active: bool
    created_at: datetime




# ========== ADMIN ROLE MANAGEMENT ==========

class AdminRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    MODERATOR = "moderator"

class AdminUserCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    role: AdminRole = AdminRole.MODERATOR
    permissions: List[str] = []
    is_active: bool = True

# ========== COUPON MODELS ==========
class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: DiscountType
    discount_value: float
    min_order_amount: Optional[float] = None
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    valid_from: str  # Changed to string for frontend compatibility
    valid_until: str  # Changed to string for frontend compatibility
    is_active: bool = True

class CouponResponse(BaseModel):
    id: str
    code: str
    description: Optional[str]
    discount_type: str
    discount_value: float
    min_order_amount: Optional[float]
    max_discount: Optional[float]
    usage_limit: Optional[int]
    used_count: int
    valid_from: str  # Changed to string
    valid_until: str  # Changed to string
    is_active: bool
    created_at: Optional[str] = None  # Changed to string






    
# -------------------- Utility Functions --------------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    try:
        # Remove Bearer prefix if present
        if token.startswith("Bearer "):
            token = token[7:]

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token: str = Depends(oauth2_scheme)):
    email = verify_token(token)

    user = await db.users.find_one({"email": email})

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# -------------------- Database Connection --------------------

@app.on_event("startup")
async def startup_db_client():
    global client, db
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]

        # Test connection
        await client.server_info()
        print(f"✅ Connected to MongoDB: {DATABASE_NAME}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_db_client():
    global client
    if client:
        client.close()
        print("📴 Disconnected from MongoDB")


# -------------------- API Routes --------------------

@app.get("/")
async def root():
    return {
        "message": "Welcome to Timora API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    try:
        # Check MongoDB connection
        await client.server_info()
        return {"status": "healthy", "database": "connected"}
    except:
        return {"status": "unhealthy", "database": "disconnected"}


@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    # Validate passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    # Check if user exists
    existing_user = await db.users.find_one({
        "$or": [
            {"email": user_data.email},
            {"phone": user_data.phone}
        ]
    })

    if existing_user:
        if existing_user.get("email") == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )

    # Create new user
    user_dict = {
        "full_name": user_data.full_name,
        "email": user_data.email,
        "phone": user_data.phone,
        "password_hash": get_password_hash(user_data.password),
        "is_active": True,
        "is_admin": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    # Insert into database
    result = await db.users.insert_one(user_dict)

    # Return user response
    user_dict["id"] = str(result.inserted_id)
    return UserResponse(**user_dict)


@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user by email or phone
    user = await db.users.find_one({
        "$or": [
            {"email": user_data.email_or_phone},
            {"phone": user_data.email_or_phone}
        ]
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/phone or password"
        )

    # Verify password
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/phone or password"
        )

    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )

    return Token(access_token=access_token)


@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({
        "$or": [
            {"email": form_data.username},
            {"phone": form_data.username}
        ]
    })

    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )

    return Token(access_token=access_token)


@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    current_user["id"] = str(current_user["_id"])
    return UserResponse(**current_user)


@app.get("/api/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    # Check if user is admin
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view users"
        )

    users = []
    async for user in db.users.find():
        user["id"] = str(user["_id"])
        del user["_id"]
        del user["password_hash"]
        users.append(user)

    return users


@app.post("/api/products", response_model=ProductResponse)
async def create_product(
        product: ProductCreate,
        current_user: dict = Depends(get_current_user)
):
    """Create new product (Admin only)"""
    # Check if user is admin
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create products"
        )

    # Create product
    product_dict = product.dict()
    product_dict["created_at"] = datetime.utcnow()
    product_dict["updated_at"] = datetime.utcnow()

    result = await db.products.insert_one(product_dict)
    product_dict["id"] = str(result.inserted_id)

    return ProductResponse(**product_dict)


@app.get("/api/products", response_model=list[ProductResponse])
async def get_products(
        category: Optional[str] = None,
        brand: Optional[str] = None,
        is_featured: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20
):
    """Get all products with optional filters"""
    query = {"is_active": True}

    if category:
        query["category"] = category
    if brand:
        query["brand"] = brand
    if is_featured is not None:
        query["is_featured"] = is_featured

    products = []
    cursor = db.products.find(query).skip(skip).limit(limit)

    async for product in cursor:
        product["id"] = str(product["_id"])
        products.append(ProductResponse(**product))

    return products

#search optiom

@app.get("/api/products/search")
async def search_products(q: str = ""):
    """Search products by name, brand, category"""
    if not q or len(q) < 2:
        return []

    try:
        # Simple text search
        search_term = q.lower()

        # Get all active products
        all_products = await db.products.find({"is_active": True}).to_list(100)

        results = []
        for product in all_products:
            # Check if search term matches
            name = product.get("name", "").lower()
            brand = product.get("brand", "").lower()
            description = product.get("description", "").lower()
            category = product.get("category", "").lower()

            if (search_term in name or
                    search_term in brand or
                    search_term in description or
                    search_term in category):
                results.append({
                    "id": str(product["_id"]),
                    "name": product.get("name", ""),
                    "price": float(product.get("price", 0)),
                    "brand": product.get("brand", ""),
                    "category": product.get("category", ""),
                    "images": product.get("images", []),
                    "stock": product.get("stock", 0)
                })

        return results[:10]  # Return max 10 results

    except Exception as e:
        print(f"Search error: {str(e)}")
        import traceback
        traceback.print_exc()
        return []



@app.get("/api/products/{product_id}")
async def get_single_product(product_id: str):
    """Get single product by ID"""
    from bson import ObjectId

    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    product = await db.products.find_one({"_id": ObjectId(product_id)})

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product["id"] = str(product["_id"])
    del product["_id"]

    return product


@app.put("/api/products/{product_id}", response_model=ProductResponse)
async def update_product(
        product_id: str,
        product: ProductCreate,
        current_user: dict = Depends(get_current_user)
):
    """Update product (Admin only)"""
    from bson import ObjectId

    # Check admin
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update products"
        )

    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )

    # Update product
    product_dict = product.dict()
    product_dict["updated_at"] = datetime.utcnow()

    result = await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": product_dict}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Get updated product
    updated_product = await db.products.find_one({"_id": ObjectId(product_id)})
    updated_product["id"] = str(updated_product["_id"])

    return ProductResponse(**updated_product)


@app.delete("/api/products/{product_id}")
async def delete_product(
        product_id: str,
        current_user: dict = Depends(get_current_user)
):
    """Delete product (Admin only)"""
    from bson import ObjectId

    # Check admin
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete products"
        )

    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )

    # Soft delete - just mark as inactive
    result = await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return {"message": "Product deleted successfully"}


# Brands endpoint for filter
@app.get("/api/brands/active")
async def get_active_brands():
    """Get all active brands from products"""
    try:
        pipeline = [
            {"$match": {"is_active": True}},
            {"$group": {"_id": "$brand"}},
            {"$sort": {"_id": 1}}
        ]

        brands = await db.products.aggregate(pipeline).to_list(None)

        result = []
        for brand in brands:
            if brand["_id"]:
                result.append({"name": brand["_id"]})

        return result
    except Exception as e:
        print(f"Error fetching brands: {str(e)}")
        return [
            {"name": "Seiko"},
            {"name": "Casio"},
            {"name": "Titan"},
            {"name": "Citizen"},
            {"name": "Fossil"}
        ]




@app.post("/api/cart/add")
async def add_to_cart(
        item: CartItem,
        current_user: dict = Depends(get_current_user)
):
    """Add item to cart"""
    from bson import ObjectId

    # Get product
    try:
        product = await db.products.find_one({"_id": ObjectId(item.product_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check stock
    if product.get("stock", 0) < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    user_id = str(current_user["_id"])

    # Find or create cart
    cart = await db.carts.find_one({"user_id": user_id})

    if cart:
        # Update existing cart
        cart_items = cart.get("items", [])

        # Check if product already in cart
        existing_item = next((x for x in cart_items if x["product_id"] == item.product_id), None)

        if existing_item:
            existing_item["quantity"] += item.quantity
        else:
            cart_items.append({
                "product_id": item.product_id,
                "product_name": product["name"],
                "price": product["price"],
                "quantity": item.quantity,
                "image": product.get("images", ["/images/products/placeholder.jpg"])[0]
            })

        # Calculate total
        total = sum(item["price"] * item["quantity"] for item in cart_items)

        await db.carts.update_one(
            {"user_id": user_id},
            {"$set": {
                "items": cart_items,
                "total": total,
                "updated_at": datetime.utcnow()
            }}
        )
    else:
        # Create new cart
        cart_data = {
            "user_id": user_id,
            "items": [{
                "product_id": item.product_id,
                "product_name": product["name"],
                "price": product["price"],
                "quantity": item.quantity,
                "image": product.get("images", ["/images/products/placeholder.jpg"])[0]
            }],
            "total": product["price"] * item.quantity,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.carts.insert_one(cart_data)

    return {"message": "Item added to cart"}


@app.get("/api/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    """Get user's cart"""
    user_id = str(current_user["_id"])
    cart = await db.carts.find_one({"user_id": user_id})

    if not cart:
        return {"items": [], "total": 0}

    return {
        "items": cart.get("items", []),
        "total": cart.get("total", 0)
    }


@app.put("/api/cart/update")
async def update_cart_item(
        item: CartItem,
        current_user: dict = Depends(get_current_user)
):
    """Update cart item quantity"""
    user_id = str(current_user["_id"])

    cart = await db.carts.find_one({"user_id": user_id})

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    items = cart.get("items", [])
    updated = False

    for cart_item in items:
        if cart_item["product_id"] == item.product_id:
            if item.quantity <= 0:
                items.remove(cart_item)
            else:
                cart_item["quantity"] = item.quantity
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    # Recalculate total
    total = sum(i["price"] * i["quantity"] for i in items)

    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {
            "items": items,
            "total": total,
            "updated_at": datetime.utcnow()
        }}
    )

    return {"message": "Cart updated"}


@app.delete("/api/cart/item/{product_id}")
async def remove_from_cart(
        product_id: str,
        current_user: dict = Depends(get_current_user)
):
    """Remove item from cart"""
    user_id = str(current_user["_id"])

    result = await db.carts.update_one(
        {"user_id": user_id},
        {"$pull": {"items": {"product_id": product_id}}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    # Recalculate total
    cart = await db.carts.find_one({"user_id": user_id})
    if cart:
        total = sum(item["price"] * item["quantity"] for item in cart.get("items", []))
        await db.carts.update_one(
            {"user_id": user_id},
            {"$set": {"total": total, "updated_at": datetime.utcnow()}}
        )

    return {"message": "Item removed from cart"}




# UPDATE ORDER CREATION TO INCLUDE COUPON
@app.post("/api/orders")
async def create_order(
        order_data: dict,
        current_user: dict = Depends(get_current_user)
):
    """Create new order with optional coupon"""
    from bson import ObjectId
    import random
    import string

    try:
        # Generate order ID
        order_id = 'ORD' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

        # Get discount amount from request (already calculated in frontend)
        discount_amount = float(order_data.get("discount_amount", 0))
        coupon_code = order_data.get("coupon_code")

        # If coupon was used, increment its usage count
        if coupon_code and discount_amount > 0:
            await db.coupons.update_one(
                {"code": coupon_code.upper()},
                {"$inc": {"used_count": 1}}
            )

        # Create order
        order = {
            "order_id": order_id,
            "user_id": str(current_user["_id"]),
            "user_email": current_user.get("email"),
            "items": order_data.get("items", []),
            "shipping_address": order_data.get("shipping_address"),
            "payment_method": order_data.get("payment_method", "cod"),
            "subtotal": float(order_data.get("subtotal", 0)),
            "shipping_cost": float(order_data.get("shipping_cost", 100)),
            "coupon_code": coupon_code,
            "discount_amount": discount_amount,
            "total_amount": float(order_data.get("total_amount", 0)),
            "order_status": "pending",
            "notes": order_data.get("notes"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = await db.orders.insert_one(order)

        # Clear user's cart if it's not a buy-now order
        if order_data.get("notes") != "Buy Now Order":
            await db.carts.delete_one({"user_id": str(current_user["_id"])})

        # Update product stock
        for item in order_data.get("items", []):
            await db.products.update_one(
                {"_id": ObjectId(item.get("product_id"))},
                {"$inc": {"stock": -item.get("quantity", 0)}}
            )

        return {
            "order_id": order_id,
            "message": "Order placed successfully",
            "total_amount": order["total_amount"],
            "discount_applied": discount_amount
        }

    except Exception as e:
        print(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create order")


@app.get("/api/orders/{order_id}")
async def get_order(
        order_id: str,
        current_user: dict = Depends(get_current_user)
):
    """Get order details"""
    order = await db.orders.find_one({
        "order_id": order_id,
        "user_id": str(current_user["_id"])
    })

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order["_id"] = str(order["_id"])
    return order



#admin endpoint

@app.get("/api/admin/dashboard")
async def get_admin_dashboard(
        current_user: dict = Depends(get_current_user)
):
    """Get admin dashboard stats"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    # Get statistics
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({"is_active": True})
    total_orders = await db.orders.count_documents({})

    # Recent orders
    recent_orders = []
    cursor = db.orders.find().sort("created_at", -1).limit(10)
    async for order in cursor:
        order["_id"] = str(order["_id"])
        recent_orders.append(order)

    # Revenue calculation
    pipeline = [
        {"$match": {"order_status": {"$ne": "cancelled"}}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": "$total_amount"}
        }}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0

    return {
        "stats": {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": total_revenue
        },
        "recent_orders": recent_orders
    }


# Monthly revenue data endpoint
@app.get("/api/admin/analytics/monthly")
async def get_monthly_analytics(
        current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    # Aggregate monthly data
    pipeline = [
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"}
                },
                "revenue": {"$sum": "$total_amount"},
                "orders": {"$sum": 1}
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}}
    ]

    monthly_data = await db.orders.aggregate(pipeline).to_list(12)

    return {"monthly_data": monthly_data}


# Today's stats endpoint
@app.get("/api/admin/stats/today")
async def get_today_stats(
        current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    from datetime import datetime, timedelta

    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Today's orders
    today_orders = await db.orders.count_documents({
        "created_at": {"$gte": today}
    })

    # Today's revenue
    pipeline = [
        {"$match": {"created_at": {"$gte": today}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]

    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    today_revenue = revenue_result[0]["total"] if revenue_result else 0

    return {
        "today_orders": today_orders,
        "today_revenue": today_revenue
    }



@app.get("/api/admin/orders")
async def get_all_orders(
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        current_user: dict = Depends(get_current_user)
):
    """Get all orders (Admin only)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    query = {}
    if status:
        query["order_status"] = status

    orders = []
    cursor = db.orders.find(query).skip(skip).limit(limit).sort("created_at", -1)

    async for order in cursor:
        order["_id"] = str(order["_id"])
        orders.append(order)

    total = await db.orders.count_documents(query)

    return {
        "orders": orders,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }


@app.put("/api/admin/orders/{order_id}/status")
async def update_order_status(
        order_id: str,
        status: OrderStatus,
        current_user: dict = Depends(get_current_user)
):
    """Update order status (Admin only)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "order_status": status,
            "updated_at": datetime.utcnow()
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"message": f"Order status updated to {status}"}


@app.get("/api/admin/inventory")
async def get_inventory_status(
        current_user: dict = Depends(get_current_user)
):
    """Get low stock products (Admin only)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    # Products with stock < 10
    low_stock = []
    cursor = db.products.find({"stock": {"$lt": 10}, "is_active": True})

    async for product in cursor:
        product["id"] = str(product["_id"])
        del product["_id"]
        low_stock.append({
            "id": product["id"],
            "name": product["name"],
            "stock": product["stock"],
            "category": product["category"]
        })

    return {"low_stock_products": low_stock}


# -------------------- Customer Management Endpoints --------------------

@app.get("/api/admin/customers")
async def get_all_customers(
        skip: int = 0,
        limit: int = 100,
        current_user: dict = Depends(get_current_user)
):
    """Get all customers with order stats"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    customers = []
    cursor = db.users.find({}).skip(skip).limit(limit)

    async for user in cursor:
        user_id_str = str(user["_id"])

        # Count orders
        order_count = await db.orders.count_documents({"user_id": user_id_str})

        # Total spent
        pipeline = [
            {"$match": {"user_id": user_id_str}},
            {"$group": {"_id": None, "total_spent": {"$sum": "$total_amount"}}}
        ]
        spent_result = await db.orders.aggregate(pipeline).to_list(1)
        total_spent = spent_result[0]["total_spent"] if spent_result else 0

        # Get address from latest order
        order_with_address = await db.orders.find_one(
            {"user_id": user_id_str, "shipping_address": {"$exists": True}},
            sort=[("created_at", -1)]
        )

        customers.append({
            "id": str(user["_id"]),
            "_id": str(user["_id"]),
            "full_name": user.get("full_name", "N/A"),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "address": order_with_address["shipping_address"] if order_with_address else None,
            "total_orders": order_count,
            "total_spent": total_spent,
            "is_active": user.get("is_active", True),
            "created_at": user.get("created_at", datetime.utcnow()).isoformat()
        })

    return {"customers": customers}


@app.get("/api/admin/customers/stats")
async def get_customer_stats(current_user: dict = Depends(get_current_user)):
    """Get customer statistics"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    total_customers = await db.users.count_documents({})

    # Active customers
    pipeline = [
        {"$group": {"_id": "$user_id"}},
        {"$count": "active_customers"}
    ]
    active_result = await db.orders.aggregate(pipeline).to_list(1)
    active_customers = active_result[0]["active_customers"] if active_result else 0

    # Total revenue
    revenue_pipeline = [
        {"$match": {"order_status": {"$ne": "cancelled"}}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}, "order_count": {"$sum": 1}}}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)

    if revenue_result:
        total_revenue = revenue_result[0]["total_revenue"]
        total_orders = revenue_result[0]["order_count"]
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    else:
        total_revenue = 0
        avg_order_value = 0

    return {
        "total_customers": total_customers,
        "active_customers": active_customers,
        "total_revenue": total_revenue,
        "avg_order_value": avg_order_value
    }


@app.get("/api/admin/customers/{customer_id}/details")
async def get_customer_details(
        customer_id: str,
        current_user: dict = Depends(get_current_user)
):
    """Get customer details with orders"""
    from bson import ObjectId

    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    if not ObjectId.is_valid(customer_id):
        raise HTTPException(status_code=400, detail="Invalid customer ID")

    customer = await db.users.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer_id_str = str(customer["_id"])

    # Get orders
    orders = []
    cursor = db.orders.find({"user_id": customer_id_str}).sort("created_at", -1).limit(20)

    async for order in cursor:
        orders.append({
            "order_id": order["order_id"],
            "total_amount": order["total_amount"],
            "order_status": order["order_status"],
            "created_at": order["created_at"].isoformat()
        })

    return {
        "customer": {
            "id": customer_id_str,
            "full_name": customer.get("full_name", "N/A"),
            "email": customer.get("email", ""),
            "phone": customer.get("phone", ""),
            "total_orders": len(orders),
            "total_spent": sum(o["total_amount"] for o in orders),
            "is_active": customer.get("is_active", True),
            "created_at": customer.get("created_at", datetime.utcnow()).isoformat()
        },
        "orders": orders,
        "addresses": []
    }


@app.put("/api/admin/customers/{customer_id}/status")
async def update_customer_status(
        customer_id: str,
        status: dict,
        current_user: dict = Depends(get_current_user)
):
    """Update customer status (Admin only)"""
    from bson import ObjectId

    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    if not ObjectId.is_valid(customer_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid customer ID"
        )

    result = await db.users.update_one(
        {"_id": ObjectId(customer_id)},
        {"$set": {
            "is_active": status.get("is_active", True),
            "updated_at": datetime.utcnow()
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    return {"message": "Customer status updated successfully"}


@app.get("/api/admin/customers/export")
async def export_customers(
        format: str = "csv",
        current_user: dict = Depends(get_current_user)
):
    """Export customers data (Admin only)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    # Get all customers with their data
    customers = []
    cursor = db.users.find({})

    async for user in cursor:
        user_id_str = str(user["_id"])

        # Get order count and total spent
        order_count = await db.orders.count_documents({"user_id": user_id_str})

        pipeline = [
            {"$match": {"user_id": user_id_str}},
            {"$group": {
                "_id": None,
                "total_spent": {"$sum": "$total_amount"}
            }}
        ]
        spent_result = await db.orders.aggregate(pipeline).to_list(1)
        total_spent = spent_result[0]["total_spent"] if spent_result else 0

        customers.append({
            "Name": user.get("full_name", "N/A"),
            "Email": user.get("email", ""),
            "Phone": user.get("phone", ""),
            "Total Orders": order_count,
            "Total Spent": total_spent,
            "Status": "Active" if user.get("is_active", True) else "Inactive",
            "Joined Date": user.get("created_at", datetime.utcnow()).strftime("%Y-%m-%d")
        })

    if format == "csv":
        import csv
        import io

        output = io.StringIO()
        if customers:
            writer = csv.DictWriter(output, fieldnames=customers[0].keys())
            writer.writeheader()
            writer.writerows(customers)

        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=customers_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )

    return {"customers": customers}

#Brand Endpoints

@app.post("/api/brands", response_model=BrandResponse)
async def create_brand(
        brand: BrandCreate,
        current_user: dict = Depends(get_current_user)
):
    """Create new brand (Admin only)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    # Check if slug already exists
    existing = await db.brands.find_one({"slug": brand.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Brand slug already exists")

    brand_dict = brand.dict()
    brand_dict["created_at"] = datetime.utcnow()
    brand_dict["updated_at"] = datetime.utcnow()

    result = await db.brands.insert_one(brand_dict)
    brand_dict["id"] = str(result.inserted_id)

    return BrandResponse(**brand_dict)


@app.get("/api/brands", response_model=list[BrandResponse])
async def get_brands(
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
):
    """Get all brands"""
    query = {}
    if is_active is not None:
        query["is_active"] = is_active

    brands = []
    cursor = db.brands.find(query).skip(skip).limit(limit)

    async for brand in cursor:
        brand["id"] = str(brand["_id"])
        brands.append(BrandResponse(**brand))

    return brands


@app.put("/api/brands/{brand_id}", response_model=BrandResponse)
async def update_brand(
        brand_id: str,
        brand: BrandCreate,
        current_user: dict = Depends(get_current_user)
):
    """Update brand (Admin only)"""
    from bson import ObjectId

    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    if not ObjectId.is_valid(brand_id):
        raise HTTPException(status_code=400, detail="Invalid brand ID")

    brand_dict = brand.dict()
    brand_dict["updated_at"] = datetime.utcnow()

    result = await db.brands.update_one(
        {"_id": ObjectId(brand_id)},
        {"$set": brand_dict}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")

    updated_brand = await db.brands.find_one({"_id": ObjectId(brand_id)})
    updated_brand["id"] = str(updated_brand["_id"])

    return BrandResponse(**updated_brand)


@app.delete("/api/brands/{brand_id}")
async def delete_brand(
        brand_id: str,
        current_user: dict = Depends(get_current_user)
):
    """Delete brand (Admin only)"""
    from bson import ObjectId

    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    if not ObjectId.is_valid(brand_id):
        raise HTTPException(status_code=400, detail="Invalid brand ID")

    # Check if any products use this brand
    products_count = await db.products.count_documents({"brand": brand_id})
    if products_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete brand. {products_count} products are using this brand."
        )

    result = await db.brands.delete_one({"_id": ObjectId(brand_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")

    return {"message": "Brand deleted successfully"}


# user/orders

@app.get("/api/user/orders")
async def get_user_orders(
        skip: int = 0,
        limit: int = 10,
        current_user: dict = Depends(get_current_user)
):
    """Get current user's orders"""
    user_id = str(current_user["_id"])

    orders = []
    cursor = db.orders.find({"user_id": user_id}).skip(skip).limit(limit).sort("created_at", -1)

    async for order in cursor:
        order["_id"] = str(order["_id"])
        orders.append(order)

    total = await db.orders.count_documents({"user_id": user_id})

    return {
        "orders": orders,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }


@app.get("/api/user/orders")
async def get_user_orders(
        skip: int = 0,
        limit: int = 10,
        current_user: dict = Depends(get_current_user)
):
    """Get current user's orders"""
    user_id = str(current_user["_id"])

    orders = []
    cursor = db.orders.find({"user_id": user_id}).skip(skip).limit(limit).sort("created_at", -1)

    async for order in cursor:
        order["_id"] = str(order["_id"])
        orders.append(order)

    total = await db.orders.count_documents({"user_id": user_id})

    return {
        "orders": orders,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }


# Slider Endpoints

@app.post("/api/sliders", response_model=SliderResponse)
async def create_slider(
        slider: SliderCreate,
        current_user: dict = Depends(get_current_user)
):
    """Create new slider (Admin only)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    slider_dict = slider.dict()
    # Clean up empty strings to None
    if slider_dict.get("title") == "":
        slider_dict["title"] = None
    if slider_dict.get("subtitle") == "":
        slider_dict["subtitle"] = None
    if slider_dict.get("button_text") == "":
        slider_dict["button_text"] = None
    if slider_dict.get("button_link") == "":
        slider_dict["button_link"] = None

    slider_dict["created_at"] = datetime.utcnow()
    slider_dict["updated_at"] = datetime.utcnow()

    result = await db.sliders.insert_one(slider_dict)
    slider_dict["id"] = str(result.inserted_id)

    return SliderResponse(**slider_dict)


@app.get("/api/sliders", response_model=list[SliderResponse])
async def get_sliders(
        device_type: Optional[str] = None,
        is_active: Optional[bool] = None
):
    """Get all sliders with optional filters"""
    query = {}
    if device_type:
        query["device_type"] = device_type
    if is_active is not None:
        query["is_active"] = is_active

    sliders = []
    cursor = db.sliders.find(query).sort("order_index", 1)

    async for slider in cursor:
        slider["id"] = str(slider["_id"])
        sliders.append(SliderResponse(**slider))

    return sliders


@app.put("/api/sliders/{slider_id}", response_model=SliderResponse)
async def update_slider(
        slider_id: str,
        slider: SliderCreate,
        current_user: dict = Depends(get_current_user)
):
    """Update slider (Admin only)"""
    from bson import ObjectId

    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    if not ObjectId.is_valid(slider_id):
        raise HTTPException(status_code=400, detail="Invalid slider ID")

    slider_dict = slider.dict()
    slider_dict["updated_at"] = datetime.utcnow()

    result = await db.sliders.update_one(
        {"_id": ObjectId(slider_id)},
        {"$set": slider_dict}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Slider not found")

    updated_slider = await db.sliders.find_one({"_id": ObjectId(slider_id)})
    updated_slider["id"] = str(updated_slider["_id"])

    return SliderResponse(**updated_slider)


@app.patch("/api/sliders/{slider_id}/toggle")
async def toggle_slider_status(
        slider_id: str,
        status: dict,
        current_user: dict = Depends(get_current_user)
):
    """Toggle slider active status (Admin only)"""
    from bson import ObjectId

    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    if not ObjectId.is_valid(slider_id):
        raise HTTPException(status_code=400, detail="Invalid slider ID")

    result = await db.sliders.update_one(
        {"_id": ObjectId(slider_id)},
        {"$set": {
            "is_active": status.get("is_active", False),
            "updated_at": datetime.utcnow()
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Slider not found")

    return {"message": "Slider status updated"}


@app.delete("/api/sliders/{slider_id}")
async def delete_slider(
        slider_id: str,
        current_user: dict = Depends(get_current_user)
):
    """Delete slider (Admin only)"""
    from bson import ObjectId

    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    if not ObjectId.is_valid(slider_id):
        raise HTTPException(status_code=400, detail="Invalid slider ID")

    result = await db.sliders.delete_one({"_id": ObjectId(slider_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Slider not found")

    return {"message": "Slider deleted successfully"}


#  ADMIN ROLE MANAGEMENT Endpoints

@app.post("/api/admin/create-admin")
async def create_admin_user(
        admin_data: AdminUserCreate,
        current_user: dict = Depends(get_current_user)
):
    """Create new admin user (Super Admin only)"""
    # Check if current user is super admin
    if not current_user.get("is_admin", False) or current_user.get("role") != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Only super admins can create other admin users"
        )

    # Check if email already exists
    existing = await db.users.find_one({"email": admin_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create admin user
    admin_dict = admin_data.dict()
    admin_dict["password_hash"] = get_password_hash(admin_data.password)
    del admin_dict["password"]
    admin_dict["is_admin"] = True
    admin_dict["created_at"] = datetime.utcnow()
    admin_dict["updated_at"] = datetime.utcnow()

    result = await db.users.insert_one(admin_dict)

    return {"message": "Admin user created successfully", "user_id": str(result.inserted_id)}


@app.get("/api/admin/users")
async def get_admin_users(
        admins_only: bool = False,
        current_user: dict = Depends(get_current_user)
):
    """Get users or admin users (Admin only)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    query = {"is_admin": True} if admins_only else {}

    users = []
    cursor = db.users.find(query)

    async for user in cursor:
        user_data = {
            "id": str(user["_id"]),
            "full_name": user.get("full_name", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "role": user.get("role", "moderator"),
            "permissions": user.get("permissions", []),
            "is_active": user.get("is_active", True),
            "is_admin": user.get("is_admin", False),
            "created_at": user.get("created_at", datetime.utcnow()).isoformat()
        }
        users.append(user_data)

    return users


@app.put("/api/admin/users/{user_id}/permissions")
async def update_admin_permissions(
        user_id: str,
        permissions: dict,
        current_user: dict = Depends(get_current_user)
):
    """Update admin user permissions (Super Admin only)"""
    from bson import ObjectId

    if not current_user.get("is_admin", False) or current_user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "permissions": permissions.get("permissions", []),
            "updated_at": datetime.utcnow()
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Permissions updated successfully"}


@app.put("/api/admin/users/{user_id}/revoke")
async def revoke_admin_access(
        user_id: str,
        current_user: dict = Depends(get_current_user)
):
    """Revoke admin access (Super Admin only)"""
    from bson import ObjectId

    if not current_user.get("is_admin", False) or current_user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Check if trying to revoke own access
    if str(current_user["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="Cannot revoke your own admin access")

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "is_admin": False,
            "role": None,
            "permissions": [],
            "updated_at": datetime.utcnow()
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Admin access revoked successfully"}


# ========== COUPON ENDPOINTS ==========
@app.post("/api/coupons")
async def create_coupon(
        coupon: CouponCreate,
        current_user: dict = Depends(get_current_user)
):
    """Create new coupon (Admin only)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    # Check if coupon code already exists
    existing = await db.coupons.find_one({"code": coupon.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    coupon_dict = coupon.dict()
    coupon_dict["code"] = coupon_dict["code"].upper()
    coupon_dict["used_count"] = 0
    coupon_dict["created_at"] = datetime.utcnow()
    coupon_dict["updated_at"] = datetime.utcnow()

    # Parse datetime strings to datetime objects for MongoDB
    try:
        coupon_dict["valid_from"] = datetime.fromisoformat(coupon.valid_from.replace('Z', ''))
        coupon_dict["valid_until"] = datetime.fromisoformat(coupon.valid_until.replace('Z', ''))
    except:
        # Handle datetime-local format from HTML input
        coupon_dict["valid_from"] = datetime.strptime(coupon.valid_from, "%Y-%m-%dT%H:%M")
        coupon_dict["valid_until"] = datetime.strptime(coupon.valid_until, "%Y-%m-%dT%H:%M")

    result = await db.coupons.insert_one(coupon_dict)

    # Convert back to strings for response
    response_dict = coupon_dict.copy()
    response_dict["id"] = str(result.inserted_id)
    response_dict["valid_from"] = coupon_dict["valid_from"].isoformat()
    response_dict["valid_until"] = coupon_dict["valid_until"].isoformat()
    response_dict["created_at"] = coupon_dict["created_at"].isoformat()

    return response_dict


@app.get("/api/coupons")
async def get_coupons(
        is_active: Optional[bool] = None,
        current_user: dict = Depends(get_current_user)
):
    """Get all coupons (Admin only)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    query = {}
    if is_active is not None:
        query["is_active"] = is_active

    coupons = []
    cursor = db.coupons.find(query).sort("created_at", -1)

    async for coupon in cursor:
        # Convert ObjectId to string
        coupon["id"] = str(coupon["_id"])
        del coupon["_id"]

        # Convert datetime objects to strings
        if isinstance(coupon.get("valid_from"), datetime):
            coupon["valid_from"] = coupon["valid_from"].isoformat()
        if isinstance(coupon.get("valid_until"), datetime):
            coupon["valid_until"] = coupon["valid_until"].isoformat()
        if isinstance(coupon.get("created_at"), datetime):
            coupon["created_at"] = coupon["created_at"].isoformat()
        if isinstance(coupon.get("updated_at"), datetime):
            coupon["updated_at"] = coupon["updated_at"].isoformat()

        coupons.append(coupon)

    return coupons


@app.put("/api/coupons/{coupon_id}")
async def update_coupon(
        coupon_id: str,
        coupon: CouponCreate,
        current_user: dict = Depends(get_current_user)
):
    """Update coupon (Admin only)"""
    from bson import ObjectId

    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    if not ObjectId.is_valid(coupon_id):
        raise HTTPException(status_code=400, detail="Invalid coupon ID")

    coupon_dict = coupon.dict()
    coupon_dict["code"] = coupon_dict["code"].upper()
    coupon_dict["updated_at"] = datetime.utcnow()

    # Parse datetime strings
    try:
        coupon_dict["valid_from"] = datetime.fromisoformat(coupon.valid_from.replace('Z', ''))
        coupon_dict["valid_until"] = datetime.fromisoformat(coupon.valid_until.replace('Z', ''))
    except:
        coupon_dict["valid_from"] = datetime.strptime(coupon.valid_from, "%Y-%m-%dT%H:%M")
        coupon_dict["valid_until"] = datetime.strptime(coupon.valid_until, "%Y-%m-%dT%H:%M")

    result = await db.coupons.update_one(
        {"_id": ObjectId(coupon_id)},
        {"$set": coupon_dict}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")

    return {"message": "Coupon updated successfully"}


@app.delete("/api/coupons/{coupon_id}")
async def delete_coupon(
        coupon_id: str,
        current_user: dict = Depends(get_current_user)
):
    """Delete coupon (Admin only)"""
    from bson import ObjectId

    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    if not ObjectId.is_valid(coupon_id):
        raise HTTPException(status_code=400, detail="Invalid coupon ID")

    result = await db.coupons.delete_one({"_id": ObjectId(coupon_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")

    return {"message": "Coupon deleted successfully"}


@app.post("/api/coupons/validate")
async def validate_coupon(
        data: dict,
        current_user: dict = Depends(get_current_user)
):
    """Validate coupon code and calculate discount"""
    try:
        code = data.get("code", "").upper().strip()
        order_amount = float(data.get("order_amount", 0))

        if not code:
            raise HTTPException(status_code=400, detail="Coupon code is required")

        if order_amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid order amount")

        # Find coupon
        coupon = await db.coupons.find_one({"code": code})

        if not coupon:
            raise HTTPException(status_code=404, detail="Invalid coupon code")

        # Check if active
        if not coupon.get("is_active", False):
            raise HTTPException(status_code=400, detail="This coupon is not active")

        # Check validity period
        now = datetime.utcnow()
        valid_from = coupon.get("valid_from")
        valid_until = coupon.get("valid_until")

        # Convert to datetime if string
        if isinstance(valid_from, str):
            valid_from = datetime.fromisoformat(valid_from)
        if isinstance(valid_until, str):
            valid_until = datetime.fromisoformat(valid_until)

        if valid_from and now < valid_from:
            raise HTTPException(status_code=400, detail="This coupon is not yet valid")

        if valid_until and now > valid_until:
            raise HTTPException(status_code=400, detail="This coupon has expired")

        # Check usage limit
        usage_limit = coupon.get("usage_limit")
        used_count = coupon.get("used_count", 0)

        if usage_limit and used_count >= usage_limit:
            raise HTTPException(status_code=400, detail="This coupon has reached its usage limit")

        # Check minimum order amount
        min_order = coupon.get("min_order_amount", 0)
        if min_order and order_amount < min_order:
            raise HTTPException(
                status_code=400,
                detail=f"Minimum order amount of ৳{min_order} is required for this coupon"
            )

        # Calculate discount
        discount_type = coupon.get("discount_type", "fixed")
        discount_value = float(coupon.get("discount_value", 0))
        discount_amount = 0

        if discount_type == "percentage":
            discount_amount = (order_amount * discount_value) / 100
            # Apply max discount cap if set
            max_discount = coupon.get("max_discount")
            if max_discount and discount_amount > max_discount:
                discount_amount = float(max_discount)
        else:  # fixed
            discount_amount = min(discount_value, order_amount)

        # Round to 2 decimal places
        discount_amount = round(discount_amount, 2)
        final_amount = round(order_amount - discount_amount, 2)

        return {
            "valid": True,
            "code": code,
            "discount_type": discount_type,
            "discount_value": discount_value,
            "discount_amount": discount_amount,
            "final_amount": final_amount,
            "message": f"Coupon applied successfully! You saved ৳{discount_amount}"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error validating coupon: {str(e)}")
        raise HTTPException(status_code=500, detail="Error validating coupon")

# RAMADAN FLAT DISCOUNT

@app.get("/api/settings/ramadan-discount")
async def get_ramadan_discount():
    """Get active Ramadan discount"""
    discount = await db.settings.find_one({"type": "ramadan_discount", "is_active": True})
    if discount:
        return {
            "active": True,
            "discount_amount": discount.get("discount_amount", 0),  # Fixed amount
            "message": discount.get("message", "")
        }
    return {"active": False}


@app.post("/api/admin/settings/ramadan-discount")
async def set_ramadan_discount(
        data: dict,
        current_user: dict = Depends(get_current_user)
):
    """Set Ramadan discount (Admin only)"""
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    await db.settings.update_one(
        {"type": "ramadan_discount"},
        {"$set": {
            "type": "ramadan_discount",
            "discount_amount": data.get("discount_amount", 0),  # Fixed amount
            "message": data.get("message", ""),
            "is_active": data.get("is_active", False),
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    return {"message": "Ramadan discount updated"}



if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)