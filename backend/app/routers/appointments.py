from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, date, timedelta
from app.models.user import UserInDB
from app.utils.auth import get_current_user
from app.utils.database import get_database
from pydantic import BaseModel
from bson import ObjectId

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

class AppointmentCreate(BaseModel):
    doctor_id: str
    date: str
    time_slot: str
    reason: Optional[str] = "Regular checkup"

class ConsultationUpdate(BaseModel):
    """Update appointment status with consultation details"""
    status: str  # 'completed', 'cancelled', etc.
    consultation_details: Optional[dict] = None  # consultation_duration, consultation_type, etc.

@router.get("/slots")
async def get_available_slots(
    doctor_id: str = Query(...),
    date: str = Query(...),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get available time slots for a doctor on a specific date"""
    try:
        # Standard appointment slots (9 AM - 5 PM, 30-minute intervals)
        all_slots = []
        for hour in range(9, 17):
            for minute in [0, 30]:
                all_slots.append(f"{hour:02d}:{minute:02d}")
        
        if db is None:
            # Return all slots as available if database is not available
            return [{"time": slot} for slot in all_slots]
        
        # Get already booked slots
        booked_appointments = await db.appointments.find({
            "doctor_id": doctor_id,
            "date": date,
            "status": {"$ne": "cancelled"}
        }).to_list(length=100)
        
        booked_slots = [apt["time_slot"] for apt in booked_appointments]
        
        # Return available slots
        available = [{"time": slot} for slot in all_slots if slot not in booked_slots]
        return available
    except Exception as e:
        print(f"Error fetching available slots: {e}")
        # Return all slots as available on error
        all_slots = []
        for hour in range(9, 17):
            for minute in [0, 30]:
                all_slots.append(f"{hour:02d}:{minute:02d}")
        return [{"time": slot} for slot in all_slots]

@router.post("/book")
async def book_appointment(
    appointment: AppointmentCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Book a new appointment"""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection unavailable")
        
        # Check if slot is still available
        existing = await db.appointments.find_one({
            "doctor_id": appointment.doctor_id,
            "date": appointment.date,
            "time_slot": appointment.time_slot,
            "status": {"$ne": "cancelled"}
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Slot already booked")
        
        # Create appointment with proper patient_id
        appointment_data = {
            "patient_id": str(current_user.id),
            "doctor_id": appointment.doctor_id,
            "date": appointment.date,
            "time_slot": appointment.time_slot,
            "reason": appointment.reason,
            "status": "scheduled",
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Insert into database
        result = await db.appointments.insert_one(appointment_data)
        appointment_data["id"] = str(result.inserted_id)
        appointment_data["_id"] = str(result.inserted_id)
        
        # Verify the appointment was saved
        saved_appointment = await db.appointments.find_one({"_id": result.inserted_id})
        print(f"Appointment saved to DB: {saved_appointment is not None}")
        print(f"Appointment booked successfully: {appointment_data}")
        
        # Also log total appointments for this patient
        total_appointments = await db.appointments.count_documents({"patient_id": str(current_user.id)})
        print(f"Total appointments for patient {current_user.id}: {total_appointments}")
        
        return appointment_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error booking appointment: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to book appointment: {str(e)}")

@router.get("/my-appointments")
async def get_my_appointments(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get current user's appointments"""
    try:
        if db is None:
            return []
        
        # Query with string patient_id
        patient_id_str = str(current_user.id)
        print(f"Searching appointments for patient_id: {patient_id_str}")
        
        appointments = await db.appointments.find({
            "patient_id": patient_id_str
        }).sort("date", -1).to_list(length=100)
        
        print(f"Found {len(appointments)} appointments for patient {current_user.id}")
        
        # Debug: Show all appointments in database
        all_appointments = await db.appointments.find({}).to_list(length=10)
        print(f"Total appointments in DB: {len(all_appointments)}")
        for apt in all_appointments:
            print(f"  - Patient: {apt.get('patient_id')}, Doctor: {apt.get('doctor_id')}, Date: {apt.get('date')}")
        
        # Convert ObjectId to string and add doctor names
        for apt in appointments:
            apt["id"] = str(apt["_id"])
            # Get doctor name from both doctors and users collections
            if apt.get("doctor_id"):
                try:
                    # Try doctors collection first
                    doctor = await db.doctors.find_one({"_id": ObjectId(apt["doctor_id"])})
                    if doctor:
                        apt["doctor_name"] = doctor.get("name", "Unknown Doctor")
                        apt["specialty"] = doctor.get("specialty", "General")
                    else:
                        # Try users collection
                        user_doctor = await db.users.find_one({"_id": ObjectId(apt["doctor_id"])})
                        if user_doctor:
                            apt["doctor_name"] = user_doctor.get("full_name", "Unknown Doctor")
                            apt["specialty"] = user_doctor.get("specialty", "General")
                        else:
                            apt["doctor_name"] = "Unknown Doctor"
                            apt["specialty"] = "General"
                except Exception as e:
                    print(f"Error getting doctor info: {e}")
                    apt["doctor_name"] = "Unknown Doctor"
                    apt["specialty"] = "General"
        
        return appointments
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return []


@router.patch("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    update_data: ConsultationUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Update appointment status with consultation details.
    Used to mark consultation as completed after telecall.
    
    Args:
        appointment_id: The appointment ID to update
        update_data: Status and consultation details
        current_user: Authenticated user
        db: Database connection
    
    Returns:
        Updated appointment data
    """
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection unavailable")
        
        # Convert appointment_id to ObjectId
        try:
            apt_id = ObjectId(appointment_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid appointment ID format")
        
        # Find the appointment
        appointment = await db.appointments.find_one({"_id": apt_id})
        
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Verify the appointment belongs to the current user
        if appointment.get("patient_id") != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
        
        # Prepare update data
        update_dict = {
            "status": update_data.status,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Add consultation details if provided
        if update_data.consultation_details:
            update_dict["consultation_details"] = update_data.consultation_details
            print(f"Consultation details: {update_data.consultation_details}")
        
        # Update the appointment
        result = await db.appointments.update_one(
            {"_id": apt_id},
            {"$set": update_dict}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to update appointment")
        
        # Retrieve and return the updated appointment
        updated_appointment = await db.appointments.find_one({"_id": apt_id})
        updated_appointment["id"] = str(updated_appointment["_id"])
        
        print(f"Appointment {appointment_id} updated to status: {update_data.status}")
        print(f"Consultation duration: {update_data.consultation_details.get('consultation_duration', 'N/A') if update_data.consultation_details else 'N/A'} seconds")
        
        return updated_appointment
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating appointment status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update appointment: {str(e)}")
