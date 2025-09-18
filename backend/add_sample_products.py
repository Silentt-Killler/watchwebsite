import requests
import json

# Login as admin first
login_data = {
    "email_or_phone": "admin@timora.com",
    "password": "admin123"
}

response = requests.post("http://localhost:8000/api/auth/login", json=login_data)
if response.status_code != 200:
    print("Login failed")
    exit(1)

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Sample products
products = [
    {
        "name": "Titan Raga Viva Silver Dial",
        "description": "Elegant silver dial watch with leather strap",
        "price": 9406.25,
        "category": "women",
        "brand": "Titan",
        "stock": 10,
        "images": ["/images/products/watch1.jpg"],
        "is_featured": True,
        "is_active": True
    },
    {
        "name": "Casio G-Shock Black",
        "description": "Durable sports watch with multiple features",
        "price": 15500.00,
        "category": "men",
        "brand": "Casio",
        "stock": 15,
        "images": ["/images/products/watch2.jpg"],
        "is_featured": True,
        "is_active": True
    },
    {
        "name": "Seiko Couple Edition",
        "description": "Matching couple watches with premium build",
        "price": 25000.00,
        "category": "couple",
        "brand": "Seiko",
        "stock": 5,
        "images": ["/images/products/watch3.jpg"],
        "is_featured": True,
        "is_active": True
    },
    {
        "name": "Citizen Eco-Drive",
        "description": "Solar powered watch with perpetual calendar",
        "price": 18900.00,
        "category": "men",
        "brand": "Citizen",
        "stock": 8,
        "images": ["/images/products/watch4.jpg"],
        "is_featured": True,
        "is_active": True
    }
]

# Add products
for product in products:
    response = requests.post(
        "http://localhost:8000/api/products",
        json=product,
        headers=headers
    )
    if response.status_code == 200:
        print(f"✅ Added: {product['name']}")
    else:
        print(f"❌ Failed to add: {product['name']}")
        print(response.json())

print("\n✅ Sample products added!")