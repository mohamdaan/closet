const pool = require("../db/db");

const createItem = async (req, res) => {
  const userId = req.userId; // comes from requireAuth, not from the client
  const {
    name,
    brand,
    category,
    description,
    image_url,
    product_url,
    item_type,
  } = req.body;

  if (!name || !item_type) {
    return res.status(400).json({ error: "Name and item_type are required" });
  }

  if (!["WARDROBE", "WISHLIST"].includes(item_type)) {
    return res
      .status(400)
      .json({ error: "item_type must be WARDROBE or WISHLIST" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO items (user_id, name, brand, category, description, image_url, product_url, item_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        name,
        brand,
        category,
        description,
        image_url,
        product_url,
        item_type,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getMyItems = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteItem = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM items WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found or not yours" });
    }

    res.json({ message: "Item deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const editItem = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const {
    name,
    brand,
    category,
    description,
    image_url,
    product_url,
    item_type,
  } = req.body;

  if (item_type && !["WARDROBE", "WISHLIST"].includes(item_type)) {
    return res
      .status(400)
      .json({ error: "item_type must be WARDROBE or WISHLIST" });
  }

  try {
    const result = await pool.query(
      `UPDATE items
         SET name = COALESCE($1, name),
             brand = COALESCE($2, brand),
             category = COALESCE($3, category),
             description = COALESCE($4, description),
             image_url = COALESCE($5, image_url),
             product_url = COALESCE($6, product_url),
             item_type = COALESCE($7, item_type)
         WHERE id = $8 AND user_id = $9
         RETURNING *`,
      [
        name,
        brand,
        category,
        description,
        image_url,
        product_url,
        item_type,
        id,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found or not yours" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { createItem, getMyItems, deleteItem, editItem };
