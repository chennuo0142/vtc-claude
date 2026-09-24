import "server-only";
import nodemailer from "nodemailer";
import type { Locale } from "@/lib/i18n/config";

const globalForMail = globalThis as unknown as { mailTransport?: nodemailer.Transporter };

function getTransport(): nodemailer.Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  globalForMail.mailTransport ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    // Port 587 : connexion en clair puis STARTTLS obligatoire (secure=false + requireTLS).
    // Port 465 : TLS implicite (SMTP_SECURE=true).
    secure: process.env.SMTP_SECURE === "true",
    requireTLS: process.env.SMTP_SECURE !== "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return globalForMail.mailTransport;
}

export type EmailContent = { subject: string; text: string; html: string };

const RESET_EMAIL_COPY = {
  fr: {
    subject: "Réinitialisation de votre mot de passe",
    title: "Réinitialisation de votre mot de passe",
    intro: "Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.",
    button: "Choisir un nouveau mot de passe",
    fallback: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
    validity: "Ce lien est valable 15 minutes et ne peut être utilisé qu'une seule fois.",
    ignore: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe restera inchangé.",
  },
  en: {
    subject: "Reset your password",
    title: "Reset your password",
    intro: "You asked to reset your password. Click the button below to choose a new one.",
    button: "Choose a new password",
    fallback: "If the button does not work, copy this link into your browser:",
    validity: "This link is valid for 15 minutes and can only be used once.",
    ignore: "If you did not request this, you can ignore this email: your password will remain unchanged.",
  },
  zh: {
    subject: "重置您的密码",
    title: "重置您的密码",
    intro: "您请求重置密码。请点击下方按钮设置新密码。",
    button: "设置新密码",
    fallback: "如果按钮无法使用，请将此链接复制到浏览器中：",
    validity: "此链接 15 分钟内有效，且只能使用一次。",
    ignore: "如果这不是您本人的操作，请忽略此邮件，您的密码不会被更改。",
  },
} satisfies Record<Locale, Record<string, string>>;

export function buildPasswordResetEmail(url: string, locale: Locale): EmailContent {
  const c = RESET_EMAIL_COPY[locale];

  const text = [c.title, "", c.intro, "", url, "", c.validity, "", c.ignore].join("\n");

  // `url` ne contient que des caractères base64url/URL-encodés : aucune injection HTML possible.
  const html = `<!DOCTYPE html>
<html lang="${locale}">
  <body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1a1d21;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #d9dce1;">
          <tr><td style="padding:32px 32px 8px;">
            <h1 style="margin:0;font-size:20px;letter-spacing:0.02em;">${c.title}</h1>
          </td></tr>
          <tr><td style="padding:8px 32px;font-size:15px;line-height:1.5;">
            <p style="margin:0 0 24px;">${c.intro}</p>
            <p style="margin:0 0 24px;">
              <a href="${url}" style="display:inline-block;padding:12px 24px;background:#111111;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;">${c.button}</a>
            </p>
            <p style="margin:0 0 8px;font-size:13px;color:#555b64;">${c.fallback}</p>
            <p style="margin:0 0 24px;font-size:13px;word-break:break-all;"><a href="${url}" style="color:#111111;">${url}</a></p>
            <p style="margin:0 0 8px;font-size:13px;color:#555b64;">${c.validity}</p>
            <p style="margin:0;font-size:13px;color:#555b64;">${c.ignore}</p>
          </td></tr>
          <tr><td style="padding:24px 32px;font-size:12px;color:#8a9099;">Vtc_claude</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject: c.subject, text, html };
}

export async function sendPasswordResetEmail(to: string, url: string, locale: Locale): Promise<void> {
  const content = buildPasswordResetEmail(url, locale);
  const transport = getTransport();

  if (!transport) {
    // Aucun SMTP configuré (développement local) : on n'imprime le lien qu'en dehors de la production.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[mail] SMTP non configuré — lien de réinitialisation pour ${to} : ${url}`);
    } else {
      console.error("[mail] SMTP non configuré : email de réinitialisation non envoyé");
    }
    return;
  }

  await transport.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
}
