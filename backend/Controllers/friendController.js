const pool = require("../db/db");

const sendRequest = async (req, res) => {
  const requesterId = req.userId;
  const { receiver_id } = req.body;

  if (!receiver_id) {
    return res.status(400).json({ error: "receiver_id is required" });
  }

  if (Number(receiver_id) === requesterId) {
    return res.status(400).json({ error: "You cannot friend yourself" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO friendships (requester_id, receiver_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [requesterId, receiver_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Friend request already exists" });
    }
    if (error.code === "23503") {
      return res.status(404).json({ error: "That user doesn't exist" });
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const respondToRequest = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ error: "status must be accepted or rejected" });
  }

  try {
    // Only the receiver of the request can accept/reject it
    const result = await pool.query(
      `UPDATE friendships
       SET status = $1
       WHERE id = $2 AND receiver_id = $3 AND status = 'pending'
       RETURNING *`,
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getFriends = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT users.id, users.name, users.username
       FROM friendships
       JOIN users ON (
         users.id = CASE
           WHEN friendships.requester_id = $1 THEN friendships.receiver_id
           ELSE friendships.requester_id
         END
       )
       WHERE (friendships.requester_id = $1 OR friendships.receiver_id = $1)
         AND friendships.status = 'accepted'`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getPendingRequests = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT friendships.id, users.id AS requester_id, users.name, users.username
       FROM friendships
       JOIN users ON users.id = friendships.requester_id
       WHERE friendships.receiver_id = $1 AND friendships.status = 'pending'`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getFriendsOf = async (req, res) => {
  const requesterId = req.userId;
  const targetId = Number(req.params.userId);

  try {
    const isSelf = requesterId === targetId;

    let isFriend = false;
    if (!isSelf) {
      const check = await pool.query(
        `SELECT 1 FROM friendships
         WHERE status = 'accepted'
           AND ((requester_id = $1 AND receiver_id = $2)
             OR (requester_id = $2 AND receiver_id = $1))`,
        [requesterId, targetId]
      );
      isFriend = check.rows.length > 0;
    }

    if (!isSelf && !isFriend) {
      return res.status(403).json({ error: "You must be friends to view this list" });
    }

    const result = await pool.query(
      `SELECT users.id, users.name, users.username
       FROM friendships
       JOIN users ON (
         users.id = CASE
           WHEN friendships.requester_id = $1 THEN friendships.receiver_id
           ELSE friendships.requester_id
         END
       )
       WHERE (friendships.requester_id = $1 OR friendships.receiver_id = $1)
         AND friendships.status = 'accepted'`,
      [targetId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { sendRequest, respondToRequest, getFriends, getPendingRequests, getFriendsOf };