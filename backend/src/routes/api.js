const express = require('express');
const router = express.Router();

// Get all crops
router.get('/crops', async (req, res) => {
  try {
    const crops = await req.db.all('SELECT * FROM crops ORDER BY name');
    res.json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

// Get specific crop
router.get('/crops/:id', async (req, res) => {
  try {
    const crop = await req.db.get('SELECT * FROM crops WHERE id = ?', [req.params.id]);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    res.json(crop);
  } catch (error) {
    console.error('Error fetching crop:', error);
    res.status(500).json({ error: 'Failed to fetch crop' });
  }
});

// Get suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const { location } = req.query;
    let sql = 'SELECT * FROM suppliers WHERE is_verified = 1';
    let params = [];

    if (location) {
      sql += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    sql += ' ORDER BY name';
    
    const suppliers = await req.db.all(sql, params);
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Get calculation history for a farmer
router.get('/calculations/:phoneNumber', async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    
    const sql = `
      SELECT c.*, cr.name as crop_name, f.phone_number
      FROM calculations c
      JOIN farmers f ON c.farmer_id = f.id
      JOIN crops cr ON c.crop_id = cr.id
      WHERE f.phone_number = ?
      ORDER BY c.calculation_date DESC
      LIMIT 10
    `;
    
    const calculations = await req.db.all(sql, [phoneNumber]);
    res.json(calculations);
  } catch (error) {
    console.error('Error fetching calculations:', error);
    res.status(500).json({ error: 'Failed to fetch calculations' });
  }
});

// Calculate fertilizer requirements (manual API endpoint)
router.post('/calculate', async (req, res) => {
  try {
    const { cropId, landSizeHectares } = req.body;

    if (!cropId || !landSizeHectares) {
      return res.status(400).json({ 
        error: 'Crop ID and land size are required' 
      });
    }

    // Get crop information
    const crop = await req.db.get('SELECT * FROM crops WHERE id = ?', [cropId]);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    // Calculate requirements
    const fertilizerAmountKg = crop.fertilizer_rate_per_hectare * landSizeHectares;
    const seedAmountKg = crop.seed_rate_per_hectare * landSizeHectares;

    // Estimated costs (placeholder - would be dynamic in production)
    const fertilizerCostPerKg = 150; // NGN per kg
    const seedCostPerKg = 200; // NGN per kg
    const estimatedCost = (fertilizerAmountKg * fertilizerCostPerKg) + (seedAmountKg * seedCostPerKg);

    const calculation = {
      crop: crop.name,
      landSizeHectares,
      fertilizerAmountKg: Math.round(fertilizerAmountKg * 100) / 100,
      seedAmountKg: Math.round(seedAmountKg * 100) / 100,
      estimatedCostNGN: Math.round(estimatedCost),
      npkRatio: crop.npk_ratio,
      plantingSeason: crop.planting_season,
      growthPeriodDays: crop.growth_period_days
    };

    res.json(calculation);

  } catch (error) {
    console.error('Error calculating requirements:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'GrowRight API',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;