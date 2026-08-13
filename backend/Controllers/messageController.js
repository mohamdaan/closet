const pool = require("../db/db");

const getOrCreateConversation = async (req, res) => {
  const userId = req.userId;
  const { other_user_id } = req.body;

  if (!other_user_id) {
    return res.status(400).json({ error: "other_user_id is required" });
  }

  if (Number(other_user_id) === userId) {
    return res.status(400).json({ error: "Cannot message yourself" });
  }

  const userOne = Math.min(userId, Number(other_user_id));
  const userTwo = Math.max(userId, Number(other_user_id));

  try {
    const existing = await pool.query(
      `SELECT * FROM conversations WHERE user_one_id = $1 AND user_two_id = $2`,
      [userOne, userTwo]
    );

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }

    const result = await pool.query(
      `INSERT INTO conversations (user_one_id, user_two_id) VALUES ($1, $2) RETURNING *`,
      [userOne, userTwo]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const sendMessage = async (req, res) => {
  const userId = req.userId;
  const { id: conversationId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Message content is required" });
  }

  try {
    const convo = await pool.query(
      `SELECT * FROM conversations WHERE id = $1 AND (user_one_id = $2 OR user_two_id = $2)`,
      [conversationId, userId]
    );

    if (convo.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [conversationId, userId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getMessages = async (req, res) => {
  const userId = req.userId;
  const { id: conversationId } = req.params;

  try {
    const convo = await pool.query(
      `SELECT * FROM conversations WHERE id = $1 AND (user_one_id = $2 OR user_two_id = $2)`,
      [conversationId, userId]
    );

    if (convo.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const result = await pool.query(
      `SELECT id, sender_id, content, created_at, read_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getConversations = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT conversations.id,
              users.id AS other_user_id, users.name, users.username,
              COUNT(messages.id) FILTER (
                WHERE messages.sender_id != $1 AND messages.read_at IS NULL
              ) AS unread_count
       FROM conversations
       JOIN users ON users.id = CASE
         WHEN conversations.user_one_id = $1 THEN conversations.user_two_id
         ELSE conversations.user_one_id
       END
       LEFT JOIN messages ON messages.conversation_id = conversations.id
       WHERE conversations.user_one_id = $1 OR conversations.user_two_id = $1
       GROUP BY conversations.id, users.id
       ORDER BY conversations.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const markAsRead = async (req, res) => {
  const userId = req.userId;
  const { id: conversationId } = req.params;

  try {
    await pool.query(
      `UPDATE messages
       SET read_at = NOW()
       WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL`,
      [conversationId, userId]
    );

    res.json({ message: "Marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
};