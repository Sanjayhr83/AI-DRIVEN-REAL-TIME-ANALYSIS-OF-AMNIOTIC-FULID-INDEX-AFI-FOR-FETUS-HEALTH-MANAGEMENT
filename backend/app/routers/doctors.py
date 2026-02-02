from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.models.user import UserInDB
from app.utils.auth import get_current_user
from app.utils.database import get_database
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api", tags=["doctors"])

@router.get("/doctors")
async def get_doctors(
    specialty: Optional[str] = None,
    location: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get list of available doctors"""
    try:
        if db is None:
            # Return sample doctors if database is not available
            return [
                {
                    "id": "1",
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
                    "id": "2",
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
                    "id": "3",
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
        
        doctors_list = []
        seen_emails = set()  # To avoid duplicates
        
        # Get from doctors collection first
        query = {}
        if specialty:
            query["specialty"] = {"$regex": specialty, "$options": "i"}
        if location:
            query["$or"] = [
                {"location": {"$regex": location, "$options": "i"}},
                {"city": {"$regex": location, "$options": "i"}}
            ]
        
        doctors = await db.doctors.find(query).to_list(length=100)
        for doctor in doctors:
            doctor["id"] = str(doctor["_id"])
            if doctor.get("email"):
                seen_emails.add(doctor["email"])
            doctors_list.append(doctor)
        
        # Get registered doctors from users collection (avoid duplicates)
        user_doctors = await db.users.find({"role": "doctor"}).to_list(length=100)
        for user_doctor in user_doctors:
            if user_doctor["email"] not in seen_emails:
                doctor_data = {
                    "id": str(user_doctor["_id"]),
                    "name": user_doctor["full_name"],
                    "specialty": user_doctor.get("specialty", "General Practitioner"),
                    "experience": user_doctor.get("experience", 5),
                    "rating": user_doctor.get("rating", 4.5),
                    "reviews_count": user_doctor.get("reviews_count", 0),
                    "consultation_fee": user_doctor.get("consultation_fee", 1000),
                    "location": user_doctor.get("location", "Available Online"),
                    "city": user_doctor.get("city", "Available"),
                    "clinic_name": user_doctor.get("clinic_name", "Private Practice"),
                    "next_available": "Available Today",
                    "email": user_doctor["email"]
                }
                doctors_list.append(doctor_data)
                seen_emails.add(user_doctor["email"])
        
        print(f"Found {len(doctors_list)} doctors total")
        return doctors_list
    except Exception as e:
        print(f"Error fetching doctors: {e}")
        # Return sample doctors on error
        return [
            {
                "id": "1",
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
                "id": "2",
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
                "id": "3",
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

@router.get("/doctors/{doctor_id}")
async def get_doctor_details(
    doctor_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get detailed information about a doctor"""
    try:
        if db is None:
            # Return sample doctor if database is not available
            sample_doctors = {
                "1": {
                    "id": "1",
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
                }
            }
            return sample_doctors.get(doctor_id, sample_doctors["1"])
        
        doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        doctor["id"] = str(doctor["_id"])
        return doctor
    except Exception as e:
        print(f"Error fetching doctor details: {e}")
        # Return sample doctor on error
        return {
            "id": doctor_id,
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
        }

@router.get("/doctors/init")
async def init_sample_doctors():
    """Initialize sample doctors data"""
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
            return {"message": f"Initialized {len(result.inserted_ids)} doctors"}
        else:
            client.close()
            return {"message": f"Database already has {count} doctors"}
            
    except Exception as e:
        return {"error": str(e)}

