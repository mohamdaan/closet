const pool = require("../db/db");

const createPost = async (req, res) => {
  const userId = req.userId;
  const { item_id, caption } = req.body;

  if (!item_id) {
    return res.status(400).json({ error: "item_id is required" });
  }

  try {
    // Confirm the item exists AND belongs to this user before letting them post it
    const itemCheck = await pool.query(
      `SELECT id FROM items WHERE id = $1 AND user_id = $2`,
      [item_id, userId]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: "Item not found or not yours" });
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, item_id, caption)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, item_id, caption]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getFeed = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT posts.id, posts.caption, posts.created_at,
              users.id AS user_id, users.username, users.name,
              items.id AS item_id, items.name AS item_name, items.brand, items.image_url
       FROM posts
       JOIN users ON posts.user_id = users.id
       JOIN items ON posts.item_id = items.id
       WHERE posts.user_id = $1
          OR posts.user_id IN (
            SELECT receiver_id FROM friendships WHERE requester_id = $1 AND status = 'accepted'
            UNION
            SELECT requester_id FROM friendships WHERE receiver_id = $1 AND status = 'accepted'
          )
       ORDER BY posts.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const deletePost = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found or not yours" });
    }

    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const likePost = async (req, res) => {
  const userId = req.userId;
  const { id: postId } = req.params;

  try {
    // Check if already liked — if so, unlike (delete). Otherwise, like (insert).
    const existing = await pool.query(
      `SELECT id FROM likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
        [userId, postId]
      );
      return res.json({ message: "Post unliked" });
    }

    const result = await pool.query(
      `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *`,
      [userId, postId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const addComment = async (req, res) => {
  const userId = req.userId;
  const { id: postId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [userId, postId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getComments = async (req, res) => {
  const { id: postId } = req.params;

  try {
    const result = await pool.query(
      `SELECT comments.id, comments.content, comments.created_at,
                users.id AS user_id, users.username
         FROM comments
         JOIN users ON comments.user_id = users.id
         WHERE comments.post_id = $1
         ORDER BY comments.created_at ASC`,
      [postId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  createPost,
  getFeed,
  deletePost,
  likePost,
  addComment,
  getComments,
};
