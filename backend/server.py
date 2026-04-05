print("SERVER FILE LOADED SUCCESSFULLY")
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os
import logging
import uuid
import bcrypt
from jose import JWTError, jwt

# Optional AI import
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    AI_AVAILABLE = True
except ImportError:
    LlmChat = None
    UserMessage = None
    AI_AVAILABLE = False

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Configuration
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "skillbridge")
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Security
security = HTTPBearer()

# Create FastAPI app
app = FastAPI(title="SkillBridge API")
api_router = APIRouter(prefix="/api")


# ===================== MODELS =====================

class UserRole:
    STUDENT = "student"
    FARMER = "farmer"
    JOB_SEEKER = "job_seeker"
    JOB_PROVIDER = "job_provider"
    ADMIN = "admin"


class ApplicationStatus:
    PENDING = "pending"
    REVIEWED = "reviewed"
    INTERVIEW = "interview"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_verified: bool = False
    profile_completed: bool = False
    skills: List[str] = []
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    resume_url: Optional[str] = None


class UserProfile(BaseModel):
    skills: Optional[List[str]] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    portfolio_url: Optional[str] = None


class JobCreate(BaseModel):
    title: str
    description: str
    job_type: str
    category: str
    location: str
    salary_range: Optional[str] = None
    requirements: List[str]
    skills_required: List[str]
    deadline: Optional[datetime] = None


class Job(JobCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    provider_id: str
    provider_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    applications_count: int = 0


class ApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = None


class Application(ApplicationCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    applicant_id: str
    applicant_name: str
    applicant_email: str
    status: str = ApplicationStatus.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    duration: str
    level: str
    content: List[Dict[str, Any]]
    skills_covered: List[str]


class Course(CourseCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    enrolled_count: int = 0


class CourseEnrollment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    progress: int = 0
    completed: bool = False


class Certificate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    course_id: str
    course_title: str
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    certificate_url: Optional[str] = None


class PortfolioProject(BaseModel):
    title: str
    description: str
    technologies: List[str]
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    image_url: Optional[str] = None


class Portfolio(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    projects: List[PortfolioProject] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FarmCreate(BaseModel):
    farm_type: str
    farm_name: str
    location: str
    description: str
    size: Optional[str] = None


class Farm(FarmCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    farmer_id: str
    farmer_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_approved: bool = False


class ReviewCreate(BaseModel):
    target_id: str
    target_type: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class Review(ReviewCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SuccessStoryCreate(BaseModel):
    title: str
    story: str
    user_role: str
    image_url: Optional[str] = None


class SuccessStory(SuccessStoryCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_approved: bool = False


class Referral(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    referrer_id: str
    referred_email: str
    referred_user_id: Optional[str] = None
    points_awarded: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ===================== HELPER FUNCTIONS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def create_notification(user_id: str, title: str, message: str, notification_type: str):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
    )
    await db.notifications.insert_one(notification.model_dump())


# ===================== AI HELPER FUNCTIONS =====================

async def analyze_resume_with_ai(resume_text: str) -> dict:
    if not AI_AVAILABLE or not EMERGENT_LLM_KEY:
        return {
            "message": "AI feature disabled in local mode",
            "ai_available": False
        }

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"resume-analysis-{uuid.uuid4()}",
            system_message="You are an expert resume analyzer. Analyze resumes and provide constructive feedback."
        ).with_model("openai", "gpt-5.2")

        message = UserMessage(
            text=f"""Analyze this resume and provide feedback in JSON format:
Resume: {resume_text}

Return JSON with these fields:
- overall_score (1-10)
- strengths (list of 3-5 strengths)
- improvements (list of 3-5 improvements)
- missing_skills (list of skills that could be added)
- summary (brief overall assessment)"""
        )

        response = await chat.send_message(message)
        return {
            "analysis": response,
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "ai_available": True,
        }
    except Exception as e:
        return {"error": str(e), "ai_available": False}


async def match_jobs_with_ai(user_skills: List[str], user_experience: str) -> List[str]:
    if not AI_AVAILABLE or not EMERGENT_LLM_KEY:
        return []

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"job-matching-{uuid.uuid4()}",
            system_message="You are an expert career counselor. Match user skills with suitable job categories."
        ).with_model("openai", "gpt-5.2")

        message = UserMessage(
            text=f"""Based on these skills: {', '.join(user_skills)} and experience: {user_experience},
recommend 5 most suitable job categories. Return only a comma-separated list of job categories."""
        )

        response = await chat.send_message(message)
        categories = [cat.strip() for cat in response.split(",")]
        return categories[:5]
    except Exception:
        return []


async def generate_career_path(target_role: str) -> dict:
    if not AI_AVAILABLE or not EMERGENT_LLM_KEY:
        return {
            "message": "AI feature disabled in local mode",
            "ai_available": False
        }

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"career-path-{uuid.uuid4()}",
            system_message="You are an expert career counselor. Create detailed career roadmaps."
        ).with_model("openai", "gpt-5.2")

        message = UserMessage(
            text=f"""Create a detailed career roadmap for becoming a {target_role}.
Include: steps, timeline, required skills, courses, and expected outcomes.
Format as a structured response."""
        )

        response = await chat.send_message(message)
        return {
            "target_role": target_role,
            "roadmap": response,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "ai_available": True,
        }
    except Exception as e:
        return {"error": str(e), "ai_available": False}


# ===================== API ROUTES =====================

@api_router.get("/")
async def root():
    return {
        "message": "SkillBridge API is running",
        "version": "1.0.0",
        "ai_available": AI_AVAILABLE and bool(EMERGENT_LLM_KEY),
    }


# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    if user_data.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Admin accounts must be created by existing administrators."
        )

    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(**user_data.model_dump(exclude={"password"}))
    user_dict = user.model_dump()
    user_dict["password_hash"] = hash_password(user_data.password)

    await db.users.insert_one(user_dict)

    token = create_access_token({"sub": user.id, "role": user.role})

    return {
        "user": user.model_dump(),
        "access_token": token,
        "token_type": "bearer"
    }


@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["id"], "role": user["role"]})
    user.pop("password_hash", None)

    return {
        "user": user,
        "access_token": token,
        "token_type": "bearer",
    }


@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    current_user.pop("password_hash", None)
    return current_user


@api_router.put("/auth/profile")
async def update_profile(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    update_data["profile_completed"] = True

    await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})

    return {"message": "Profile updated successfully"}


@api_router.put("/auth/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: dict = Depends(get_current_user),
):
    if not verify_password(current_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    new_password_hash = hash_password(new_password)

    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"password_hash": new_password_hash}},
    )

    return {"message": "Password changed successfully"}


# ==================== JOB ROUTES ====================

@api_router.post("/jobs", response_model=Job)
async def create_job(job_data: JobCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.JOB_PROVIDER:
        raise HTTPException(status_code=403, detail="Only job providers can create jobs")

    job = Job(
        **job_data.model_dump(),
        provider_id=current_user["id"],
        provider_name=current_user["full_name"],
    )

    await db.jobs.insert_one(job.model_dump())
    return job


@api_router.get("/jobs")
async def get_jobs(
    job_type: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
):
    query = {"is_active": True}
    if job_type:
        query["job_type"] = job_type
    if category:
        query["category"] = category

    jobs = await db.jobs.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    return jobs


@api_router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@api_router.get("/jobs/my/posted")
async def get_my_jobs(current_user: dict = Depends(get_current_user)):
    jobs = await db.jobs.find({"provider_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return jobs


@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["provider_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.jobs.delete_one({"id": job_id})
    return {"message": "Job deleted successfully"}


# ==================== APPLICATION ROUTES ====================

@api_router.post("/applications")
async def apply_for_job(app_data: ApplicationCreate, current_user: dict = Depends(get_current_user)):
    existing = await db.applications.find_one({
        "job_id": app_data.job_id,
        "applicant_id": current_user["id"],
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    job = await db.jobs.find_one({"id": app_data.job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    application = Application(
        **app_data.model_dump(),
        applicant_id=current_user["id"],
        applicant_name=current_user["full_name"],
        applicant_email=current_user["email"],
    )

    await db.applications.insert_one(application.model_dump())

    await db.jobs.update_one(
        {"id": app_data.job_id},
        {"$inc": {"applications_count": 1}},
    )

    await create_notification(
        job["provider_id"],
        "New Application Received",
        f"{current_user['full_name']} applied for {job['title']}",
        "application",
    )

    return application


@api_router.get("/applications/my")
async def get_my_applications(current_user: dict = Depends(get_current_user)):
    applications = await db.applications.find(
        {"applicant_id": current_user["id"]},
        {"_id": 0},
    ).to_list(100)
    return applications


@api_router.get("/applications/job/{job_id}")
async def get_job_applications(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["provider_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    applications = await db.applications.find(
        {"job_id": job_id},
        {"_id": 0},
    ).to_list(100)
    return applications


@api_router.put("/applications/{app_id}/status")
async def update_application_status(
    app_id: str,
    status: str,
    current_user: dict = Depends(get_current_user),
):
    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    job = await db.jobs.find_one({"id": application["job_id"]})
    if job["provider_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.applications.update_one(
        {"id": app_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}},
    )

    status_messages = {
        ApplicationStatus.REVIEWED: "Your application is being reviewed",
        ApplicationStatus.INTERVIEW: "You've been shortlisted for interview!",
        ApplicationStatus.ACCEPTED: "Congratulations! Your application has been accepted",
        ApplicationStatus.REJECTED: "Your application status has been updated",
    }

    await create_notification(
        application["applicant_id"],
        "Application Status Update",
        status_messages.get(status, "Your application status has been updated"),
        "application_update",
    )

    return {"message": "Application status updated"}


# ==================== COURSE ROUTES ====================

@api_router.post("/courses")
async def create_course(course_data: CourseCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create courses")

    course = Course(**course_data.model_dump())
    await db.courses.insert_one(course.model_dump())
    return course


@api_router.get("/courses")
async def get_courses(category: Optional[str] = None, skip: int = 0, limit: int = 20):
    query = {}
    if category:
        query["category"] = category

    courses = await db.courses.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    return courses


@api_router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@api_router.post("/courses/{course_id}/enroll")
async def enroll_course(course_id: str, current_user: dict = Depends(get_current_user)):
    existing = await db.enrollments.find_one({
        "user_id": current_user["id"],
        "course_id": course_id,
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = CourseEnrollment(
        user_id=current_user["id"],
        course_id=course_id,
    )

    await db.enrollments.insert_one(enrollment.model_dump())
    await db.courses.update_one({"id": course_id}, {"$inc": {"enrolled_count": 1}})

    return enrollment


@api_router.get("/courses/my/enrolled")
async def get_my_courses(current_user: dict = Depends(get_current_user)):
    enrollments = await db.enrollments.find(
        {"user_id": current_user["id"]},
        {"_id": 0},
    ).to_list(100)
    return enrollments


@api_router.put("/courses/{course_id}/progress")
async def update_course_progress(
    course_id: str,
    progress: int,
    current_user: dict = Depends(get_current_user),
):
    completed = progress >= 100

    await db.enrollments.update_one(
        {"user_id": current_user["id"], "course_id": course_id},
        {"$set": {"progress": progress, "completed": completed}},
    )

    if completed:
        course = await db.courses.find_one({"id": course_id})
        certificate = Certificate(
            user_id=current_user["id"],
            user_name=current_user["full_name"],
            course_id=course_id,
            course_title=course["title"],
        )
        await db.certificates.insert_one(certificate.model_dump())

        await create_notification(
            current_user["id"],
            "Certificate Issued!",
            f"Congratulations! You've earned a certificate for {course['title']}",
            "certificate",
        )

    return {"message": "Progress updated", "completed": completed}


# ==================== CERTIFICATE ROUTES ====================

@api_router.get("/certificates/my")
async def get_my_certificates(current_user: dict = Depends(get_current_user)):
    certificates = await db.certificates.find(
        {"user_id": current_user["id"]},
        {"_id": 0},
    ).to_list(100)
    return certificates


# ==================== PORTFOLIO ROUTES ====================

@api_router.post("/portfolio")
async def create_portfolio(project: PortfolioProject, current_user: dict = Depends(get_current_user)):
    portfolio = await db.portfolios.find_one({"user_id": current_user["id"]})

    if portfolio:
        await db.portfolios.update_one(
            {"user_id": current_user["id"]},
            {"$push": {"projects": project.model_dump()}},
        )
    else:
        new_portfolio = Portfolio(
            user_id=current_user["id"],
            projects=[project.model_dump()],
        )
        await db.portfolios.insert_one(new_portfolio.model_dump())

    return {"message": "Project added to portfolio"}


@api_router.get("/portfolio/{user_id}")
async def get_portfolio(user_id: str):
    portfolio = await db.portfolios.find_one({"user_id": user_id}, {"_id": 0})
    if not portfolio:
        return {"user_id": user_id, "projects": []}
    return portfolio


# ==================== FARM ROUTES ====================

@api_router.post("/farms")
async def create_farm(farm_data: FarmCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.FARMER:
        raise HTTPException(status_code=403, detail="Only farmers can register farms")

    farm = Farm(
        **farm_data.model_dump(),
        farmer_id=current_user["id"],
        farmer_name=current_user["full_name"],
    )

    await db.farms.insert_one(farm.model_dump())
    return farm


@api_router.get("/farms")
async def get_farms(approved_only: bool = True):
    query = {"is_approved": True} if approved_only else {}
    farms = await db.farms.find(query, {"_id": 0}).to_list(100)
    return farms


@api_router.get("/farms/my")
async def get_my_farms(current_user: dict = Depends(get_current_user)):
    farms = await db.farms.find({"farmer_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return farms


@api_router.put("/farms/{farm_id}/approve")
async def approve_farm(farm_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can approve farms")

    farm = await db.farms.find_one({"id": farm_id})
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    await db.farms.update_one({"id": farm_id}, {"$set": {"is_approved": True}})

    await create_notification(
        farm["farmer_id"],
        "Farm Approved!",
        f"Your farm '{farm['farm_name']}' has been approved and is now visible on the map",
        "farm_approval",
    )

    return {"message": "Farm approved"}


# ==================== REVIEW ROUTES ====================

@api_router.post("/reviews")
async def create_review(review_data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    review = Review(
        **review_data.model_dump(),
        user_id=current_user["id"],
        user_name=current_user["full_name"],
    )

    await db.reviews.insert_one(review.model_dump())
    return review


@api_router.get("/reviews/{target_id}")
async def get_reviews(target_id: str, target_type: str):
    reviews = await db.reviews.find(
        {"target_id": target_id, "target_type": target_type},
        {"_id": 0},
    ).to_list(100)

    avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0

    return {
        "reviews": reviews,
        "average_rating": avg_rating,
        "total_reviews": len(reviews),
    }


# ==================== NOTIFICATION ROUTES ====================

@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user["id"]},
        {"_id": 0},
    ).sort("created_at", -1).limit(50).to_list(50)
    return notifications


@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user["id"]},
        {"$set": {"is_read": True}},
    )
    return {"message": "Notification marked as read"}


# ==================== SUCCESS STORY ROUTES ====================

@api_router.post("/success-stories")
async def create_success_story(story_data: SuccessStoryCreate, current_user: dict = Depends(get_current_user)):
    story = SuccessStory(
        **story_data.model_dump(),
        user_id=current_user["id"],
        user_name=current_user["full_name"],
    )

    await db.success_stories.insert_one(story.model_dump())
    return story


@api_router.get("/success-stories")
async def get_success_stories(approved_only: bool = True):
    query = {"is_approved": True} if approved_only else {}
    stories = await db.success_stories.find(query, {"_id": 0}).limit(20).to_list(20)
    return stories


# ==================== AI ROUTES ====================

@api_router.post("/ai/resume-analysis")
async def analyze_resume(resume_text: str, current_user: dict = Depends(get_current_user)):
    return await analyze_resume_with_ai(resume_text)


@api_router.post("/ai/job-match")
async def get_job_recommendations(current_user: dict = Depends(get_current_user)):
    user_skills = current_user.get("skills", [])
    user_experience = current_user.get("experience", "")

    recommended_categories = await match_jobs_with_ai(user_skills, user_experience)

    jobs = await db.jobs.find(
        {"category": {"$in": recommended_categories}, "is_active": True},
        {"_id": 0},
    ).limit(10).to_list(10)

    return {
        "recommended_jobs": jobs,
        "categories": recommended_categories,
        "ai_available": AI_AVAILABLE,
    }


@api_router.post("/ai/career-path")
async def get_career_path(target_role: str, current_user: dict = Depends(get_current_user)):
    return await generate_career_path(target_role)


# ==================== ANALYTICS ROUTES ====================

@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    role = current_user["role"]

    if role in [UserRole.STUDENT, UserRole.JOB_SEEKER]:
        applications_count = await db.applications.count_documents({"applicant_id": current_user["id"]})
        enrolled_courses = await db.enrollments.count_documents({"user_id": current_user["id"]})
        certificates_count = await db.certificates.count_documents({"user_id": current_user["id"]})

        return {
            "total_applications": applications_count,
            "enrolled_courses": enrolled_courses,
            "certificates_earned": certificates_count,
        }

    if role == UserRole.JOB_PROVIDER:
        jobs_count = await db.jobs.count_documents({"provider_id": current_user["id"]})
        provider_jobs = await db.jobs.find(
            {"provider_id": current_user["id"]},
            {"id": 1, "_id": 0},
        ).to_list(100)
        job_ids = [job["id"] for job in provider_jobs]
        total_applications = await db.applications.count_documents({"job_id": {"$in": job_ids}})

        return {
            "total_jobs_posted": jobs_count,
            "total_applications": total_applications,
        }

    if role == UserRole.FARMER:
        farms_count = await db.farms.count_documents({"farmer_id": current_user["id"]})
        certificates_count = await db.certificates.count_documents({"user_id": current_user["id"]})

        return {
            "total_farms": farms_count,
            "certificates_earned": certificates_count,
        }

    if role == UserRole.ADMIN:
        total_users = await db.users.count_documents({})
        total_jobs = await db.jobs.count_documents({})
        total_applications = await db.applications.count_documents({})
        total_courses = await db.courses.count_documents({})

        return {
            "total_users": total_users,
            "total_jobs": total_jobs,
            "total_applications": total_applications,
            "total_courses": total_courses,
        }

    return {}


# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users


@api_router.put("/success-stories/{story_id}/approve")
async def approve_success_story(story_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    story = await db.success_stories.find_one({"id": story_id})
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    await db.success_stories.update_one({"id": story_id}, {"$set": {"is_approved": True}})

    await create_notification(
        story["user_id"],
        "Success Story Approved!",
        f"Your success story '{story['title']}' has been approved and is now visible to everyone",
        "story_approval",
    )

    return {"message": "Success story approved"}


@api_router.put("/admin/verify-user/{user_id}")
async def verify_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one({"id": user_id}, {"$set": {"is_verified": True}})

    await create_notification(
        user_id,
        "Account Verified!",
        "Your account has been verified by the administrator. You now have full access to all features.",
        "verification",
    )

    return {"message": "User verified successfully"}


@api_router.post("/admin/create-admin")
async def create_admin_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create new admin accounts")

    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(**user_data.model_dump(exclude={"password"}))
    user.role = UserRole.ADMIN
    user_dict = user.model_dump()
    user_dict["password_hash"] = hash_password(user_data.password)
    user_dict["is_verified"] = True

    await db.users.insert_one(user_dict)

    return {"message": "Admin user created successfully", "user": user.model_dump()}


# Include router
app.include_router(api_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.get("/hello-test")
async def hello_test():
    return {"message": "hello test ok"}    
