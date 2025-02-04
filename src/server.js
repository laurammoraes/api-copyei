import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import cors from "cors";

import { envSchema } from "./config/env.js";
import { provideStaticSite } from "./middlewares/provideStaticSite.js";
import { provideStaticEditor } from "./middlewares/provideStaticEditor.js";
import { usersRouter } from "./routes/usersRouter.js";
import { domainsRouter } from "./routes/domainsRouter.js";
import { aaPanelRouter } from "./routes/aapanelRouter.js";
import { websitesRouter } from "./routes/websitesRouter.js";
import { dashRouter } from "./routes/dashboardRouter.js";
import { isUser } from "./middlewares/isUser.js";
import { domainsHandler } from "./middlewares/domains-handler.js";
import { recoverRouter } from "./routes/recoverRouter.js";
import { googleAuthRouter } from "./routes/googleAuthRoutes.js";
import "./middlewares/notificationJob.js";
import { startWebsocket } from "./services/websocket.js";

dotenv.config();

export const app = express();

envSchema.parse(process.env);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.APP_BASE_URL,
    credentials: true,
  })
);

/* Global express rate-limit*/
app.set("trust proxy", 1); // Accept Nginx proxy
app.use(
  rateLimit({
    windowMs: 1000 * 30, // 30 segundos
    limit: 50, // 50 requisições dentro do intervalo de tempo acima
    standardHeaders: "draft-8",
    legacyHeaders: false,
    xForwardedForHeader: false,
  })
);

app.use(domainsHandler);

app.get("/", (req, res) => res.status(200).json({ message: "Copyei API" }));

/* Controllers */
app.use("/api", usersRouter);
app.use("/api", domainsRouter);
app.use("/api", aaPanelRouter);
app.use("/api", websitesRouter);
app.use("/api", dashRouter);
app.use("/api", recoverRouter);
app.use("/api", googleAuthRouter);

/* Static Routes Provider */
app.use("/api/site/:siteDomain", isUser, provideStaticSite);
app.use("/api/editor/:siteDomain", isUser, provideStaticEditor);

/* Starting WebSocket */
startWebsocket();

const port = process.env.PORT ? Number(process.env.PORT) : 3333;

app.listen(port, () => {
  console.info(`Servidor Iniciado na porta: ${port}`);
});
