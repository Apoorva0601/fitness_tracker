const express = require('express');
const { body, validationResult } = require('express-validator');
const Workout = require('../models/Workout');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/workouts
// @desc    Get user's workouts with pagination and filtering
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      startDate,
      endDate,
      exerciseName
    } = req.query;

    const query = { user: req.user._id };

    // Add filters
    if (category) query.category = category;
    if (exerciseName) query.exerciseName = new RegExp(exerciseName, 'i');
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: -1 },
      populate: {
        path: 'user',
        select: 'name email'
      }
    };

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Workout.countDocuments(query);

    res.json({
      success: true,
      data: {
        workouts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalWorkouts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching workouts'
    });
  }
});

// @route   GET /api/workouts/stats
// @desc    Get user's workout statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await Workout.getUserStats(req.user._id, startDate, new Date());
    const frequency = await Workout.getWorkoutFrequency(req.user._id, days);

    // Get category breakdown
    const categoryStats = await Workout.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats,
        frequency,
        categoryBreakdown: categoryStats,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @route   GET /api/workouts/:id
// @desc    Get single workout
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'name email');

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching workout'
    });
  }
});

// @route   POST /api/workouts
// @desc    Create new workout
// @access  Private
router.post('/', [
  upload.array('progressPhotos', 5),
  body('exerciseName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Exercise name must be between 1 and 100 characters'),
  body('duration')
    .isInt({ min: 1, max: 600 })
    .withMessage('Duration must be between 1 and 600 minutes'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('caloriesBurned')
    .optional()
    .isInt({ min: 0, max: 5000 })
    .withMessage('Calories must be between 0 and 5000'),
  body('category')
    .optional()
    .isIn(['cardio', 'strength', 'flexibility', 'sports', 'other'])
    .withMessage('Invalid category'),
  body('intensity')
    .optional()
    .isIn(['low', 'moderate', 'high'])
    .withMessage('Invalid intensity level')
], handleValidationErrors, async (req, res) => {
  try {
    const workoutData = {
      ...req.body,
      user: req.user._id
    };

    // Add progress photos if uploaded
    if (req.files && req.files.length > 0) {
      workoutData.progressPhotos = req.files.map(file => file.path);
    }

    const workout = new Workout(workoutData);
    await workout.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    user.updateStats(workout.date, workout.duration);
    await user.save();

    await workout.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating workout'
    });
  }
}, handleMulterError);

// @route   PUT /api/workouts/:id
// @desc    Update workout
// @access  Private
router.put('/:id', [
  upload.array('progressPhotos', 5),
  body('exerciseName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Exercise name must be between 1 and 100 characters'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 600 })
    .withMessage('Duration must be between 1 and 600 minutes'),
  body('caloriesBurned')
    .optional()
    .isInt({ min: 0, max: 5000 })
    .withMessage('Calories must be between 0 and 5000')
], handleValidationErrors, async (req, res) => {
  try {
    let workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        workout[key] = req.body[key];
      }
    });

    // Add new progress photos if uploaded
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => file.path);
      workout.progressPhotos = [...workout.progressPhotos, ...newPhotos];
    }

    await workout.save();
    await workout.populate('user', 'name email');

    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: workout
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating workout'
    });
  }
}, handleMulterError);

// @route   DELETE /api/workouts/:id
// @desc    Delete workout
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting workout'
    });
  }
});

module.exports = router;
