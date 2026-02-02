from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from typing import Optional
import shutil
from pathlib import Path
from datetime import datetime
from app.models.user import UserInDB
from app.utils.auth import get_current_user
from app.utils.database import get_database
from bson import ObjectId

router = APIRouter(prefix="/api/health-records", tags=["health-records"])

# Directory to store uploaded files
UPLOAD_DIR = Path("uploads/health_records")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_record(
    file: UploadFile = File(...),
    category: str = Form(...),
    title: str = Form(...),
    date: str = Form(...),
    notes: Optional[str] = Form(""),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Upload a health record document"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    # Validate file type
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: PDF, JPEG, PNG"
        )
    
    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    file_extension = Path(file.filename).suffix
    filename = f"{current_user.id}_{timestamp}{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create database record
    record_data = {
        "user_id": current_user.id,
        "category": category,
        "title": title,
        "date": date,
        "notes": notes,
        "filename": filename,
        "file_url": f"/uploads/health_records/{filename}",
        "created_at": datetime.utcnow().isoformat()
    }
    
    try:
        result = await db.health_records.insert_one(record_data)
        record_data["id"] = str(result.inserted_id)
        return record_data
    except Exception as e:
        # Clean up file if database insert fails
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to save record: {str(e)}")

@router.get("")
async def get_records(
    category: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get user's health records"""
    try:
        if db is None:
            return []
        
        query = {"user_id": current_user.id}
        if category:
            query["category"] = category
        
        records = await db.health_records.find(query).sort("date", -1).to_list(length=100)
        
        # Convert ObjectId to string for JSON serialization
        result = []
        for record in records:
            record["id"] = str(record["_id"])
            del record["_id"]  # Remove the ObjectId field
            result.append(record)
        
        return result
    except Exception as e:
        print(f"Error fetching health records: {e}")
        return []

@router.delete("/{record_id}")
async def delete_record(
    record_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a health record"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    try:
        record = await db.health_records.find_one({
            "_id": ObjectId(record_id), 
            "user_id": current_user.id
        })
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        
        # Delete file
        file_path = UPLOAD_DIR / record["filename"]
        if file_path.exists():
            file_path.unlink()
        
        # Delete database record
        await db.health_records.delete_one({"_id": ObjectId(record_id)})
        return {"message": "Record deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{record_id}/download")
async def download_record(
    record_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Download a health record file"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    try:
        record = await db.health_records.find_one({
            "_id": ObjectId(record_id), 
            "user_id": current_user.id
        })
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        
        file_path = UPLOAD_DIR / record["filename"]
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            file_path, 
            filename=record["title"] + Path(record["filename"]).suffix,
            media_type='application/octet-stream'
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

