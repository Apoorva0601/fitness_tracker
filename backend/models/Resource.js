const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  type: {
    type: String,
    enum: ['article', 'video', 'tip'],
    required: true
  },
  category: {
    type: String,
    enum: ['nutrition', 'exercise', 'wellness', 'equipment', 'motivation'],
    required: true
  },
  author: {
    type: String,
    required: true,
    default: 'Fitness Team'
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search functionality
resourceSchema.index({ title: 'text', content: 'text', tags: 'text' });
resourceSchema.index({ category: 1, type: 1 });
resourceSchema.index({ isPublished: 1, createdAt: -1 });

// Method to increment views
resourceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get popular resources
resourceSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isPublished: true })
    .sort({ likes: -1, views: -1 })
    .limit(limit)
    .select('title type category imageUrl readTime likes views createdAt');
};

// Static method to search resources
resourceSchema.statics.searchResources = function(query, filters = {}) {
  const searchQuery = { isPublished: true };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  if (filters.type) {
    searchQuery.type = filters.type;
  }
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .select('title content type category author imageUrl videoUrl readTime likes views createdAt');
};

module.exports = mongoose.model('Resource', resourceSchema);
