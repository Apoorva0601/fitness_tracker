const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseName: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true,
    maxlength: [100, 'Exercise name cannot exceed 100 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [600, 'Duration cannot exceed 600 minutes']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  caloriesBurned: {
    type: Number,
    min: [0, 'Calories cannot be negative'],
    max: [5000, 'Calories seem unrealistic']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'sports', 'other'],
    default: 'other'
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  },
  progressPhotos: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, exerciseName: 1 });

// Virtual for formatted date
workoutSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Static method to get user's workout stats
workoutSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const matchStage = { user: mongoose.Types.ObjectId(userId) };
  
  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCalories: { $sum: '$caloriesBurned' },
        avgDuration: { $avg: '$duration' },
        avgCalories: { $avg: '$caloriesBurned' }
      }
    }
  ]);
  
  return stats[0] || {
    totalWorkouts: 0,
    totalDuration: 0,
    totalCalories: 0,
    avgDuration: 0,
    avgCalories: 0
  };
};

// Static method to get workout frequency data for charts
workoutSchema.statics.getWorkoutFrequency = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const frequency = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCalories: { $sum: '$caloriesBurned' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
  
  return frequency;
};

module.exports = mongoose.model('Workout', workoutSchema);
