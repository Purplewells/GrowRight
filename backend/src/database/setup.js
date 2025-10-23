const Database = require('./db');

async function setupDatabase() {
  const db = new Database();
  
  try {
    await db.connect();
    await db.createTables();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;