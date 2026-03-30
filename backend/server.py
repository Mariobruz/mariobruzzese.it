from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import re


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


class ContactRequestCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    company: Optional[str] = Field(None, max_length=200)
    message: str = Field(..., min_length=10, max_length=1000)
    source: str = Field(..., pattern="^(hero_cta|footer|faq|case_studies|services|come_funziona|perche_noi|other)$")

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None or v == '':
            return None
        # Remove spaces and dashes for validation
        clean_phone = v.replace(' ', '').replace('-', '')
        # Italian phone number validation (basic)
        phone_pattern = re.compile(r'^\+?39?\s?3\d{9}$|^\+?\d{10,15}$')
        if not phone_pattern.match(clean_phone):
            raise ValueError('Numero di telefono non valido')
        return v


class ContactRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    message: str
    source: str
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# Contact Request Endpoints
@api_router.post("/contact")
async def create_contact_request(contact_data: ContactRequestCreate):
    try:
        # Create contact request object
        contact_dict = contact_data.model_dump()
        contact_obj = ContactRequest(**contact_dict)
        
        # Convert to dict and serialize datetimes
        doc = contact_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        # Save to database
        result = await db.contact_requests.insert_one(doc)
        
        if result.inserted_id:
            logger.info(f"New contact request from {contact_obj.email} (source: {contact_obj.source})")
            return {
                "success": True,
                "message": "Richiesta inviata con successo. Ti contatteremo presto!",
                "requestId": contact_obj.id
            }
        else:
            raise HTTPException(status_code=500, detail="Errore durante il salvataggio")
    
    except ValueError as ve:
        logger.warning(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error creating contact request: {str(e)}")
        raise HTTPException(status_code=500, detail="Errore interno del server")


@api_router.get("/contact")
async def get_contact_requests(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = db.contact_requests.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
        contacts = await cursor.to_list(length=limit)
        total = await db.contact_requests.count_documents(query)
        
        # Convert ISO string datetimes back
        for contact in contacts:
            if isinstance(contact.get('created_at'), str):
                contact['created_at'] = datetime.fromisoformat(contact['created_at'])
            if isinstance(contact.get('updated_at'), str):
                contact['updated_at'] = datetime.fromisoformat(contact['updated_at'])
        
        return {
            "success": True,
            "data": contacts,
            "total": total,
            "page": (skip // limit) + 1
        }
    except Exception as e:
        logger.error(f"Error fetching contact requests: {str(e)}")
        raise HTTPException(status_code=500, detail="Errore interno del server")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
