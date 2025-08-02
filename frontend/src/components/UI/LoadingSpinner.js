import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizes[size]} ${className}`} />
  );
};

const LoadingCard = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 dark:bg-dark-700 rounded-lg h-48 w-full"></div>
      <div className="mt-4 space-y-2">
        <div className="bg-gray-200 dark:bg-dark-700 h-4 rounded w-3/4"></div>
        <div className="bg-gray-200 dark:bg-dark-700 h-4 rounded w-1/2"></div>
      </div>
    </div>
  );
};

const LoadingTableRow = ({ columns = 4 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="bg-gray-200 dark:bg-dark-700 h-4 rounded"></div>
        </td>
      ))}
    </tr>
  );
};

const LoadingPage = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

LoadingSpinner.Card = LoadingCard;
LoadingSpinner.TableRow = LoadingTableRow;
LoadingSpinner.Page = LoadingPage;

export default LoadingSpinner;
