# backend/create_admin_simple.py
import asyncio
from pymongo import MongoClient
from passlib.context import CryptContext
from datetime import datetime
from urllib.parse import quote_plus

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# আপনার ACTUAL MongoDB credentials দিন (main.py থেকে copy করুন)
username = quote_plus("timoraAdmin")  # Your actual username
password = quote_plus("n@zi@redow@n")  # Your actual password
cluster = "timora-cluster.ruaqmjs.mongodb.net"  # Your actual cluster address

url = f"mongodb+srv://{username}:{password}@{cluster}/timora_db?retryWrites=true&w=majority"

print(f"Connecting to MongoDB...")

try:
    client = MongoClient(url)
    db = client.timora_db

    # Test connection
    client.server_info()
    print("✅ Connected to MongoDB")

    # Check if admin exists
    if db.users.find_one({"email": "admin@timora.com"}):
        print("Admin already exists")
    else:
        admin_user = {
            "full_name": "Admin User",
            "email": "admin@timora.com",
            "phone": "0000000000",
            "password_hash": pwd_context.hash("admin123"),
            "is_active": True,
            "is_admin": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = db.users.insert_one(admin_user)
        print(f"✅ Admin created")
        print("📧 Email: admin@timora.com")
        print("🔑 Password: admin123")

    client.close()

except Exception as e:
    print(f"❌ Error: {e}")