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
      createdBy,
      status = "pending"
    } = eventData;

    const query = `
      INSERT INTO events (title, description, date, time, location, eligibility, slots, imageUrl, category, createdBy, status, registeredUsers)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    const query = "SELECT * FROM events WHERE JSON_CONTAINS(registeredUsers, ?)";
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [JSON.stringify(userId)]);
      return results;
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

module.exports = Event;