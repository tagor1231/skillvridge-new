# 🎓 SkillBridge - Multi-Role Job & Training Platform

A comprehensive platform connecting Students, Farmers, Job Seekers, and Job Providers with AI-powered features for career growth and skill development.

## 🌟 Features

### For Students
- 📚 Browse part-time jobs and internships
- 🎓 Enroll in skill training courses
- 🏆 Earn certificates
- 💼 Build professional portfolio
- 🤖 AI-powered job recommendations
- 📊 Career path guidance

### For Job Seekers
- 🔍 Advanced job search with filters
- 🎯 Skills-based job matching
- 📝 Application tracking system
- 📈 Profile optimization tips
- ⚡ One-click applications

### For Farmers
- 🌾 Farm registration and management
- 📖 Agricultural training courses
- 🏅 Certificate programs
- 💰 Government loan assistance
- 🗺️ Nearby farms discovery

### For Job Providers
- 📢 Post job opportunities
- 👥 Manage applications
- ✅ Accept/Reject candidates
- 📊 Analytics dashboard
- 🔔 Automated notifications

### For Admins
- 🛡️ Complete platform control
- 👤 User management
- ✅ Farm approvals
- 📚 Course creation
- 📝 Content moderation

## 🚀 Tech Stack

### Frontend
- React 19
- React Router
- Tailwind CSS
- Axios
- Lucide Icons

### Backend
- FastAPI
- Python 3.11+
- Motor (Async MongoDB)
- JWT Authentication
- Bcrypt

### Database
- MongoDB

### AI Integration
- OpenAI GPT-5.2
- Resume Analysis
- Job Matching
- Career PathFinder

## 📦 Installation

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.11+
- MongoDB

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Run backend
python server.py
```

### Frontend Setup

```bash
cd frontend
yarn install

# Create .env file
cp .env.example .env
# Edit .env with backend URL

# Run frontend
yarn start
```

## 🔧 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=skillbridge_db
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000
EMERGENT_LLM_KEY=your-openai-key
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📱 Usage

1. Start MongoDB
2. Run backend: `cd backend && python server.py`
3. Run frontend: `cd frontend && yarn start`
4. Access at: `http://localhost:3000`

## 👤 Creating First Admin

```python
# Connect to MongoDB and run:
from pymongo import MongoClient
import bcrypt

client = MongoClient("mongodb://localhost:27017")
db = client["skillbridge_db"]

# Update any user to admin
db.users.update_one(
    {"email": "your-email@example.com"},
    {"$set": {"role": "admin"}}
)
```

## 🎯 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/jobs` - List all jobs
- `POST /api/applications` - Apply for job
- `GET /api/courses` - List courses
- `POST /api/admin/create-admin` - Create admin (admin only)

[Full API documentation coming soon]

## 🚢 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed production deployment instructions.

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 👨‍💻 Author

**Tagor Kumar Basunia**
- Email: tagorkumarbasunia@gmail.com
- Platform: SkillBridge

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ for empowering careers through skills and opportunities**
