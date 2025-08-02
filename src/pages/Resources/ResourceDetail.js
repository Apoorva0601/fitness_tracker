import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  PlayIcon,
  LightBulbIcon,
  HeartIcon,
  EyeIcon,
  ClockIcon,
  ShareIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
} from '@heroicons/react/24/solid';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [relatedResources, setRelatedResources] = useState([]);

  useEffect(() => {
    if (id) {
      fetchResource();
      fetchRelatedResources();
    }
  }, [id]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getResource(id);
      const resourceData = response.data.data;
      setResource(resourceData);
      setLiked(resourceData.isLiked || false);
      setBookmarked(resourceData.isBookmarked || false);
    } catch (error) {
      console.error('Error fetching resource:', error);
      toast.error('Failed to load resource');
      navigate('/app/resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedResources = async () => {
    try {
      const response = await resourceService.getResources({
        limit: 4,
        category: resource?.category,
        exclude: id,
      });
      setRelatedResources(response.data.data.resources);
    } catch (error) {
      console.error('Error fetching related resources:', error);
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await resourceService.unlikeResource(id);
        setResource(prev => ({
          ...prev,
          likes: prev.likes - 1
        }));
      } else {
        await resourceService.likeResource(id);
        setResource(prev => ({
          ...prev,
          likes: prev.likes + 1
        }));
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await resourceService.removeBookmark(id);
        toast.success('Removed from bookmarks');
      } else {
        await resourceService.addBookmark(id);
        toast.success('Added to bookmarks');
      }
      setBookmarked(!bookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark status');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share resource');
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

  const formatContent = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner.Card />
        <LoadingSpinner.Card />
      </div>
    );
  }

  if (!resource) {
    return (
      <Card>
        <Card.Content>
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Resource not found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The resource you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/app/resources')}>
              Back to Resources
            </Button>
          </div>
        </Card.Content>
      </Card>
    );
  }

  const TypeIcon = getTypeIcon(resource.type);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/app/resources')}
        className="mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Resources
      </Button>

      {/* Resource Content */}
      <Card>
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

        <Card.Content>
          {/* Header */}
          <div className="mb-6">
            {/* Badges */}
            <div className="flex items-center space-x-2 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(resource.type)}`}>
                <TypeIcon className="w-4 h-4 mr-1" />
                {resource.type}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(resource.category)}`}>
                {resource.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {resource.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {resource.readTime} min read
                </div>
                <div className="flex items-center">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  {resource.views} views
                </div>
                <div className="flex items-center">
                  <HeartIcon className="w-4 h-4 mr-1" />
                  {resource.likes} likes
                </div>
                <span>{formatDate(resource.createdAt, 'MMMM d, yyyy')}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={liked ? 'text-red-600 hover:text-red-700' : ''}
                >
                  {liked ? (
                    <HeartSolidIcon className="w-5 h-5" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={bookmarked ? 'text-yellow-600 hover:text-yellow-700' : ''}
                >
                  {bookmarked ? (
                    <BookmarkSolidIcon className="w-5 h-5" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                >
                  <ShareIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div 
            className="prose prose-gray dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(resource.content) }}
          />

          {/* Video Embed (if video type) */}
          {resource.type === 'video' && resource.videoUrl && (
            <div className="mt-8">
              <div className="aspect-video bg-gray-200 dark:bg-dark-700 rounded-lg overflow-hidden">
                <iframe
                  src={resource.videoUrl}
                  title={resource.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-600">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Related Resources */}
      {relatedResources.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Related Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedResources.map((relatedResource) => {
              const RelatedTypeIcon = getTypeIcon(relatedResource.type);
              return (
                <Link key={relatedResource._id} to={`/app/resources/${relatedResource._id}`}>
                  <Card hover className="h-full">
                    {relatedResource.imageUrl && (
                      <div className="aspect-video bg-gray-200 dark:bg-dark-700 rounded-t-lg overflow-hidden">
                        <img
                          src={relatedResource.imageUrl}
                          alt={relatedResource.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <Card.Content>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(relatedResource.type)}`}>
                          <RelatedTypeIcon className="w-3 h-3 mr-1" />
                          {relatedResource.type}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                        {relatedResource.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {relatedResource.readTime} min
                      </div>
                    </Card.Content>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetail;
