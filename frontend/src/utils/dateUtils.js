import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';

export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString);
};

export const formatDateTime = (date, formatString = 'MMM d, yyyy h:mm a') => {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString);
};

export const getRelativeDate = (date) => {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(parsedDate)) {
    return 'Today';
  }
  
  if (isYesterday(parsedDate)) {
    return 'Yesterday';
  }
  
  const daysDiff = differenceInDays(new Date(), parsedDate);
  
  if (daysDiff < 7) {
    return `${daysDiff} days ago`;
  }
  
  return formatDate(parsedDate);
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'yyyy-MM-dd');
};

export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  return checkDate >= start && checkDate <= end;
};
