require("dotenv").config();
const mysql = require("mysql2"); // Ensure this line is present

// Create database configuration object
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS, // Note: Changed from DB_PASSWORD to DB_PASS to match .env
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectTimeout: 10000, // Increase connection timeout
};

console.log("Connecting to MySQL with config:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database, 
  port: dbConfig.port
});

// Create the connection
const db = mysql.createConnection(dbConfig);

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    console.error("Error code:", err.code);
    console.error("Error stack:", err.stack);
    
    // Don't exit process, but log the error
    console.error("Database connection error, but server will continue running");
  } else {
    console.log("Connected to MySQL database:", dbConfig.database);
  }
});

// Add error handler for runtime errors
db.on('error', (err) => {
  console.error('Database error:', err);
  
  // If server lost connection, attempt to reconnect
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was lost. Attempting to reconnect...');
    
    // Create a new connection
    const newConnection = mysql.createConnection(dbConfig);
    
    // Replace the old connection with the new one
    Object.assign(db, newConnection);
    
    // Connect with the new connection
    db.connect((connectErr) => {
      if (connectErr) {
        console.error('Failed to reconnect to database:', connectErr);
      } else {
        console.log('Successfully reconnected to database');
      }
    });
  }
});

module.exports = db;
