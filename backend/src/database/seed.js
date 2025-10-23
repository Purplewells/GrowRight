const Database = require('./db');

const seedData = {
  crops: [
    {
      name: 'Maize',
      scientific_name: 'Zea mays',
      npk_ratio: '15:15:15',
      seed_rate_per_hectare: 20,
      fertilizer_rate_per_hectare: 200,
      planting_season: 'April-July',
      growth_period_days: 120
    },
    {
      name: 'Rice',
      scientific_name: 'Oryza sativa',
      npk_ratio: '15:15:15',
      seed_rate_per_hectare: 40,
      fertilizer_rate_per_hectare: 150,
      planting_season: 'May-August',
      growth_period_days: 110
    },
    {
      name: 'Beans',
      scientific_name: 'Phaseolus vulgaris',
      npk_ratio: '10:20:10',
      seed_rate_per_hectare: 60,
      fertilizer_rate_per_hectare: 100,
      planting_season: 'April-June',
      growth_period_days: 90
    },
    {
      name: 'Cassava',
      scientific_name: 'Manihot esculenta',
      npk_ratio: '12:12:17',
      seed_rate_per_hectare: 10000, // stems per hectare
      fertilizer_rate_per_hectare: 120,
      planting_season: 'March-June',
      growth_period_days: 365
    }
  ],

  suppliers: [
    {
      name: 'Agro Solutions Lagos',
      contact_phone: '+2348012345678',
      location: 'Lagos, Nigeria',
      latitude: 6.5244,
      longitude: 3.3792,
      available_products: 'NPK Fertilizer, Seeds, Pesticides',
      is_verified: 1
    },
    {
      name: 'Northern Farms Supply',
      contact_phone: '+2348087654321',
      location: 'Kano, Nigeria',
      latitude: 12.0022,
      longitude: 8.5919,
      available_products: 'Fertilizer, Maize Seeds, Farm Tools',
      is_verified: 1
    },
    {
      name: 'Green Valley Agro',
      contact_phone: '+2347011223344',
      location: 'Ibadan, Nigeria',
      latitude: 7.3775,
      longitude: 3.9470,
      available_products: 'Organic Fertilizer, Seeds, Irrigation',
      is_verified: 1
    }
  ]
};

async function seedDatabase() {
  const db = new Database();
  
  try {
    await db.connect();
    
    // Seed crops
    console.log('Seeding crops...');
    for (const crop of seedData.crops) {
      const sql = `INSERT OR REPLACE INTO crops 
        (name, scientific_name, npk_ratio, seed_rate_per_hectare, fertilizer_rate_per_hectare, planting_season, growth_period_days)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      await db.run(sql, [
        crop.name,
        crop.scientific_name,
        crop.npk_ratio,
        crop.seed_rate_per_hectare,
        crop.fertilizer_rate_per_hectare,
        crop.planting_season,
        crop.growth_period_days
      ]);
    }
    
    // Seed suppliers
    console.log('Seeding suppliers...');
    for (const supplier of seedData.suppliers) {
      const sql = `INSERT OR REPLACE INTO suppliers 
        (name, contact_phone, location, latitude, longitude, available_products, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      await db.run(sql, [
        supplier.name,
        supplier.contact_phone,
        supplier.location,
        supplier.latitude,
        supplier.longitude,
        supplier.available_products,
        supplier.is_verified
      ]);
    }
    
    console.log('Database seeded successfully');
    
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;