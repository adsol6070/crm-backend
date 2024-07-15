"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("../config/logger"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ejs_1 = __importDefault(require("ejs"));
const transport = nodemailer_1.default.createTransport(config_1.default.email.smtp);
if (config_1.default.env !== "test") {
    transport
        .verify()
        .then(() => logger_1.default.info("Connected to email server"))
        .catch(() => logger_1.default.warn("Unable to connect to email server. Make sure you have configured the SMTP options in .env"));
}
const renderTemplate = async (templateName, data) => {
    const templatePath = path_1.default.join(__dirname, "../templates", "email", `${templateName}.ejs`);
    try {
        const template = fs_1.default.readFileSync(templatePath, "utf-8");
        return ejs_1.default.render(template, data);
    }
    catch (error) {
        logger_1.default.error("Error reading or rendering template:", error);
        throw error;
    }
};
const sendEmail = async (to, subject, templateName, templateData) => {
    try {
        const html = await renderTemplate(templateName, templateData);
        const msg = {
            from: config_1.default.email.from,
            to,
            subject,
            html,
        };
        await transport.sendMail(msg);
    }
    catch (error) {
        logger_1.default.error("Failed to send email:", error);
    }
};
const sendResetPasswordEmail = async (to, token) => {
    const subject = "Reset password";
    const resetPasswordUrl = `http://localhost:5173/auth/reset-password?token=${token}`;
    await sendEmail(to, subject, "resetPassword", { link: resetPasswordUrl });
};
exports.default = {
    sendEmail,
    sendResetPasswordEmail,
};
