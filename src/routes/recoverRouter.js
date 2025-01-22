import { Router } from "express";


import { recoverPassword } from "../controllers/users/recoverPassword.js";
import { requestRecoverPassword } from "../controllers/users/requestRecoverPassword.js";


export const recoverRouter = Router();

/* Public Routes */
recoverRouter.post("/recover/request", requestRecoverPassword);
recoverRouter.patch("/recover/password/:id", recoverPassword)

