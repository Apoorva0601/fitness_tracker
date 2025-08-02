# FitTrack - Full-Stack Fitness Tracker

A comprehensive MERN stack fitness tracking application with user authentication, workout logging, progress monitoring, and resource management.

## 🌟 Features

### Core Features
- **User Authentication**: JWT-based auth with bcrypt password hashing
- **Workout Logging**: Add, edit, delete, and view workout entries
- **Progress Dashboard**: Visual charts and statistics using Chart.js
- **Fitness Resources**: Articles, tips, and videos for fitness guidance
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark/Light Mode**: Theme switching with system preference detection

### Advanced Features
- **Role-based Access**: Admin panel for user and content management
- **File Uploads**: Progress photos for workouts using Multer
- **Search & Filtering**: Advanced search across workouts and resources
- **Streak Tracking**: Consecutive workout day tracking
- **Data Visualization**: Charts for workout frequency and progress
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: Client and server-side validation

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Chart.js + react-chartjs-2** - Data visualization
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Headless UI** - Accessible components
- **Heroicons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin requests
- **Rate Limiting** - API protection

## 📁 Project Structure

```
fitness_tracker/
├── backend/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Workout.js
│   │   └── Resource.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── workouts.js
│   │   ├── resources.js
│   │   └── users.js
│   ├── scripts/
│   │   └── seedResources.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   ├── Layout/
    │   │   └── UI/
    │   ├── contexts/
    │   │   ├── AuthContext.js
    │   │   └── ThemeContext.js
    │   ├── hooks/
    │   ├── pages/
    │   │   ├── Auth/
    │   │   ├── Dashboard/
    │   │   ├── Workouts/
    │   │   ├── Resources/
    │   │   ├── Profile/
    │   │   └── Admin/
    │   ├── services/
    │   ├── utils/
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitness_tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fitness_tracker
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

6. **Seed Sample Data** (Optional)
   ```bash
   cd backend
   node scripts/seedResources.js
   ```

### First Run Setup

1. Visit `http://localhost:3000`
2. Register a new account or use demo credentials:
   - **User**: user@example.com / password123
   - **Admin**: admin@example.com / admin123

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Password reset

### Workout Endpoints
- `GET /api/workouts` - Get user workouts (paginated)
- `POST /api/workouts` - Create new workout
- `GET /api/workouts/:id` - Get specific workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `GET /api/workouts/stats` - Get workout statistics

### Resource Endpoints
- `GET /api/resources` - Get all resources (public)
- `GET /api/resources/:id` - Get specific resource
- `GET /api/resources/popular` - Get popular resources
- `POST /api/resources/:id/like` - Like a resource

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `DELETE /api/users/profile` - Delete account

### Admin Endpoints
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id/role` - Update user role (admin)
- `POST /api/resources` - Create resource (admin)
- `PUT /api/resources/:id` - Update resource (admin)
- `DELETE /api/resources/:id` - Delete resource (admin)

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Server and client-side validation
- **Rate Limiting** - API abuse protection
- **CORS Configuration** - Cross-origin request handling
- **Helmet Security** - HTTP security headers
- **File Upload Security** - File type and size validation

## 📱 Responsive Design

- **Mobile-First Approach** - Optimized for mobile devices
- **Flexible Grid System** - Tailwind CSS responsive utilities
- **Touch-Friendly Interface** - Large touch targets
- **Progressive Enhancement** - Works on all devices

## 🎨 UI/UX Features

- **Dark/Light Mode** - System preference detection
- **Smooth Animations** - CSS transitions and transforms
- **Loading States** - Skeleton screens and spinners
- **Toast Notifications** - User feedback system
- **Form Validation** - Real-time validation feedback
- **Accessibility** - ARIA labels and keyboard navigation

## 📈 Data Visualization

- **Workout Frequency Charts** - Line charts for daily tracking
- **Category Breakdown** - Pie charts for exercise types
- **Progress Statistics** - Key metrics dashboard
- **Streak Tracking** - Consecutive workout days
- **Historical Data** - Time-based analysis

## 🚀 Deployment

### Frontend (Vercel)

1. **Build the project**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Environment Variables**
   - Set `REACT_APP_API_URL` to your backend URL

### Backend (Railway/Render)

1. **Prepare for deployment**
   ```bash
   cd backend
   npm install --production
   ```

2. **Environment Variables**
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-mongodb-connection-string>`
   - `JWT_SECRET=<secure-random-string>`
   - `CLIENT_URL=<your-frontend-url>`

3. **Deploy to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

### Database (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create new cluster
3. Get connection string
4. Update `MONGODB_URI` in environment variables

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Chart.js for beautiful data visualization
- MongoDB for the flexible database
- Express.js for the robust backend framework

## 🐛 Known Issues

- File upload progress indicator needs improvement
- Social media sharing features not implemented
- Email notifications system pending
- Advanced search filters need refinement

## 🔮 Future Enhancements

- **Social Features** - Friend connections and challenges
- **Nutrition Tracking** - Meal logging and calorie counting
- **Workout Plans** - Pre-built workout routines
- **Integration** - Fitness device and app integrations
- **Analytics** - Advanced reporting and insights
- **Mobile App** - React Native companion app
- **AI Features** - Workout recommendations
- **Video Streaming** - Workout video content

## 📞 Support

For support, email support@fittrack.com or create an issue in the repository.

---

Made with ❤️ by the FitTrack team
