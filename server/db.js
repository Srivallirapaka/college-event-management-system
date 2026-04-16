const mysql = require("mysql2/promise");

let pool;

async function connectDB() {
  try {
    // Create connection pool
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "valli2408",
      database: process.env.DB_NAME || "eventdb",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    
    // Create tables if they don't exist
    await createTables(connection);
    
    connection.release();
    
    console.log("✅ MySQL Connected Successfully");
    return pool;
  } catch (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
    process.exit(1);
  }
}

async function createTables(connection) {
  try {
    // Create Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'user',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Events table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date VARCHAR(50),
        time VARCHAR(50),
        location VARCHAR(255),
        eligibility VARCHAR(255),
        slots INT,
        imageUrl VARCHAR(500),
        category VARCHAR(100),
        createdBy VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        registeredUsers JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
  }
}

async function disconnectDB() {
  if (pool) {
    await pool.end();
  }
}

function getPool() {
  return pool;
}

async function executeQuery(query, params = []) {
  if (!pool) {
    throw new Error("Database connection not established");
  }
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    connection.release();
  }
}

module.exports = { connectDB, disconnectDB, getPool, executeQuery };
