from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from app.models.user import UserInDB
from app.utils.auth import get_current_user
from app.utils.database import get_database
from bson import ObjectId

router = APIRouter(prefix="/api/external", tags=["external"])

@router.get("/search-doctors")
async def search_doctors(
    location: Optional[str] = None,
    name: Optional[str] = None,
    specialty: Optional[str] = None,
    availability: Optional[str] = None,
    min_rating: float = 0,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Search for doctors with filters"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    query = {}
    or_conditions = []
    
    # Build search query
    if location:
        or_conditions.extend([
            {"location": {"$regex": location, "$options": "i"}},
            {"city": {"$regex": location, "$options": "i"}},
            {"pincode": {"$regex": location, "$options": "i"}}
        ])
    
    if name:
        or_conditions.append({"name": {"$regex": name, "$options": "i"}})
    
    if or_conditions:
        query["$or"] = or_conditions
    
    if specialty:
        query["specialty"] = {"$regex": specialty, "$options": "i"}
    
    if min_rating > 0:
        query["rating"] = {"$gte": min_rating}
    
    # Fetch doctors
    doctors = await db.doctors.find(query).to_list(length=100)
    
    # Convert ObjectId to string
    result = []
    for doctor in doctors:
        doctor["id"] = str(doctor["_id"])
        result.append(doctor)
    
    return result

@router.get("/specialties")
async def get_specialties(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get list of all specialties"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    specialties = await db.doctors.distinct("specialty")
    return sorted(specialties)

@router.get("/doctors/{doctor_id}")
async def get_doctor_details(
    doctor_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get detailed information about a doctor"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    try:
        doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        doctor["id"] = str(doctor["_id"])
        return doctor
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

