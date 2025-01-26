import { Router } from "express";

import { approvePurchase } from "../controllers/payment/approve";

import pauseAccount from "../controllers/payment/pauseAccount"; // Certifique-se de criar e exportar este controlador

export const paymentRouter = Router();

/* Public Routes */
paymentRouter.post("/payment/approvedAccount", approvePurchase);
paymentRouter.post("/payment/pauseAccount", pauseAccount);
