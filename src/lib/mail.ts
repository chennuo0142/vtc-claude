import "server-only";
import nodemailer from "nodemailer";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl } from "@/lib/passwordReset";

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

const VERIFY_EMAIL_COPY = {
  fr: {
    subject: "Confirmez votre adresse email",
    title: "Confirmez votre adresse email",
    intro: "Merci pour votre demande d'inscription. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email ; votre demande sera ensuite transmise à un administrateur.",
    button: "Confirmer mon adresse email",
    fallback: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
    validity: "Ce lien est valable 24 heures.",
    ignore: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
  },
  en: {
    subject: "Confirm your email address",
    title: "Confirm your email address",
    intro: "Thank you for your registration request. Click the button below to confirm your email address; your request will then be forwarded to an administrator.",
    button: "Confirm my email address",
    fallback: "If the button does not work, copy this link into your browser:",
    validity: "This link is valid for 24 hours.",
    ignore: "If you did not make this request, you can ignore this email.",
  },
  zh: {
    subject: "请确认您的邮箱地址",
    title: "请确认您的邮箱地址",
    intro: "感谢您提交注册申请。请点击下方按钮确认您的邮箱地址，之后您的申请将转交给管理员审核。",
    button: "确认我的邮箱地址",
    fallback: "如果按钮无法使用，请将此链接复制到浏览器中：",
    validity: "此链接 24 小时内有效。",
    ignore: "如果这不是您本人的操作，请忽略此邮件。",
  },
} satisfies Record<Locale, Record<string, string>>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Cta = { url: string; label: string };

// Gabarit commun. `paragraphs` et `afterCta` sont du HTML déjà échappé par l'appelant ;
// `title` et `cta` sont échappés ici.
function renderLayout(opts: {
  locale: Locale;
  title: string;
  paragraphs: string[];
  cta?: Cta;
  afterCta?: string[];
}): string {
  const { locale, title, paragraphs, cta, afterCta = [] } = opts;
  const body = paragraphs.map((p) => `<p style="margin:0 0 24px;">${p}</p>`).join("\n            ");
  const button = cta
    ? `<p style="margin:0 0 24px;">
              <a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:12px 24px;background:#111111;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;">${escapeHtml(cta.label)}</a>
            </p>`
    : "";
  const notes = afterCta.join("\n            ");

  return `<!DOCTYPE html>
<html lang="${locale}">
  <body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1a1d21;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #d9dce1;">
          <tr><td style="padding:32px 32px 8px;">
            <h1 style="margin:0;font-size:20px;letter-spacing:0.02em;">${escapeHtml(title)}</h1>
          </td></tr>
          <tr><td style="padding:8px 32px;font-size:15px;line-height:1.5;">
            ${body}
            ${button}
            ${notes}
          </td></tr>
          <tr><td style="padding:24px 32px;font-size:12px;color:#8a9099;">Vtc_claude</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function buildPasswordResetEmail(url: string, locale: Locale): EmailContent {
  const c = RESET_EMAIL_COPY[locale];

  const text = [c.title, "", c.intro, "", url, "", c.validity, "", c.ignore].join("\n");

  const html = renderLayout({
    locale,
    title: c.title,
    paragraphs: [escapeHtml(c.intro)],
    cta: { url, label: c.button },
    afterCta: [
      `<p style="margin:0 0 8px;font-size:13px;color:#555b64;">${escapeHtml(c.fallback)}</p>`,
      `<p style="margin:0 0 24px;font-size:13px;word-break:break-all;"><a href="${escapeHtml(url)}" style="color:#111111;">${escapeHtml(url)}</a></p>`,
      `<p style="margin:0 0 8px;font-size:13px;color:#555b64;">${escapeHtml(c.validity)}</p>`,
      `<p style="margin:0;font-size:13px;color:#555b64;">${escapeHtml(c.ignore)}</p>`,
    ],
  });

  return { subject: c.subject, text, html };
}

export function buildEmailVerificationEmail(url: string, locale: Locale): EmailContent {
  const c = VERIFY_EMAIL_COPY[locale];

  const text = [c.title, "", c.intro, "", url, "", c.validity, "", c.ignore].join("\n");

  const html = renderLayout({
    locale,
    title: c.title,
    paragraphs: [escapeHtml(c.intro)],
    cta: { url, label: c.button },
    afterCta: [
      `<p style="margin:0 0 8px;font-size:13px;color:#555b64;">${escapeHtml(c.fallback)}</p>`,
      `<p style="margin:0 0 24px;font-size:13px;word-break:break-all;"><a href="${escapeHtml(url)}" style="color:#111111;">${escapeHtml(url)}</a></p>`,
      `<p style="margin:0 0 8px;font-size:13px;color:#555b64;">${escapeHtml(c.validity)}</p>`,
      `<p style="margin:0;font-size:13px;color:#555b64;">${escapeHtml(c.ignore)}</p>`,
    ],
  });

  return { subject: c.subject, text, html };
}

// Ne lève jamais : un incident SMTP ne doit pas faire échouer l'action métier.
async function sendMail(to: string, content: EmailContent, devLog: string): Promise<void> {
  const transport = getTransport();

  if (!transport) {
    // Aucun SMTP configuré (développement local) : on n'imprime le contenu qu'en dehors de la production.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[mail] SMTP non configuré — ${devLog} (${to})\n${content.text}`);
    } else {
      console.error(`[mail] SMTP non configuré : email non envoyé (${devLog})`);
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

export async function sendPasswordResetEmail(to: string, url: string, locale: Locale): Promise<void> {
  await sendMail(to, buildPasswordResetEmail(url, locale), `lien de réinitialisation : ${url}`);
}

export async function sendEmailVerificationEmail(to: string, url: string, locale: Locale): Promise<void> {
  await sendMail(to, buildEmailVerificationEmail(url, locale), `lien de confirmation d'email : ${url}`);
}

// ---------------------------------------------------------------------------
// Notifications profil / administration
// ---------------------------------------------------------------------------

const NOTIFY_EMAIL_COPY = {
  fr: {
    profileUpdated: {
      subject: "Votre modification de profil a bien été reçue",
      hello: (name: string) => `Bonjour ${name},`,
      intro:
        "Nous avons bien reçu les modifications de votre profil. Elles sont en attente de validation par un administrateur ; votre profil public reste inchangé d'ici là.",
      outro: "Vous recevrez un email dès que votre demande aura été traitée.",
      button: "Voir mon profil",
    },
    adminPending: {
      subject: "Des tâches sont à traiter dans l'espace admin",
      intro: "Des demandes sont en attente de validation dans l'espace administrateur :",
      modifications: (n: number) => `Modifications de profil : ${n}`,
      inscriptions: (n: number) => `Inscriptions : ${n}`,
      buttonModifications: "Traiter les modifications",
      buttonInscriptions: "Traiter les inscriptions",
    },
    processed: {
      subject: "Votre demande a été traitée",
      title: "Votre demande a été traitée",
      profileApproved: "Vos modifications de profil ont été validées : elles sont désormais visibles sur votre profil public.",
      profileRejected: "Vos modifications de profil n'ont pas été retenues. Votre profil public reste inchangé.",
      registrationApproved: "Votre inscription a été validée. Vous pouvez dès maintenant vous connecter.",
      registrationRejected: "Votre demande d'inscription n'a pas été retenue.",
      buttonProfile: "Voir mon profil",
      buttonLogin: "Me connecter",
    },
    passwordChanged: {
      subject: "Votre mot de passe a été modifié",
      title: "Votre mot de passe a été modifié",
      intro: "Le mot de passe de votre compte vient d'être modifié.",
      warning: "Si vous n'êtes pas à l'origine de cette modification, réinitialisez immédiatement votre mot de passe.",
      button: "Réinitialiser mon mot de passe",
    },
  },
  en: {
    profileUpdated: {
      subject: "We received your profile update",
      hello: (name: string) => `Hello ${name},`,
      intro:
        "We received the changes to your profile. They are awaiting approval by an administrator; your public profile stays unchanged until then.",
      outro: "You will receive an email as soon as your request has been processed.",
      button: "View my profile",
    },
    adminPending: {
      subject: "Tasks are waiting in the admin area",
      intro: "Requests are awaiting review in the admin area:",
      modifications: (n: number) => `Profile changes: ${n}`,
      inscriptions: (n: number) => `Registrations: ${n}`,
      buttonModifications: "Review changes",
      buttonInscriptions: "Review registrations",
    },
    processed: {
      subject: "Your request has been processed",
      title: "Your request has been processed",
      profileApproved: "Your profile changes have been approved: they are now visible on your public profile.",
      profileRejected: "Your profile changes were not accepted. Your public profile stays unchanged.",
      registrationApproved: "Your registration has been approved. You can now sign in.",
      registrationRejected: "Your registration request was not accepted.",
      buttonProfile: "View my profile",
      buttonLogin: "Sign in",
    },
    passwordChanged: {
      subject: "Your password was changed",
      title: "Your password was changed",
      intro: "The password of your account has just been changed.",
      warning: "If you did not make this change, reset your password immediately.",
      button: "Reset my password",
    },
  },
  zh: {
    profileUpdated: {
      subject: "我们已收到您的资料修改",
      hello: (name: string) => `${name}，您好：`,
      intro: "我们已收到您对资料的修改，目前正等待管理员审核；在此之前，您的公开资料保持不变。",
      outro: "您的申请处理完成后，我们会再次发送邮件通知您。",
      button: "查看我的资料",
    },
    adminPending: {
      subject: "管理后台有待处理事项",
      intro: "管理后台中有申请等待审核：",
      modifications: (n: number) => `资料修改：${n}`,
      inscriptions: (n: number) => `注册申请：${n}`,
      buttonModifications: "处理资料修改",
      buttonInscriptions: "处理注册申请",
    },
    processed: {
      subject: "您的申请已处理",
      title: "您的申请已处理",
      profileApproved: "您的资料修改已通过审核，现已显示在您的公开资料中。",
      profileRejected: "您的资料修改未被采纳，您的公开资料保持不变。",
      registrationApproved: "您的注册申请已通过，现在可以登录。",
      registrationRejected: "您的注册申请未被通过。",
      buttonProfile: "查看我的资料",
      buttonLogin: "登录",
    },
    passwordChanged: {
      subject: "您的密码已被修改",
      title: "您的密码已被修改",
      intro: "您账户的密码刚刚被修改。",
      warning: "如果这不是您本人的操作，请立即重置密码。",
      button: "重置我的密码",
    },
  },
} satisfies Record<Locale, unknown>;

export function buildProfileUpdatedEmail(prenom: string, locale: Locale): EmailContent {
  const c = NOTIFY_EMAIL_COPY[locale].profileUpdated;
  const url = `${getAppBaseUrl()}/mon-profil`;
  const hello = c.hello(prenom);
  return {
    subject: c.subject,
    text: [hello, "", c.intro, "", c.outro, "", url].join("\n"),
    html: renderLayout({
      locale,
      title: c.subject,
      paragraphs: [escapeHtml(hello), escapeHtml(c.intro), escapeHtml(c.outro)],
      cta: { url, label: c.button },
    }),
  };
}

export function buildAdminPendingEmail(
  counts: { modifications: number; inscriptions: number },
  locale: Locale
): EmailContent {
  const c = NOTIFY_EMAIL_COPY[locale].adminPending;
  const base = getAppBaseUrl();
  const lines: string[] = [];
  if (counts.modifications > 0) lines.push(c.modifications(counts.modifications));
  if (counts.inscriptions > 0) lines.push(c.inscriptions(counts.inscriptions));

  const list = `<ul style="margin:0;padding-left:20px;">${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`;
  const modUrl = `${base}/admin/modifications`;
  const inscUrl = `${base}/admin`;
  const both = counts.modifications > 0 && counts.inscriptions > 0;
  // Le bouton principal pointe vers les modifications ; un lien secondaire couvre les inscriptions.
  const cta: Cta =
    counts.modifications > 0
      ? { url: modUrl, label: c.buttonModifications }
      : { url: inscUrl, label: c.buttonInscriptions };

  return {
    subject: c.subject,
    text: [c.intro, "", ...lines.map((l) => `- ${l}`), "", cta.url, ...(both ? [inscUrl] : [])].join("\n"),
    html: renderLayout({
      locale,
      title: c.subject,
      paragraphs: [escapeHtml(c.intro), list],
      cta,
      afterCta: both
        ? [`<p style="margin:0;font-size:13px;"><a href="${escapeHtml(inscUrl)}" style="color:#111111;">${escapeHtml(c.buttonInscriptions)}</a></p>`]
        : [],
    }),
  };
}

export function buildRequestProcessedEmail(
  opts: { kind: "profile" | "registration"; approved: boolean },
  locale: Locale
): EmailContent {
  const c = NOTIFY_EMAIL_COPY[locale].processed;
  const message =
    opts.kind === "profile"
      ? opts.approved ? c.profileApproved : c.profileRejected
      : opts.approved ? c.registrationApproved : c.registrationRejected;
  const base = getAppBaseUrl();
  // Inscription refusée : rien à faire, donc pas de bouton.
  let cta: Cta | undefined;
  if (opts.kind === "profile") cta = { url: `${base}/mon-profil`, label: c.buttonProfile };
  else if (opts.approved) cta = { url: `${base}/connexion`, label: c.buttonLogin };

  return {
    subject: c.subject,
    text: [c.title, "", message, ...(cta ? ["", cta.url] : [])].join("\n"),
    html: renderLayout({
      locale,
      title: c.title,
      paragraphs: [escapeHtml(message)],
      cta,
    }),
  };
}

export function buildPasswordChangedEmail(locale: Locale): EmailContent {
  const c = NOTIFY_EMAIL_COPY[locale].passwordChanged;
  const url = `${getAppBaseUrl()}/mot-de-passe-oublie`;
  return {
    subject: c.subject,
    text: [c.title, "", c.intro, "", c.warning, "", url].join("\n"),
    html: renderLayout({
      locale,
      title: c.title,
      paragraphs: [escapeHtml(c.intro), escapeHtml(c.warning)],
      cta: { url, label: c.button },
    }),
  };
}

export async function sendProfileUpdatedEmail(to: string, prenom: string, locale: Locale): Promise<void> {
  await sendMail(to, buildProfileUpdatedEmail(prenom, locale), "modification de profil reçue");
}

export async function sendRequestProcessedEmail(
  to: string,
  opts: { kind: "profile" | "registration"; approved: boolean },
  locale: Locale
): Promise<void> {
  await sendMail(to, buildRequestProcessedEmail(opts, locale), `demande ${opts.kind} traitée (${opts.approved ? "validée" : "refusée"})`);
}

export async function sendPasswordChangedEmail(to: string, locale: Locale): Promise<void> {
  await sendMail(to, buildPasswordChangedEmail(locale), "mot de passe modifié");
}

// Prévient tous les administrateurs actifs qu'il y a des demandes en attente.
export async function notifyAdminsPending(): Promise<void> {
  const [admins, modifications, inscriptions] = await Promise.all([
    prisma.user.findMany({
      where: { role: "ADMIN", suspended: false },
      select: { email: true, locale: true },
    }),
    prisma.profile.count({ where: { hasPendingChanges: true } }),
    prisma.user.count({ where: { status: "PENDING", emailVerifiedAt: { not: null } } }),
  ]);
  if (modifications + inscriptions === 0) return;

  await Promise.all(
    admins.map((admin) =>
      sendMail(
        admin.email,
        buildAdminPendingEmail({ modifications, inscriptions }, toLocale(admin.locale)),
        "tâches en attente côté admin"
      ).catch((error) => {
        console.error("[mail] échec d'envoi à un administrateur", error instanceof Error ? error.message : "erreur inconnue");
      })
    )
  );
}

export function toLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
