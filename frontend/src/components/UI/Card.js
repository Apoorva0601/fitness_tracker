import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className = '', hover = false, ...props }) => {
  const classes = clsx(
    'bg-white dark:bg-dark-800 rounded-lg shadow-md border border-gray-200 dark:border-dark-700 transition-colors duration-200',
    {
      'hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer': hover,
    },
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('px-6 py-4 border-b border-gray-200 dark:border-dark-700', className)} {...props}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('px-6 py-4 border-t border-gray-200 dark:border-dark-700', className)} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900 dark:text-white', className)} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={clsx('text-sm text-gray-600 dark:text-gray-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Description = CardDescription;

export default Card;
