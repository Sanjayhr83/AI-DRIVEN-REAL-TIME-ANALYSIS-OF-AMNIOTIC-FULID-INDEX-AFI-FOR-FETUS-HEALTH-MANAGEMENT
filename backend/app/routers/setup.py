from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/setup", tags=["setup"])

@router.get("/doctors")
async def setup_doctors():
    """Initialize doctors without authentication"""
    try:
        mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.getenv("DATABASE_NAME", "amniotic_fluid_db")
        
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        doctors = [
            {
                "name": "Dr. Sarah Johnson",
                "specialty": "Gynecologist",
                "experience": 12,
                "rating": 4.9,
                "reviews_count": 245,
                "consultation_fee": 1500,
                "location": "MG Road",
                "city": "Bangalore",
                "clinic_name": "City Hospital",
                "next_available": "Tomorrow, 10:00 AM"
            },
            {
                "name": "Dr. Michael Chen",
                "specialty": "Radiologist",
                "experience": 8,
                "rating": 4.8,
                "reviews_count": 189,
                "consultation_fee": 1200,
                "location": "Koramangala",
                "city": "Bangalore",
                "clinic_name": "Advanced Imaging Center",
                "next_available": "Today, 2:00 PM"
            },
            {
                "name": "Dr. Emily Rodriguez",
                "specialty": "Obstetrician",
                "experience": 15,
                "rating": 4.9,
                "reviews_count": 312,
                "consultation_fee": 1800,
                "location": "Indiranagar",
                "city": "Bangalore",
                "clinic_name": "Women's Health Clinic",
                "next_available": "Tomorrow, 11:00 AM"
            }
        ]
        
        count = await db.doctors.count_documents({})
        if count == 0:
            result = await db.doctors.insert_many(doctors)
            client.close()
            return {"success": True, "message": f"Initialized {len(result.inserted_ids)} doctors"}
        else:
            client.close()
            return {"success": True, "message": f"Database already has {count} doctors"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}