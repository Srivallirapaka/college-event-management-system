const { getPool } = require("../db");

class User {
  static async create(userData) {
    const { name, email, role = "user" } = userData;

    const query = `
      INSERT INTO users (name, email, role)
      VALUES (?, ?, ?)
    `;

    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [name, email, role]);
      return result;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const query = "SELECT * FROM users";
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
    const query = "SELECT * FROM users WHERE id = ?";
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [id]);
      return results.length > 0 ? results[0] : null;
    } finally {
      connection.release();
    }
  }

  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = ?";
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [email]);
      return results.length > 0 ? results[0] : null;
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

    const query = `UPDATE users SET ${updates} WHERE id = ?`;

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
    const query = "DELETE FROM users WHERE id = ?";
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, [id]);
      return result;
    } finally {
      connection.release();
    }
  }
}

module.exports = User;