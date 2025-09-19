import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "node:path";
import { z } from "zod";
import "dotenv/config";

const app = express();

app.disable("x-powered-by");

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  TRUST_PROXY: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  SMTP_HOST: z.string().min(1, "Missing SMTP_HOST").optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().min(1, "Missing SMTP_USER").optional(),
  SMTP_PASS: z.string().min(1, "Missing SMTP_PASS").optional(),
  MAIL_TO: z.string().email().optional(),
});

const envParse = EnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  TRUST_PROXY: process.env.TRUST_PROXY,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_TO: process.env.MAIL_TO,
});

if (!envParse.success) {
  console.error("[server] Invalid environment configuration", envParse.error.flatten());
  process.exit(1);
}

const ENV = envParse.data;

const MAX_ATTACHMENT_SIZE_MB = 15;
const MAX_ATTACHMENT_SIZE_BYTES = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_SIZE_MB = 15;
const MAX_TOTAL_ATTACHMENT_SIZE_BYTES = MAX_TOTAL_ATTACHMENT_SIZE_MB * 1024 * 1024;
const MAX_ATTACHMENT_COUNT = 3;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_ATTACHMENT_SIZE_BYTES,
    files: MAX_ATTACHMENT_COUNT,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_ATTACHMENT_TYPES.has(file.mimetype)) {
      const error = new Error("UNSUPPORTED_FILE_TYPE");
      error.code = "UNSUPPORTED_FILE_TYPE";
      return cb(error);
    }
    cb(null, true);
  },
});

const uploadAttachments = upload.array("attachments", MAX_ATTACHMENT_COUNT);

// ——— Trust proxy (gdy za LB/Proxy) ———
if (String(ENV.TRUST_PROXY).toLowerCase() === "true") {
  app.set("trust proxy", 1);
}

// ——— Helmet (z delikatnymi domyślnymi ustawieniami) ———
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginEmbedderPolicy({ policy: "credentialless" }));
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));

app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), microphone=(), midi=(), payment=(), usb=()"
  );
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// ——— Body parser (limit + tylko JSON) ———
app.use(express.json({ limit: "16kb" }));

// ——— CORS (biała lista) ———
const allowedOrigins = (ENV.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // pozwól narzędziom CLI/healthcheckom
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS: origin not allowed: " + origin), false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
  credentials: false,
};
app.use(cors(corsOptions));

// ——— Rate limit tylko na /api/contact ———
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: ENV.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many requests, please try again later." },
});

// ——— Walidacja danych ———
const ContactSchema = z.object({
  name: z.string().trim().min(2, "Podaj imię (min 2 znaki)").max(80, "Za długie imię"),
  phone: z.string().trim().min(5, "Podaj telefon").max(30).regex(/^[0-9+ ()-]+$/, "Tylko cyfry/spacje/+/-/()"),
  email: z.string().trim().email("Nieprawidłowy e-mail").max(120),
  vin: z.string().trim().toUpperCase().regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN musi mieć 17 znaków (bez I/O/Q)"),
  msg: z.string().trim().min(10, "Wpisz kilka zdań").max(2000, "Za długa wiadomość (max 2000 znaków)"),
  honeypot: z.string().optional(),
});

// ——— Sanitization helpers ———
const stripCRLF = (s) => s.replace(/[\r\n]+/g, " ").trim();
const normalizeMsg = (s) => s.replace(/[\t\r]+/g, "\n").trim();

// ——— Mail transporter ———
let transporter = null;
if (ENV.SMTP_HOST && ENV.SMTP_PORT && ENV.SMTP_USER && ENV.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: String(ENV.SMTP_SECURE || "true").toLowerCase() === "true",
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });

  transporter
    .verify()
    .then(() => {
      console.log("[server] SMTP transporter verified");
    })
    .catch((err) => {
      console.error("[server] SMTP verification failed", err);
    });
} else {
  console.warn("[server] SMTP credentials missing – contact form disabled until configured.");
}

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Contact endpoint
app.post(
  "/api/contact",
  limiter,
  (req, res, next) => {
    uploadAttachments(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        let message = "Załącznik został odrzucony.";
        if (err.code === "LIMIT_FILE_SIZE") {
          message = `Pliki mogą mieć maksymalnie ${MAX_ATTACHMENT_SIZE_MB} MB.`;
        } else if (err.code === "LIMIT_FILE_COUNT") {
          message = `Możesz dodać maksymalnie ${MAX_ATTACHMENT_COUNT} pliki.`;
        }
        return res.status(400).json({
          ok: false,
          error: "VALIDATION_ERROR",
          details: { formErrors: [], fieldErrors: { attachments: [message] } },
        });
      }

      if (err?.code === "UNSUPPORTED_FILE_TYPE" || err?.message === "UNSUPPORTED_FILE_TYPE") {
        return res.status(400).json({
          ok: false,
          error: "VALIDATION_ERROR",
          details: { formErrors: [], fieldErrors: { attachments: ["Nieobsługiwany format pliku. Dozwolone: PDF, JPG, PNG, WEBP."] } },
        });
      }

      return next(err);
    });
  },
  async (req, res) => {
  try {
    // 1) Validate
    const parsed = ContactSchema.parse(req.body);
    const { honeypot: honeypotValue, ...rest } = parsed;

    if (honeypotValue && honeypotValue.trim().length > 0) {
      return res.status(400).json({
        ok: false,
        error: "VALIDATION_ERROR",
        details: { formErrors: [], fieldErrors: { msg: ["Nie udało się wysłać formularza. Spróbuj ponownie."] } },
      });
    }

    // 2) Sanitize for headers
    const clean = {
      name: stripCRLF(rest.name),
      phone: stripCRLF(rest.phone),
      email: stripCRLF(rest.email),
      vin: stripCRLF(rest.vin.toUpperCase()),
      msg: normalizeMsg(rest.msg),
    };

    // 3) Compose email
    if (!transporter) {
      return res.status(503).json({ ok: false, error: "MAIL_DISABLED" });
    }

    const to = ENV.MAIL_TO || ENV.SMTP_USER;
    if (!to) {
      return res.status(500).json({ ok: false, error: "MAIL_TO/SMTP_USER not configured" });
    }

    const subject = "Nowa wiadomość z formularza 4 KÓŁKA";
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    const attachments = uploadedFiles.map((file, index) => {
      const base = path.basename(file.originalname || "").replace(/[\\/:*?"<>|]+/g, "_").trim();
      const filename = base || `zalacznik-${index + 1}`;
      return {
        filename,
        content: file.buffer,
        contentType: file.mimetype,
        contentDisposition: "attachment",
      };
    });

    const totalAttachmentSize = uploadedFiles.reduce((sum, file) => sum + (file?.size ?? 0), 0);
    if (totalAttachmentSize > MAX_TOTAL_ATTACHMENT_SIZE_BYTES) {
      return res.status(400).json({
        ok: false,
        error: "VALIDATION_ERROR",
        details: { formErrors: [], fieldErrors: { attachments: [`Łączny rozmiar plików nie może przekroczyć ${MAX_TOTAL_ATTACHMENT_SIZE_MB} MB.`] } },
      });
    }

    const attachmentInfo = attachments.length
      ? `Załączniki: ${attachments.map((a) => a.filename).join(", ")}\n\n`
      : "";

    const text =
      `Nowe zgłoszenie z formularza:\n\n` +
      `Imię: ${clean.name}\n` +
      `Telefon: ${clean.phone}\n` +
      `E-mail: ${clean.email}\n` +
      `VIN: ${clean.vin}\n\n` +
      attachmentInfo +
      `Treść:\n${clean.msg}\n`;

    const info = await transporter.sendMail({
      from: `Formularz 4 KÓŁKA <${ENV.SMTP_USER}>`,
      to,
      subject,
      text,
      replyTo: clean.email, // bezpiecznie po stripCRLF
      attachments: attachments.length ? attachments : undefined,
    });

    console.log("[server] Contact email sent", {
      to,
      messageId: info?.messageId,
      response: info?.response,
      accepted: info?.accepted,
    });

    res.json({ ok: true, id: info.messageId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: "VALIDATION_ERROR", details: err.flatten() });
    }
    console.error("MAIL_ERROR", err);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
  }
);

app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, error: "NOT_FOUND" });
});

app.use((err, _req, res, _next) => {
  console.error("[server] Unhandled error", err);
  if (res.headersSent) {
    return;
  }
  res.status(500).json({ ok: false, error: "UNEXPECTED_ERROR" });
});

const port = ENV.PORT;
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
