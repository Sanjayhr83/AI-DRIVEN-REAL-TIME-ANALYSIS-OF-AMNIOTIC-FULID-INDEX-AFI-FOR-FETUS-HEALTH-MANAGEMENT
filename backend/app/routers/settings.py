from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.models.user import UserInDB
from app.utils.auth import get_current_user
from app.utils.database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/auth", tags=["settings"])

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    phone: Optional[str] = None
    pregnancy_week: Optional[int] = None

class SettingsUpdate(BaseModel):
    notifications: Optional[Dict[str, Any]] = None
    privacy: Optional[Dict[str, Any]] = None
    appearance: Optional[Dict[str, Any]] = None

@router.put("/profile")
async def update_profile(
    profile: ProfileUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update user profile"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    update_data = {}
    if profile.full_name is not None:
        update_data["full_name"] = profile.full_name
    if profile.specialization is not None:
        update_data["specialization"] = profile.specialization
    if profile.phone is not None:
        update_data["phone"] = profile.phone
    if profile.pregnancy_week is not None:
        update_data["pregnancy_week"] = profile.pregnancy_week
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update profile")
    
    # Fetch updated user
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    updated_user["id"] = str(updated_user["_id"])
    
    return updated_user

@router.put("/settings")
async def update_settings(
    settings: SettingsUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update user settings"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    settings_data = {}
    if settings.notifications is not None:
        settings_data["notifications"] = settings.notifications
    if settings.privacy is not None:
        settings_data["privacy"] = settings.privacy
    if settings.appearance is not None:
        settings_data["appearance"] = settings.appearance
    
    if not settings_data:
        raise HTTPException(status_code=400, detail="No settings to update")
    
    settings_data["settings_updated_at"] = datetime.utcnow().isoformat()
    
    # Update or insert settings
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"settings": settings_data, "updated_at": datetime.utcnow().isoformat()}},
        upsert=False
    )
    
    return {"message": "Settings updated successfully", "settings": settings_data}

@router.get("/settings")
async def get_settings(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get user settings"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.get("settings", {
        "notifications": {"email": True, "push": False, "analysis": True},
        "privacy": {"shareData": False, "analytics": True},
        "appearance": {"compactView": False}
    })

