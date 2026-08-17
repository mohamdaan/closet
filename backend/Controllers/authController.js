const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/db");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/email");

const register = async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, username, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, username, email, created_at`,
      [name, username, email, hashedPassword]
    );

    sendWelcomeEmail(email, name);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, username, email, password FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const changePassword = async (req, res) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current and new password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );
    const user = result.rows[0];

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, name FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (user) {
      const resetToken = jwt.sign(
        { userId: user.id, purpose: "password_reset" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const resetLink = `https://closet-rust-five.vercel.app/reset-password?token=${resetToken}`;
      sendPasswordResetEmail(email, resetLink);
    }

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "password_reset") {
      return res.status(401).json({ error: "Invalid token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [
      hashedPassword,
      decoded.userId,
    ]);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Reset link has expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid reset link" });
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
};
