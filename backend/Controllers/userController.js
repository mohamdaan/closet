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

const getProfile = async (req, res) => {
  const requesterId = req.userId;
  const profileId = Number(req.params.id);

  try {
    const userResult = await pool.query(
      `SELECT id, name, username, bio, created_at FROM users WHERE id = $1`,
      [profileId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const profileUser = userResult.rows[0];

    const friendCountResult = await pool.query(
      `SELECT COUNT(*) FROM friendships
       WHERE (requester_id = $1 OR receiver_id = $1) AND status = 'accepted'`,
      [profileId]
    );

    const isSelf = requesterId === profileId;

    let isFriend = false;
    if (!isSelf) {
      const friendCheck = await pool.query(
        `SELECT 1 FROM friendships
         WHERE status = 'accepted'
           AND ((requester_id = $1 AND receiver_id = $2)
             OR (requester_id = $2 AND receiver_id = $1))`,
        [requesterId, profileId]
      );
      isFriend = friendCheck.rows.length > 0;
    }

    let posts = [];
    if (isSelf || isFriend) {
      const postsResult = await pool.query(
        `SELECT posts.id, posts.caption, posts.created_at,
                items.name AS item_name, items.brand, items.image_url,
                COUNT(DISTINCT likes.id) AS like_count,
                COUNT(DISTINCT comments.id) AS comment_count,
                EXISTS (
                  SELECT 1 FROM likes
                  WHERE likes.post_id = posts.id AND likes.user_id = $2
                ) AS liked_by_me
         FROM posts
         JOIN items ON posts.item_id = items.id
         LEFT JOIN likes ON likes.post_id = posts.id
         LEFT JOIN comments ON comments.post_id = posts.id
         WHERE posts.user_id = $1
         GROUP BY posts.id, items.id
         ORDER BY posts.created_at DESC`,
        [profileId, requesterId]
      );
      posts = postsResult.rows;
    }

    res.json({
      ...profileUser,
      friend_count: Number(friendCountResult.rows[0].count),
      is_self: isSelf,
      is_friend: isFriend,
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.userId;
  const { name, bio } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio)
       WHERE id = $3
       RETURNING id, name, username, bio`,
      [name, bio, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { searchUsers, getProfile, updateProfile };
