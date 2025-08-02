# Fitness Tracker - Deployment Ready

This repository has been restructured for optimal Vercel deployment.

## 🏗️ Project Structure

```
fitness_tracker/
├── src/                 # React source code (moved from frontend/)
├── public/             # Public assets (moved from frontend/)  
├── backend/            # Express.js API (separate deployment)
├── package.json        # React app dependencies
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
└── vercel.json         # Vercel deployment configuration
```

## 🚀 Deployment

### Frontend (Vercel)
- Repository root contains the React app
- Vercel auto-detects Create React App
- Simple configuration with SPA routing

### Backend (Separate)
- Deploy backend separately on Heroku/Railway/Render
- Update API URLs in frontend for production

## 🔧 Local Development

```bash
# Frontend (React)
npm install
npm start

# Backend (in separate terminal)
cd backend
npm install  
npm run dev
```

## 🌐 Environment Variables

Add these to Vercel dashboard:
- `REACT_APP_API_URL` - Your deployed backend URL
