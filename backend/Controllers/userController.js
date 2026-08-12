const pool = require("../db/db");

const searchUsers = async (req, res) => {
  const userId = req.userId;
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "A search query is required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, username
       FROM users
       WHERE username ILIKE $1 AND id != $2
       LIMIT 20`,
      [`%${query}%`, userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { searchUsers };