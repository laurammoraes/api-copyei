import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { envSchema } from "./config/env.js";
import { provideStaticSite } from "./middlewares/provideStaticSite.js";
import { provideStaticEditor } from "./middlewares/provideStaticEditor.js";
import { usersRouter } from "./routes/usersRouter.js";
import { domainsRouter } from "./routes/domainsRouter.js";
import { aaPanelRouter } from "./routes/aapanelRouter.js";
import { websitesRouter } from "./routes/websitesRouter.js";
import { isUser } from "./middlewares/isUser.js";

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

app.get("/", (req, res) => res.status(200).json({ message: "Copyei API" }));

/* Controllers */
app.use("/api", usersRouter);
app.use("/api", domainsRouter);
app.use("/api", aaPanelRouter);
app.use("/api", websitesRouter);

/* Static Routes Provider */
app.use("/api/site/:siteDomain", provideStaticSite);
app.use("/api/editor/:siteDomain", isUser, provideStaticEditor);

const port = process.env.PORT ? Number(process.env.PORT) : 3333;

app.listen(port, () => {
  console.info(`Servidor Iniciado na porta: ${port}`);
});
