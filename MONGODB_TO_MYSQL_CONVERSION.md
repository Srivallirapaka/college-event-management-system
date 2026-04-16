# MongoDB to MySQL Conversion - Summary

## Overview
All MongoDB/Mongoose dependencies have been successfully converted to MySQL with `mysql2` package.

## Files Modified

### 1. **server/db.js** 
- **Before**: Used Mongoose with MongoDB Atlas or in-memory MongoDB (MongoMemoryServer)
- **After**: Uses `mysql2/promise` with connection pooling
- **Changes**:
  - Replaced `mongoose.connect()` with `mysql.createPool()`
  - Added automatic table creation for `users` and `events`
  - Added helper functions: `executeQuery()` 
  - Updated environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### 2. **server/model/Event.js**
- **Before**: Mongoose Schema with automatic methods (`save()`, `find()`, `findById()`, etc.)
- **After**: MySQL wrapper class with static methods
- **New Methods**:
  - `create()` - Insert new event
  - `findAll()` - Get all events
  - `findById()` - Get event by ID
  - `findByCreatedBy()` - Get organizer's events
  - `findByRegisteredUser()` - Get user's registered events
  - `updateById()` - Update event
  - `deleteById()` - Delete event
  - `registerUser()` - Register user for event

### 3. **server/model/User.js**
- **Before**: Mongoose Schema
- **After**: MySQL wrapper class with static methods
- **New Methods**:
  - `create()` - Insert new user
  - `findAll()` - Get all users
  - `findById()` - Get user by ID
  - `findByEmail()` - Get user by email
  - `updateById()` - Update user
  - `deleteById()` - Delete user

### 4. **server/routes/EventRoutes.js**
- **Before**: Used Mongoose methods on model instances
- **After**: Uses async static class methods for all database operations
- **Updated Routes**:
  - `POST /` - Create event
  - `GET /` - Get all events
  - `GET /:id` - Get event by ID
  - `GET /organizer/:organizerId` - Get organizer's events
  - `GET /user/:userId` - Get user's registered events
  - `POST /register/:id` - Register user for event
  - `DELETE /:id` - Delete event
  - `PUT /:id/approve` - Approve/reject event

### 5. **server/seed.js**
- **Before**: Used Mongoose methods (`Event.insertMany()`, `Event.deleteMany()`, etc.)
- **After**: Uses MySQL queries through Event class methods
- **Changes**:
  - Uses `Event.create()` in a loop instead of `insertMany()`
  - Uses direct SQL query for counting events
  - Uses direct SQL query for deleting all events

### 6. **server/server.js**
- **Before**: Created separate MySQL connection (unused) and relied on db.js
- **After**: Properly initializes database connection before starting routes
- **Changes**:
  - Removed redundant `mysql2` connection code
  - Added proper async initialization with `connectDB()`
  - Routes only registered after database connection succeeds

### 7. **server/package.json**
- **Before**: Dependencies included `mongoose` and `mongodb-memory-server`
- **After**: Replaced with `mysql2: ^3.6.5`
- **Removed**:
  - `mongodb-memory-server: ^11.0.1`
  - `mongoose: ^9.4.1`

### 8. **server/.env**
- **Before**: MongoDB connection strings (local and Atlas)
- **After**: MySQL configuration
- **New Variables**:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=valli2408
  DB_NAME=eventdb
  ```

## Database Schema

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Events Table
```sql
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
```

## Setup Instructions

### Prerequisites
- MySQL Server running on localhost
- Node.js and npm installed

### Steps
1. Create the eventdb database:
   ```sql
   CREATE DATABASE eventdb;
   ```

2. Update credentials in `.env` if needed:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=eventdb
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Seed the database:
   ```bash
   node seed.js
   ```

5. Start the server:
   ```bash
   npm start
   ```

## Notes
- All MongoDB/Mongoose code has been removed
- The `registeredUsers` field is stored as JSON in MySQL for compatibility
- Connection pooling is used for better performance
- Tables are automatically created on first connection
- All API endpoints remain the same and continue to work as before
