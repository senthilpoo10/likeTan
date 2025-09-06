import nodemailer from "nodemailer";
import { Env } from "./env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: Env.EmailUser,
    pass: Env.EmailPass,
  },
});

/**
 * Sends an email.
 * @param to Recipient's email
 * @param subject Email subject
 * @param text Plain text body
 * @param html HTML body (optional)
 */
async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  const mailOptions = {
    from: `"Gang HQ" <${Env.EmailUser}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

/**
 * Sends a 2FA code via email.
 * @param email Recipient's email
 * @param code 2FA code
 * @param username User's name
 */
export async function send2FACode(
  email: string,
  code: string,
  username: string
) {
  const subject = "Gang Gang Gang - Game Code";
  const text = `Yo!\n\nWelcome to the gang, ${username}! 🔥 Here's your exclusive game code:\n\n🎮 Your Code: ${code}\n\nUse it wisely... or don’t. We don’t judge. 😎\n\nIf you didn’t request this, tell them to back off and get their own invite. 💥\n\nStay awesome,\nThe Gang HQ\n\nP.S. Stay dangerous. 🚀`;
  const html = `
    <h2>Yo, ${username}!</h2>
    <p>Welcome to the gang. 🔥 Here's your exclusive game code:</p>
    <h3 style="color: red;">🎮 Your Code: <b>${code}</b></h3>
    <p>Use it wisely... or don’t. We don’t judge. 😎</p>
    <p>If you didn’t request this, someone’s trying to get in on your action! Tell them to back off. 💥</p>
    <br>
    <p>Stay awesome,</p>
    <p><b>The Gang HQ</b></p>
    <p><i>P.S. Stay dangerous. 🚀</i></p>
  `;

  return sendEmail(email, subject, text, html);
}

/**
 * Sends a password reset email with a link.
 * @param email Recipient's email
 * @param resetLink The password reset link
 */
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const subject = "Gang Gang Gang - Reset Your Password";
  const text = `Hey!\n\nWe got a request to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nIf you didn’t request this, just ignore this email. 🔒\n\nStay awesome,\nThe Gang HQ`;
  const html = `
    <h2>Hey!</h2>
    <p>We got a request to reset your password. Click the link below to reset it:</p>
    <p><a href="${resetLink}">Reset your password</a></p>
    <p>If you didn’t request this, just ignore this email. 🔒</p>
    <br>
    <p>Stay awesome,</p>
    <p><b>The Gang HQ</b></p>
  `;

  return sendEmail(email, subject, text, html);
}

/**
 * Sends a login success email.
 * @param email Recipient's email
 * @param username User's name
 */
export async function sendRegisterSuccessEmail(
  email: string,
  username: string
) {
  const subject = "Gang Gang Gang - Register Successful";
  // const text = `Yo ${username}!\n\nJust wanted to let you know that you successfully registered. 🔥\n\nIf it wasn’t you, change your password right now! 🔐\n\nStay safe,\nThe Gang HQ`;
  const html = `
    <h2>Yo ${username}!</h2>
    <p>Just wanted to let you know that you successfully registered. 🔥</p>
    <p>If it wasn’t you, change your password right now! 🔐</p>
    <br>
    <p>Stay safe,</p>
    <p><b>The Gang HQ</b></p>
  `;

  return sendEmail(email, subject, "", html);
}

/**
 * Sends a congratulatory email for winning first place in the game.
 * @param email Recipient's email
 * @param username User's name
 */
export async function sendGameAchievementEmail(
  email: string,
  username: string
) {
  const subject = "Gang Gang Gang - You're #1!";
  const text = `Yo ${username}! 🎉\n\nCongratulations! You secured the first place in the game! 🔥🔥🔥\n\nKeep dominating, stay dangerous, and see you at the top again soon! 🏆\n\nStay awesome,\nThe Gang HQ`;
  const html = `
    <h2>Yo ${username}! 🎉</h2>
    <p>Congratulations! You secured the first place in the game! 🔥🔥🔥</p>
    <p>Keep dominating, stay dangerous, and see you at the top again soon! 🏆</p>
    <br>
    <p>Stay awesome,</p>
    <p><b>The Gang HQ</b></p>
  `;

  return sendEmail(email, subject, text, html);
}
