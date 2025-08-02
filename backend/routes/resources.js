const express = require('express');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

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

// @route   GET /api/resources
// @desc    Get all published resources with filtering and search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      type,
      search,
      sort = 'newest'
    } = req.query;

    let query = { isPublished: true };
    let sortOption = {};

    // Add filters
    if (category) query.category = category;
    if (type) query.type = type;

    // Add search
    if (search) {
      query.$text = { $search: search };
    }

    // Set sort options
    switch (sort) {
      case 'popular':
        sortOption = { likes: -1, views: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const resources = await Resource.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name')
      .select('title content type category author imageUrl videoUrl readTime likes views createdAt');

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalResources: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resources'
    });
  }
});

// @route   GET /api/resources/popular
// @desc    Get popular resources
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const resources = await Resource.getPopular(parseInt(limit));

    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Get popular resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular resources'
    });
  }
});

// @route   GET /api/resources/categories
// @desc    Get available categories and types
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Resource.distinct('category', { isPublished: true });
    const types = await Resource.distinct('type', { isPublished: true });

    res.json({
      success: true,
      data: {
        categories,
        types
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource and increment views
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      isPublished: true
    }).populate('createdBy', 'name email');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment views
    await resource.incrementViews();

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resource'
    });
  }
});

// @route   POST /api/resources/:id/like
// @desc    Like/unlike a resource
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      isPublished: true
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Simple like increment (in a real app, you'd track user likes)
    resource.likes += 1;
    await resource.save();

    res.json({
      success: true,
      message: 'Resource liked successfully',
      data: { likes: resource.likes }
    });
  } catch (error) {
    console.error('Like resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking resource'
    });
  }
});

// Admin routes (protected)
router.use(protect);
router.use(adminOnly);

// @route   POST /api/resources
// @desc    Create new resource (Admin only)
// @access  Private (Admin)
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('type')
    .isIn(['article', 'video', 'tip'])
    .withMessage('Invalid resource type'),
  body('category')
    .isIn(['nutrition', 'exercise', 'wellness', 'equipment', 'motivation'])
    .withMessage('Invalid category'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author name must be between 1 and 100 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      createdBy: req.user._id
    };

    const resource = new Resource(resourceData);
    await resource.save();

    await resource.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating resource'
    });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update resource (Admin only)
// @access  Private (Admin)
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content cannot be empty'),
  body('type')
    .optional()
    .isIn(['article', 'video', 'tip'])
    .withMessage('Invalid resource type'),
  body('category')
    .optional()
    .isIn(['nutrition', 'exercise', 'wellness', 'equipment', 'motivation'])
    .withMessage('Invalid category')
], handleValidationErrors, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating resource'
    });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete resource (Admin only)
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting resource'
    });
  }
});

module.exports = router;
