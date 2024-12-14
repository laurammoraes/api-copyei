import { Router } from "express";

import { isUser } from "../middlewares/isUser.js";
import { upload } from "../middlewares/multer.js";
import { saveFiles } from "../controllers/websites/saveFiles.js";
import { downloadWebSite } from "../controllers/websites/downloadWebSite.js";
import { uploadWebSiteImages } from "../controllers/websites/uploadWebSiteImages.js";
import { cloneWebSite } from "../controllers/websites/cloneWebSite.js";
import { findWebSite } from "../controllers/websites/findWebSite.js";
import { getWebsiteById } from "../controllers/websites/getWebsite.js";
import { downloadOnlyHtml } from "../controllers/websites/downloadOnlyHtml.js";

export const websitesRouter = Router();

/* Public Routes */
websitesRouter.post("/editor/:siteDomain/:fileName?/save", saveFiles);
websitesRouter.get("/download/:siteDomain/html", downloadOnlyHtml);
websitesRouter.post(
  "/uploadImages",
  upload.single("image"),
  uploadWebSiteImages
);

/* User protected Routes */
websitesRouter.post("/clone", isUser, cloneWebSite);
websitesRouter.get("/download/:siteDomain", isUser, downloadWebSite);
websitesRouter.get("/searchSites", isUser, findWebSite);
websitesRouter.get("/websites/:id", isUser, getWebsiteById);
