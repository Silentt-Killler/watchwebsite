from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from app.schemas.user import UserRegister, UserLogin, UserResponse, Token
from app.models.user import UserModel
from app.core.security import get_password_hash, verify_password, create_access_token, verify_token
from app.db.database import get_database
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    """Register new user"""
    db = get_database()

    # Check if passwords match
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or phone already exists"
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

    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)

    return UserResponse(**user_dict)

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user"""
    db = get_database()

    # Find user by email or phone
    user = await db.users.find_one({
        "$or": [
            {"email": user_data.email_or_phone},
            {"phone": user_data.email_or_phone}
        ]
    })

    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/phone or password"
        )

    # Create token
    access_token = create_access_token(data={"sub": user["email"]})

    return Token(access_token=access_token)

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user info"""
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    db = get_database()
    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user["id"] = str(user["_id"])
    return UserResponse(**user)