require('dotenv').config();
const { Pool } = require('pg');

class Database {
  constructor() {
    if (!Database.instance) {
      this.pool = new Pool({
        user: process.env.DB_USERNAME,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        max: 20,
        idleTimeoutMillis: 30000,
      });

      // Test connection immediately
      this.pool.connect()
        .then(client => {
          console.log('✅ PostgreSQL Database Connected!');
          client.release();
        })
        .catch(err => {
          console.error('❌ Failed to connect to Database:', err);
        });

      Database.instance = this;
    }

    return Database.instance;
  }
}

const instance = new Database();
Object.freeze(instance);

module.exports = instance;
