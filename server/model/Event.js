const { getPool } = require("../db");

class Event {
  static async create(eventData) {
    const {
      title,
      description,
      date,
      time,
      location,
      eligibility = null,
      slots,
      imageUrl = null,
      category,
      format = "online",
      createdBy,
      status = "pending"
    } = eventData;

    const query = `
      INSERT INTO events (title, description, date, time, location, eligibility, slots, imageUrl, category, format, createdBy, status, registeredUsers)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [
        title,
        description,
        date,
        time,
        location,
        eligibility || null,
        slots,
        imageUrl || null,
        category,
        format || "online",
        createdBy,
        status,
        JSON.stringify([])
      ]);
      return result;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const query = "SELECT * FROM events";
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query);
      return results;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const query = "SELECT * FROM events WHERE id = ?";
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [id]);
      return results.length > 0 ? results[0] : null;
    } finally {
      connection.release();
    }
  }

  static async findByCreatedBy(createdBy) {
    const query = "SELECT * FROM events WHERE createdBy = ?";
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [createdBy]);
      return results;
    } finally {
      connection.release();
    }
  }

  static async findByRegisteredUser(userId) {
    // Get all events and filter in JavaScript
    const query = "SELECT * FROM events";
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query);
      
      // Filter events where user is registered
      const filtered = results.filter(event => {
        let registeredUsers = event.registeredUsers;
        
        // Handle different data formats from MySQL
        if (!registeredUsers) {
          return false;
        }
        
        // If it's a string, parse it
        if (typeof registeredUsers === 'string') {
          try {
            registeredUsers = JSON.parse(registeredUsers);
          } catch {
            return false;
          }
        }
        
        // Now check if it's an array and contains the user
        if (Array.isArray(registeredUsers)) {
          return registeredUsers.includes(userId) || registeredUsers.some(u => String(u) === String(userId));
        }
        
        return false;
      });
      
      return filtered;
    } finally {
      connection.release();
    }
  }

  static async updateById(id, updateData) {
    const updates = Object.keys(updateData)
      .map(key => `${key} = ?`)
      .join(", ");

    const values = Object.values(updateData);
    values.push(id);

    const query = `UPDATE events SET ${updates} WHERE id = ?`;

    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, values);
      return result;
    } finally {
      connection.release();
    }
  }

  static async deleteById(id) {
    const query = "DELETE FROM events WHERE id = ?";
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [id]);
      return result;
    } finally {
      connection.release();
    }
  }

  static async registerUser(id, userId) {
    // Get current registered users
    const event = await this.findById(id);
    if (!event) {
      throw new Error("Event not found");
    }

    let registeredUsers = [];
    try {
      registeredUsers = JSON.parse(event.registeredUsers);
    } catch (err) {
      registeredUsers = [];
    }

    // Add user if not already registered
    if (!registeredUsers.includes(userId)) {
      registeredUsers.push(userId);
    }

    // Update slots and registered users
    const query = `
      UPDATE events 
      SET slots = slots - 1, registeredUsers = ?
      WHERE id = ? AND slots > 0
    `;

    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [JSON.stringify(registeredUsers), id]);
      return result;
    } finally {
      connection.release();
    }
  }
}

// Attendance class for tracking check-ins
class Attendance {
  static async recordAttendance(eventId, userId, qrCode = null) {
    const query = `
      INSERT INTO attendance (eventId, userId, qrCode)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      checkedInAt = CURRENT_TIMESTAMP
    `;
    
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [eventId, userId, qrCode]);
      return result;
    } finally {
      connection.release();
    }
  }

  static async getEventAttendance(eventId) {
    const query = `
      SELECT COUNT(*) as attendanceCount, 
             GROUP_CONCAT(userId) as attendedUsers
      FROM attendance
      WHERE eventId = ?
    `;
    
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [eventId]);
      return results[0] || { attendanceCount: 0, attendedUsers: null };
    } finally {
      connection.release();
    }
  }

  static async getUserAttendance(userId) {
    const query = `
      SELECT a.*, e.title as eventTitle
      FROM attendance a
      JOIN events e ON a.eventId = e.id
      WHERE a.userId = ?
      ORDER BY a.checkedInAt DESC
    `;
    
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [userId]);
      return results;
    } finally {
      connection.release();
    }
  }

  static async isUserAttended(eventId, userId) {
    const query = `
      SELECT id FROM attendance
      WHERE eventId = ? AND userId = ?
    `;
    
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [eventId, userId]);
      return results.length > 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = Event;
module.exports.Attendance = Attendance;