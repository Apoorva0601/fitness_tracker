import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useDebounce } from '../../hooks/useCommon';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  PlayIcon,
  LightBulbIcon,
  HeartIcon,
  EyeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    type: '',
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
        limit: 12,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...filters,
      };

      const response = await resourceService.getResources(params);
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

  const handleLoadMore = () => {
    if (pagination.hasNext && !loading) {
      fetchResources(pagination.currentPage + 1);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      article: BookOpenIcon,
      video: PlayIcon,
      tip: LightBulbIcon,
    };
    return icons[type] || BookOpenIcon;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Fitness Resources
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Discover articles, tips, and videos to enhance your fitness journey
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Sort */}
            <Input.Select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </Input.Select>
          </div>
        </Card.Content>
      </Card>

      {/* Resources Grid */}
      {loading && resources.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSpinner.Card key={index} />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.type);
              return (
                <Link key={resource._id} to={`/app/resources/${resource._id}`}>
                  <Card hover className="h-full">
                    {/* Image */}
                    {resource.imageUrl && (
                      <div className="aspect-video bg-gray-200 dark:bg-dark-700 rounded-t-lg overflow-hidden">
                        <img
                          src={resource.imageUrl}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <Card.Content className="flex-1">
                      {/* Type and Category Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {resource.type}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                          {resource.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {resource.title}
                      </h3>

                      {/* Content Preview */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {resource.content.replace(/[#*]/g, '').substring(0, 120)}...
                      </p>

                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
                        <div className="flex items-center space-x-3">
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
                        </div>
                        <span>{formatDate(resource.createdAt, 'MMM d')}</span>
                      </div>
                    </Card.Content>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Load More Button */}
          {pagination.hasNext && (
            <div className="text-center">
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
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No resources found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery || Object.values(filters).some(v => v && v !== 'newest') 
                  ? "Try adjusting your search or filters"
                  : "Check back later for new fitness resources"
                }
              </p>
              {(searchQuery || Object.values(filters).some(v => v && v !== 'newest')) && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ category: '', type: '', sort: 'newest' });
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default Resources;
