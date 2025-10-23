const express = require('express');
const path = require('path');
const router = express.Router();

// Admin authentication middleware (basic for now)
const authenticateAdmin = (req, res, next) => {
  const { authorization } = req.headers;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (!authorization || authorization !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ error: 'Unauthorized. Use Bearer token authentication.' });
  }
  next();
};

// Serve admin dashboard
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin.html'));
});

// Dashboard data endpoint
router.get('/api/dashboard', authenticateAdmin, async (req, res) => {
  try {
    // Get summary statistics
    const totalCrops = await req.db.get('SELECT COUNT(*) as count FROM crops');
    const totalFarmers = await req.db.get('SELECT COUNT(*) as count FROM farmers');
    const totalSuppliers = await req.db.get('SELECT COUNT(*) as count FROM suppliers WHERE is_verified = 1');
    const totalCalculations = await req.db.get('SELECT COUNT(*) as count FROM calculations');
    
    // Recent calculations
    const recentCalculations = await req.db.all(`
      SELECT c.*, cr.name as crop_name, f.phone_number,
             datetime(c.calculation_date) as formatted_date
      FROM calculations c
      JOIN crops cr ON c.crop_id = cr.id
      JOIN farmers f ON c.farmer_id = f.id
      ORDER BY c.calculation_date DESC
      LIMIT 10
    `);
    
    // Popular crops
    const popularCrops = await req.db.all(`
      SELECT cr.name, COUNT(*) as usage_count
      FROM calculations c
      JOIN crops cr ON c.crop_id = cr.id
      GROUP BY cr.name
      ORDER BY usage_count DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        totalCrops: totalCrops.count,
        totalFarmers: totalFarmers.count,
        totalSuppliers: totalSuppliers.count,
        totalCalculations: totalCalculations.count
      },
      recentCalculations,
      popularCrops
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Manage crops
router.get('/api/crops', authenticateAdmin, async (req, res) => {
  try {
    const crops = await req.db.all('SELECT * FROM crops ORDER BY name');
    res.json(crops);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

router.post('/api/crops', authenticateAdmin, async (req, res) => {
  try {
    const { name, scientific_name, npk_ratio, seed_rate_per_hectare, fertilizer_rate_per_hectare, planting_season, growth_period_days } = req.body;
    
    const result = await req.db.run(`
      INSERT INTO crops (name, scientific_name, npk_ratio, seed_rate_per_hectare, fertilizer_rate_per_hectare, planting_season, growth_period_days)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, scientific_name, npk_ratio, seed_rate_per_hectare, fertilizer_rate_per_hectare, planting_season, growth_period_days]);
    
    res.json({ id: result.id, message: 'Crop added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add crop' });
  }
});

router.put('/api/crops/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, scientific_name, npk_ratio, seed_rate_per_hectare, fertilizer_rate_per_hectare, planting_season, growth_period_days } = req.body;
    
    await req.db.run(`
      UPDATE crops 
      SET name = ?, scientific_name = ?, npk_ratio = ?, seed_rate_per_hectare = ?, 
          fertilizer_rate_per_hectare = ?, planting_season = ?, growth_period_days = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, scientific_name, npk_ratio, seed_rate_per_hectare, fertilizer_rate_per_hectare, planting_season, growth_period_days, id]);
    
    res.json({ message: 'Crop updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update crop' });
  }
});

router.delete('/api/crops/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await req.db.run('DELETE FROM crops WHERE id = ?', [id]);
    res.json({ message: 'Crop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete crop' });
  }
});

// Manage suppliers
router.get('/api/suppliers', authenticateAdmin, async (req, res) => {
  try {
    const suppliers = await req.db.all('SELECT * FROM suppliers ORDER BY name');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

router.post('/api/suppliers', authenticateAdmin, async (req, res) => {
  try {
    const { name, contact_phone, location, latitude, longitude, available_products, is_verified } = req.body;
    
    const result = await req.db.run(`
      INSERT INTO suppliers (name, contact_phone, location, latitude, longitude, available_products, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, contact_phone, location, latitude || null, longitude || null, available_products, is_verified ? 1 : 0]);
    
    res.json({ id: result.id, message: 'Supplier added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add supplier' });
  }
});

router.put('/api/suppliers/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_phone, location, latitude, longitude, available_products, is_verified } = req.body;
    
    await req.db.run(`
      UPDATE suppliers 
      SET name = ?, contact_phone = ?, location = ?, latitude = ?, longitude = ?, 
          available_products = ?, is_verified = ?
      WHERE id = ?
    `, [name, contact_phone, location, latitude || null, longitude || null, available_products, is_verified ? 1 : 0, id]);
    
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

router.delete('/api/suppliers/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await req.db.run('DELETE FROM suppliers WHERE id = ?', [id]);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// Farmer analytics
router.get('/api/farmers', authenticateAdmin, async (req, res) => {
  try {
    const farmers = await req.db.all(`
      SELECT f.*, COUNT(c.id) as calculation_count,
             datetime(f.last_active) as last_active_formatted
      FROM farmers f
      LEFT JOIN calculations c ON f.id = c.farmer_id
      GROUP BY f.id
      ORDER BY f.last_active DESC
      LIMIT 100
    `);
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

// System monitoring
router.get('/api/system', authenticateAdmin, async (req, res) => {
  try {
    // Database size
    const dbStats = await req.db.get("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()");
    
    // Recent errors (would need error logging table in production)
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      databaseSize: dbStats?.size || 0,
      timestamp: new Date().toISOString()
    };

    res.json(systemInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system info' });
  }
});

module.exports = router;