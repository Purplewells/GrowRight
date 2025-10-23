/**
 * Calculate fertilizer requirements based on crop type and land size
 */
function calculateFertilizerRequirements(crop, landSizeHectares) {
  if (!crop || !landSizeHectares) {
    throw new Error('Crop and land size are required');
  }

  const fertilizerAmount = crop.fertilizer_rate_per_hectare * landSizeHectares;
  const seedAmount = crop.seed_rate_per_hectare * landSizeHectares;

  return {
    fertilizerAmountKg: Math.round(fertilizerAmount * 100) / 100,
    seedAmountKg: Math.round(seedAmount * 100) / 100,
    npkRatio: crop.npk_ratio,
    cropName: crop.name
  };
}

/**
 * Calculate estimated costs for inputs
 */
function calculateEstimatedCosts(requirements, priceData = {}) {
  const defaultPrices = {
    fertilizerPerKg: 150, // NGN per kg
    seedPerKg: 200, // NGN per kg
    applicationCost: 50 // NGN per hectare
  };

  const prices = { ...defaultPrices, ...priceData };
  
  const fertilizerCost = requirements.fertilizerAmountKg * prices.fertilizerPerKg;
  const seedCost = requirements.seedAmountKg * prices.seedPerKg;
  const applicationCost = requirements.landSizeHectares * prices.applicationCost;
  
  return {
    fertilizerCost: Math.round(fertilizerCost),
    seedCost: Math.round(seedCost),
    applicationCost: Math.round(applicationCost),
    totalCost: Math.round(fertilizerCost + seedCost + applicationCost)
  };
}

/**
 * Validate land size input
 */
function validateLandSize(landSize) {
  const size = parseFloat(landSize);
  
  if (isNaN(size)) {
    return { valid: false, error: 'Land size must be a number' };
  }
  
  if (size <= 0) {
    return { valid: false, error: 'Land size must be greater than 0' };
  }
  
  if (size > 1000) {
    return { valid: false, error: 'Land size too large (max 1000 hectares)' };
  }
  
  return { valid: true, value: size };
}

/**
 * Convert between different land size units
 */
function convertLandSize(value, fromUnit, toUnit) {
  const conversions = {
    hectares: 1,
    acres: 2.47105, // 1 hectare = 2.47105 acres
    'square_meters': 10000, // 1 hectare = 10,000 sq meters
    'square_kilometers': 0.01 // 1 hectare = 0.01 sq km
  };
  
  if (!conversions[fromUnit] || !conversions[toUnit]) {
    throw new Error('Unsupported unit conversion');
  }
  
  // Convert to hectares first, then to target unit
  const hectares = value / conversions[fromUnit];
  return hectares * conversions[toUnit];
}

/**
 * Get seasonal recommendations for crops
 */
function getSeasonalRecommendations(cropName, currentMonth = null) {
  const month = currentMonth || new Date().getMonth() + 1; // 1-12
  
  const seasonalData = {
    'Maize': {
      plantingMonths: [4, 5, 6, 7], // April-July
      harvestMonths: [8, 9, 10, 11], // August-November
      recommendation: 'Best planted at start of rainy season'
    },
    'Rice': {
      plantingMonths: [5, 6, 7, 8], // May-August
      harvestMonths: [9, 10, 11, 12], // September-December
      recommendation: 'Requires consistent water supply'
    },
    'Beans': {
      plantingMonths: [4, 5, 6], // April-June
      harvestMonths: [7, 8, 9], // July-September
      recommendation: 'Plant after soil preparation'
    },
    'Cassava': {
      plantingMonths: [3, 4, 5, 6], // March-June
      harvestMonths: [12, 1, 2, 3], // December-March (next year)
      recommendation: 'Long-term crop, plant early in season'
    }
  };
  
  const cropData = seasonalData[cropName];
  if (!cropData) {
    return { message: 'Seasonal data not available for this crop' };
  }
  
  const isPlantingSeason = cropData.plantingMonths.includes(month);
  const isHarvestSeason = cropData.harvestMonths.includes(month);
  
  return {
    isPlantingSeason,
    isHarvestSeason,
    recommendation: cropData.recommendation,
    nextPlantingMonth: cropData.plantingMonths.find(m => m > month) || cropData.plantingMonths[0]
  };
}

/**
 * Format numbers for display (Nigerian context)
 */
function formatCurrency(amount, currency = 'NGN') {
  const symbols = {
    'NGN': '₦',
    'USD': '$',
    'GHS': 'GH₵',
    'KES': 'KSh'
  };
  
  const symbol = symbols[currency] || '₦';
  return `${symbol}${amount.toLocaleString()}`;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Log user interactions for analytics
 */
function logUserInteraction(phoneNumber, action, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    phoneNumber: phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // Mask middle digits
    action,
    data,
    userAgent: 'USSD'
  };
  
  console.log('User Interaction:', JSON.stringify(logEntry));
  
  // In production, you'd save this to a dedicated analytics database
  return logEntry;
}

module.exports = {
  calculateFertilizerRequirements,
  calculateEstimatedCosts,
  validateLandSize,
  convertLandSize,
  getSeasonalRecommendations,
  formatCurrency,
  calculateDistance,
  logUserInteraction
};