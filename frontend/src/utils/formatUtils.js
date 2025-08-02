export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0 min';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

export const formatCalories = (calories) => {
  if (!calories || calories < 0) return '0 cal';
  
  if (calories >= 1000) {
    return `${(calories / 1000).toFixed(1)}k cal`;
  }
  
  return `${calories} cal`;
};

export const calculateBMI = (weight, height) => {
  // weight in kg, height in cm
  if (!weight || !height || weight <= 0 || height <= 0) return null;
  
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  return Math.round(bmi * 10) / 10;
};

export const getBMICategory = (bmi) => {
  if (!bmi) return '';
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obesity';
};

export const formatNumber = (number, decimals = 0) => {
  if (!number && number !== 0) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercentage = (value, total) => {
  if (!value || !total || total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  return `${Math.round(percentage)}%`;
};
