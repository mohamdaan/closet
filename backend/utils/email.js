const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendWelcomeEmail = async (toEmail, name) => {
  try {
    await resend.emails.send({
      from: "Closet <onboarding@resend.dev>",
      to: toEmail,
      subject: "Welcome to Closet!",
      html: `<p>Hi ${name},</p><p>Welcome to Closet — your new home for tracking your wardrobe and sharing outfits with friends.</p>`,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};

const sendPasswordResetEmail = async (toEmail, resetLink) => {
  try {
    await resend.emails.send({
      from: "Closet <onboarding@resend.dev>",
      to: toEmail,
      subject: "Reset your Closet password",
      html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p><p>This link expires in 15 minutes. If you didn't request this, you can ignore this email.</p>`,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };