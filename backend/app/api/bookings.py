import uuid
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

# Global in-memory bookings state
_bookings: dict = {
    "BLR-260531-A1": {
        "id": "BLR-260531-A1",
        "worker_id": "W0048",
        "worker_name": "Veer Karpe",
        "customer_id": "C-ANJALI",
        "customer_name": "Anjali Sharma",
        "service": "Plumber",
        "date": "2026-05-31",
        "time": "ASAP (Emergency Dispatch)",
        "address": "C-204, Sector 62, Noida, Uttar Pradesh",
        "advance_amount": 100,
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
}

class BookingRequest(BaseModel):
    worker_id: str
    customer_id: str
    service: str
    date: str
    time: str
    address: str
    advance_amount: int = 100
    worker_name: Optional[str] = "Worker"
    customer_name: Optional[str] = "Anjali Sharma"

@router.post("/")
async def create_booking(req: BookingRequest):
    bid = f"BLR-{datetime.now().strftime('%y%m%d')}-{str(uuid.uuid4())[:3].upper()}"
    booking = {
        "id": bid,
        **req.dict(),
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    _bookings[bid] = booking
    return {"booking_id": bid, "status": "pending", "message": "Booking created. Pay advance to confirm."}

@router.get("/")
async def get_all_bookings():
    return {"bookings": list(_bookings.values())}

@router.get("/{booking_id}")
async def get_booking(booking_id: str):
    return _bookings.get(booking_id, {"error": "Not found"})

@router.get("/customer/{customer_id}")
async def customer_bookings(customer_id: str):
    return {"bookings": [b for b in _bookings.values() if b.get("customer_id") == customer_id]}

@router.get("/worker/{worker_id}")
async def worker_bookings(worker_id: str):
    return {"bookings": [b for b in _bookings.values() if b.get("worker_id") == worker_id]}

@router.post("/{booking_id}/accept")
async def accept_booking(booking_id: str):
    if booking_id in _bookings:
        _bookings[booking_id]["status"] = "accepted"
        return {"status": "success", "booking": _bookings[booking_id]}
    return {"error": "Booking not found"}

@router.post("/{booking_id}/dispute")
async def dispute_booking(booking_id: str, reason: str = "Poor quality pipe alignment"):
    if booking_id in _bookings:
        _bookings[booking_id]["status"] = "disputed"
        _bookings[booking_id]["dispute_reason"] = reason
        return {"status": "success", "booking": _bookings[booking_id]}
    return {"error": "Booking not found"}

@router.post("/{booking_id}/resolve")
async def resolve_booking_dispute(booking_id: str):
    if booking_id in _bookings:
        _bookings[booking_id]["status"] = "resolved"
        return {"status": "success", "booking": _bookings[booking_id]}
    return {"error": "Booking not found"}
