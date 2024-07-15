import nodemailer, { SendMailOptions } from "nodemailer";
import config from "../config/config";
import logger from "../config/logger";
import path from "path";
import fs from "fs";
import ejs from "ejs";

const transport = nodemailer.createTransport(config.email.smtp);

if (config.env !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
      logger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env",
      ),
    );
}

const renderTemplate = async (
  templateName: string,
  data: any,
): Promise<string> => {
  const templatePath = path.join(
    __dirname,
    "../templates",
    "email",
    `${templateName}.ejs`,
  );
  try {
    const template = fs.readFileSync(templatePath, "utf-8");
    return ejs.render(template, data);
  } catch (error) {
    logger.error("Error reading or rendering template:", error);
    throw error;
  }
};

const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  templateData: any,
): Promise<void> => {
  try {
    const html = await renderTemplate(templateName, templateData);
    const msg: SendMailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
    };
    await transport.sendMail(msg);
  } catch (error) {
    logger.error("Failed to send email:", error);
  }
};

const sendResetPasswordEmail = async (to: string, token: string) => {
  const subject = "Reset password";
  const resetPasswordUrl = `http://:5173/auth/reset-password?token=${token}`;
  await sendEmail(to, subject, "resetPassword", { link: resetPasswordUrl });
};

export default {
  sendEmail,
  sendResetPasswordEmail,
};

