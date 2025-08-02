import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { resourceService } from '../../services/resourceService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import { useDebounce } from '../../hooks/useCommon';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  PlayIcon,
  LightBulbIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    status: '',
    sort: 'newest',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResources: 0,
    hasNext: false,
  });
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    content: '',
    type: 'article',
    category: 'nutrition',
    tags: '',
    readTime: '',
    videoUrl: '',
    status: 'draft',
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [debouncedSearch, filters]);

  const fetchCategories = async () => {
    try {
      const response = await resourceService.getCategories();
      const data = response.data.data;
      setCategories(data.categories);
      setTypes(data.types);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchResources = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        includeUnpublished: true, // Admin can see all resources
        ...(debouncedSearch && { search: debouncedSearch }),
        ...filters,
      };

      const response = await adminService.getResources(params);
      const data = response.data.data;
      
      if (page === 1) {
        setResources(data.resources);
      } else {
        setResources(prev => [...prev, ...data.resources]);
      }
      
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceAction = async (resourceId, action, data = {}) => {
    try {
      setActionLoading(true);
      let response;
      
      switch (action) {
        case 'toggle-status':
          if (data.status === 'published') {
            response = await adminService.unpublishResource(resourceId);
            toast.success('Resource unpublished');
          } else {
            response = await adminService.publishResource(resourceId);
            toast.success('Resource published');
          }
          break;
        case 'delete':
          await adminService.deleteResource(resourceId);
          toast.success('Resource deleted');
          setResources(prev => prev.filter(resource => resource._id !== resourceId));
          setShowDeleteModal(false);
          return;
        default:
          return;
      }

      // Update resource in the list
      setResources(prev => prev.map(resource => 
        resource._id === resourceId ? { ...resource, ...response.data.data } : resource
      ));
      
      if (selectedResource && selectedResource._id === resourceId) {
        setSelectedResource({ ...selectedResource, ...response.data.data });
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} resource`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const tags = resourceForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const resourceData = {
        ...resourceForm,
        tags,
        readTime: parseInt(resourceForm.readTime) || 5,
      };

      const response = await adminService.createResource(resourceData);
      setResources(prev => [response.data.data, ...prev]);
      setShowCreateModal(false);
      setResourceForm({
        title: '',
        content: '',
        type: 'article',
        category: 'nutrition',
        tags: '',
        readTime: '',
        videoUrl: '',
        status: 'draft',
      });
      toast.success('Resource created successfully');
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error(error.response?.data?.message || 'Failed to create resource');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasNext && !loading) {
      fetchResources(pagination.currentPage + 1);
    }
  };

  const openResourceModal = (resource) => {
    setSelectedResource(resource);
    setShowResourceModal(true);
  };

  const getTypeIcon = (type) => {
    const icons = {
      article: DocumentTextIcon,
      video: PlayIcon,
      tip: LightBulbIcon,
    };
    return icons[type] || DocumentTextIcon;
  };

  const getTypeColor = (type) => {
    const colors = {
      article: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      video: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      tip: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    };
    return colors[type] || colors.article;
  };

  const getCategoryColor = (category) => {
    const colors = {
      nutrition: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      exercise: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      wellness: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      equipment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      motivation: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const getStatusColor = (status) => {
    const colors = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resource Management
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Create and manage fitness resources
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Resource
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <Input.Select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </Input.Select>

            {/* Category Filter */}
            <Input.Select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </Input.Select>

            {/* Status Filter */}
            <Input.Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Input.Select>

            {/* Sort */}
            <Input.Select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="views">Most Viewed</option>
            </Input.Select>
          </div>
        </Card.Content>
      </Card>

      {/* Resources List */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>
              Resources ({pagination.totalResources})
            </Card.Title>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Object.values(filters).filter(v => v && v !== 'newest').length} filters applied
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {loading && resources.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <LoadingSpinner.Card key={index} />
              ))}
            </div>
          ) : resources.length > 0 ? (
            <div className="space-y-4">
              {resources.map((resource) => {
                const TypeIcon = getTypeIcon(resource.type);
                return (
                  <div 
                    key={resource._id} 
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-gray-200 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                        {resource.imageUrl ? (
                          <img
                            src={resource.imageUrl}
                            alt={resource.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TypeIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Resource Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {resource.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {resource.type}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                            {resource.category}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                            {resource.status === 'published' ? (
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                            ) : resource.status === 'draft' ? (
                              <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                            ) : (
                              <XMarkIcon className="w-3 h-3 mr-1" />
                            )}
                            {resource.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                          {resource.content.replace(/[#*]/g, '').substring(0, 100)}...
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {resource.readTime} min
                          </div>
                          <div className="flex items-center">
                            <EyeIcon className="w-3 h-3 mr-1" />
                            {resource.views}
                          </div>
                          <div className="flex items-center">
                            <HeartIcon className="w-3 h-3 mr-1" />
                            {resource.likes}
                          </div>
                          <span>Created {formatDate(resource.createdAt, 'MMM d, yyyy')}</span>
                          {resource.updatedAt !== resource.createdAt && (
                            <span>• Updated {formatDate(resource.updatedAt, 'MMM d')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openResourceModal(resource)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      
                      <Link to={`/app/resources/${resource._id}`}>
                        <Button variant="ghost" size="sm">
                          <DocumentTextIcon className="w-4 h-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResourceAction(resource._id, 'toggle-status', {
                          status: resource.status === 'published' ? 'draft' : 'published'
                        })}
                        disabled={actionLoading}
                      >
                        {resource.status === 'published' ? (
                          <XMarkIcon className="w-4 h-4" />
                        ) : (
                          <CheckCircleIcon className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedResource(resource);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {pagination.hasNext && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore}
                    loading={loading}
                    disabled={loading}
                  >
                    Load More Resources
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No resources found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery || Object.values(filters).some(v => v && v !== 'newest') 
                  ? "Try adjusting your search or filters"
                  : "Create your first fitness resource"
                }
              </p>
              {(searchQuery || Object.values(filters).some(v => v && v !== 'newest')) ? (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ category: '', type: '', status: '', sort: 'newest' });
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setShowCreateModal(true)}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Resource
                </Button>
              )}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Create Resource Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Resource"
        size="lg"
      >
        <form onSubmit={handleCreateResource} className="space-y-4">
          <Input
            label="Title"
            value={resourceForm.title}
            onChange={(e) => setResourceForm(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input.Select
              label="Type"
              value={resourceForm.type}
              onChange={(e) => setResourceForm(prev => ({ ...prev, type: e.target.value }))}
              required
            >
              {types.map(type => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </Input.Select>
            
            <Input.Select
              label="Category"
              value={resourceForm.category}
              onChange={(e) => setResourceForm(prev => ({ ...prev, category: e.target.value }))}
              required
            >
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </Input.Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Read Time (minutes)"
              type="number"
              min="1"
              max="60"
              value={resourceForm.readTime}
              onChange={(e) => setResourceForm(prev => ({ ...prev, readTime: e.target.value }))}
            />
            
            <Input.Select
              label="Status"
              value={resourceForm.status}
              onChange={(e) => setResourceForm(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Input.Select>
          </div>

          {resourceForm.type === 'video' && (
            <Input
              label="Video URL"
              type="url"
              value={resourceForm.videoUrl}
              onChange={(e) => setResourceForm(prev => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="https://youtube.com/embed/..."
            />
          )}

          <Input
            label="Tags (comma separated)"
            value={resourceForm.tags}
            onChange={(e) => setResourceForm(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="fitness, nutrition, beginner"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea
              value={resourceForm.content}
              onChange={(e) => setResourceForm(prev => ({ ...prev, content: e.target.value }))}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Write your resource content here... (supports basic markdown)"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading}>
              Create Resource
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resource Detail Modal */}
      <Modal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        title="Resource Details"
        size="lg"
      >
        {selectedResource && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedResource.type)}`}>
                {selectedResource.type}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedResource.category)}`}>
                {selectedResource.category}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedResource.status)}`}>
                {selectedResource.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedResource.title}
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Views:</span>
                <span className="ml-2 font-medium">{selectedResource.views}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Likes:</span>
                <span className="ml-2 font-medium">{selectedResource.likes}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Read Time:</span>
                <span className="ml-2 font-medium">{selectedResource.readTime} min</span>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {selectedResource.content}
              </p>
            </div>
            
            {selectedResource.tags && selectedResource.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Resource"
      >
        {selectedResource && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete <strong>{selectedResource.title}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleResourceAction(selectedResource._id, 'delete')}
                loading={actionLoading}
              >
                Delete Resource
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminResources;
