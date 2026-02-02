"""
Script to initialize sample doctors in MongoDB
Run this script to populate the doctors collection with sample data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def init_doctors():
    """Initialize sample doctors data"""
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DATABASE_NAME", "amniotic_fluid_db")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Sample doctors data
    doctors = [
        {
            "name": "Sarah Johnson",
            "specialty": "Gynecologist",
            "experience": 12,
            "rating": 4.9,
            "reviews_count": 245,
            "consultation_fee": 1500,
            "location": "MG Road",
            "city": "Bangalore",
            "pincode": "560001",
            "clinic_name": "City Hospital",
            "avatar": "",
            "next_available": "Tomorrow, 10:00 AM"
        },
        {
            "name": "Michael Chen",
            "specialty": "Radiologist",
            "experience": 8,
            "rating": 4.8,
            "reviews_count": 189,
            "consultation_fee": 1200,
            "location": "Koramangala",
            "city": "Bangalore",
            "pincode": "560095",
            "clinic_name": "Advanced Imaging Center",
            "avatar": "",
            "next_available": "Today, 2:00 PM"
        },
        {
            "name": "Emily Rodriguez",
            "specialty": "Obstetrician",
            "experience": 15,
            "rating": 4.9,
            "reviews_count": 312,
            "consultation_fee": 1800,
            "location": "Indiranagar",
            "city": "Bangalore",
            "pincode": "560038",
            "clinic_name": "Women's Health Clinic",
            "avatar": "",
            "next_available": "Tomorrow, 11:00 AM"
        },
        {
            "name": "Rajesh Kumar",
            "specialty": "Gynecologist",
            "experience": 10,
            "rating": 4.7,
            "reviews_count": 156,
            "consultation_fee": 1300,
            "location": "Whitefield",
            "city": "Bangalore",
            "pincode": "560066",
            "clinic_name": "Kumar Medical Center",
            "avatar": "",
            "next_available": "Today, 4:00 PM"
        },
        {
            "name": "Priya Sharma",
            "specialty": "Obstetrician",
            "experience": 14,
            "rating": 4.8,
            "reviews_count": 278,
            "consultation_fee": 1600,
            "location": "JP Nagar",
            "city": "Bangalore",
            "pincode": "560078",
            "clinic_name": "Sharma Maternity Hospital",
            "avatar": "",
            "next_available": "Tomorrow, 9:00 AM"
        },
        {
            "name": "David Wilson",
            "specialty": "Radiologist",
            "experience": 11,
            "rating": 4.6,
            "reviews_count": 201,
            "consultation_fee": 1400,
            "location": "BTM Layout",
            "city": "Bangalore",
            "pincode": "560076",
            "clinic_name": "Wilson Diagnostic Center",
            "avatar": "",
            "next_available": "Today, 3:00 PM"
        },
        {
            "name": "Anita Desai",
            "specialty": "Gynecologist",
            "experience": 9,
            "rating": 4.7,
            "reviews_count": 134,
            "consultation_fee": 1250,
            "location": "HSR Layout",
            "city": "Bangalore",
            "pincode": "560102",
            "clinic_name": "Desai Women's Clinic",
            "avatar": "",
            "next_available": "Tomorrow, 2:00 PM"
        },
        {
            "name": "James Anderson",
            "specialty": "Obstetrician",
            "experience": 13,
            "rating": 4.9,
            "reviews_count": 267,
            "consultation_fee": 1700,
            "location": "Marathahalli",
            "city": "Bangalore",
            "pincode": "560037",
            "clinic_name": "Anderson Medical Center",
            "avatar": "",
            "next_available": "Today, 5:00 PM"
        }
    ]
    
    try:
        # Clear existing doctors (optional - comment out if you want to keep existing)
        # await db.doctors.delete_many({})
        
        # Insert doctors
        result = await db.doctors.insert_many(doctors)
        print(f"✅ Successfully inserted {len(result.inserted_ids)} doctors")
        
        # Verify insertion
        count = await db.doctors.count_documents({})
        print(f"✅ Total doctors in database: {count}")
        
    except Exception as e:
        print(f"❌ Error inserting doctors: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(init_doctors())

