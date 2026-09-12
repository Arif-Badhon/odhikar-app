import jwt
import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    email: str
    name: str
    role: str
    clinic_name: str

# Hardcoded demo users for Odhikar Demo
DEMO_USERS = {
    "arif@odhikar.demo": {
        "password": "odhikar2026",
        "name": "Arif",
        "role": "paralegal",
        "clinic_name": "Manikganj Legal Aid Clinic"
    },
    "coordinator@odhikar.demo": {
        "password": "odhikar2026",
        "name": "Shahin Rahman",
        "role": "coordinator",
        "clinic_name": "Odhikar Coordination Desk"
    }
}

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")
    return encoded_jwt

@router.post("/login")
async def login(req: LoginRequest):
    email = req.username.strip().lower()
    if not email.endswith("@odhikar.demo"):
        email = f"{email}@odhikar.demo"
    
    user = DEMO_USERS.get(email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    token = create_access_token({"sub": email, "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

def get_current_user(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None or email not in DEMO_USERS:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = DEMO_USERS[email]
        return UserProfile(email=email, name=user["name"], role=user["role"], clinic_name=user["clinic_name"])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/me", response_model=UserProfile)
async def get_me(token: str):
    return get_current_user(token)
