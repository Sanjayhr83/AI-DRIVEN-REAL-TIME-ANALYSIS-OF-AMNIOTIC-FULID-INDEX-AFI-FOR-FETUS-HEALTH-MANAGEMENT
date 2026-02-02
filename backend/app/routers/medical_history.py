from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from app.models.user import UserInDB
from app.utils.auth import get_current_user
from app.utils.database import get_database
from bson import ObjectId

router = APIRouter(prefix="/api/medical-history", tags=["medical-history"])

@router.get("")
async def get_medical_history(
    filter: Optional[str] = Query("all"),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get user's complete medical history"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    history_items = []
    
    # Fetch appointments
    if filter in ["all", "appointment"]:
        appointments = await db.appointments.find({
            "patient_id": current_user.id
        }).sort("date", -1).to_list(length=100)
        
        for apt in appointments:
            # Get doctor name
            doctor_name = "Unknown Doctor"
            if apt.get("doctor_id"):
                try:
                    doctor = await db.doctors.find_one({"_id": ObjectId(apt["doctor_id"])})
                    if doctor:
                        doctor_name = doctor.get("name", "Unknown Doctor")
                except:
                    pass
            
            history_items.append({
                "id": str(apt["_id"]),
                "type": "appointment",
                "title": f"Appointment with Dr. {doctor_name}",
                "description": apt.get("reason", "Regular consultation"),
                "date": apt.get("date", apt.get("created_at", datetime.utcnow().isoformat())),
                "details": {
                    "doctor_id": apt.get("doctor_id"),
                    "time_slot": apt.get("time_slot"),
                    "status": apt.get("status", "scheduled")
                }
            })
    
    # Fetch test results/predictions
    if filter in ["all", "test", "ultrasound"]:
        # For patients, get predictions by patient_id or user_id
        # For doctors, get predictions by doctor_id
        if current_user.role == "patient":
            predictions = await db.predictions.find({
                "$or": [
                    {"patient_id": current_user.id},
                    {"user_id": current_user.id}
                ]
            }).sort("created_at", -1).to_list(length=100)
        else:
            predictions = await db.predictions.find({
                "doctor_id": current_user.id
            }).sort("created_at", -1).to_list(length=100)
        
        for pred in predictions:
            history_items.append({
                "id": str(pred["_id"]),
                "type": "ultrasound",
                "title": "AFI Ultrasound Analysis",
                "description": f"Result: {pred.get('class_prediction', 'Unknown')} (Confidence: {(pred.get('confidence', 0) * 100):.1f}%)",
                "date": pred.get("created_at", datetime.utcnow().isoformat()),
                "details": {
                    "classification": pred.get("class_prediction"),
                    "confidence": pred.get("confidence"),
                    "probabilities": pred.get("probabilities", {})
                }
            })
    
    # Fetch prescriptions from health records
    if filter in ["all", "prescription"]:
        prescriptions = await db.health_records.find({
            "user_id": current_user.id,
            "category": "prescription"
        }).sort("date", -1).to_list(length=100)
        
        for presc in prescriptions:
            history_items.append({
                "id": str(presc["_id"]),
                "type": "prescription",
                "title": presc.get("title", "Prescription"),
                "description": presc.get("notes", ""),
                "date": presc.get("date", presc.get("created_at", datetime.utcnow().isoformat())),
                "details": presc
            })
    
    # Fetch other health records
    if filter in ["all", "report"]:
        reports = await db.health_records.find({
            "user_id": current_user.id,
            "category": {"$in": ["medical_report", "lab_test", "ultrasound"]}
        }).sort("date", -1).to_list(length=100)
        
        for report in reports:
            history_items.append({
                "id": str(report["_id"]),
                "type": "report",
                "title": report.get("title", "Medical Report"),
                "description": report.get("notes", f"{report.get('category', 'Report')} document"),
                "date": report.get("date", report.get("created_at", datetime.utcnow().isoformat())),
                "details": report
            })
    
    # Sort by date descending
    history_items.sort(key=lambda x: x["date"], reverse=True)
    
    return history_items

