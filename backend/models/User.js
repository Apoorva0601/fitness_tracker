const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalWorkouts: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastWorkoutDate: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update user stats
userSchema.methods.updateStats = function(workoutDate, duration) {
  this.stats.totalWorkouts += 1;
  this.stats.totalDuration += duration;
  
  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const workoutDay = new Date(workoutDate);
  workoutDay.setHours(0, 0, 0, 0);
  
  if (this.stats.lastWorkoutDate) {
    const lastWorkoutDay = new Date(this.stats.lastWorkoutDate);
    lastWorkoutDay.setHours(0, 0, 0, 0);
    
    const daysDifference = (workoutDay - lastWorkoutDay) / (1000 * 60 * 60 * 24);
    
    if (daysDifference === 1) {
      // Consecutive day
      this.stats.currentStreak += 1;
    } else if (daysDifference > 1) {
      // Streak broken
      this.stats.currentStreak = 1;
    }
    // If same day, don't change streak
  } else {
    this.stats.currentStreak = 1;
  }
  
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  
  this.stats.lastWorkoutDate = workoutDate;
};

module.exports = mongoose.model('User', userSchema);
