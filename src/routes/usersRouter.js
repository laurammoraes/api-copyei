import { Router } from "express";

import { registerUser } from "../controllers/users/register.js";
import { loginUser } from "../controllers/users/login.js";
import { logoutUser } from "../controllers/users/logout.js";
import { recoverPassword } from "../controllers/users/recoverPassword.js";
import { requestRecoverPassword } from "../controllers/users/requestRecoverPassword.js";


export const usersRouter = Router();

/* Public Routes */
usersRouter.post("/register", registerUser);
usersRouter.post("/login", loginUser);
usersRouter.get("/logout", logoutUser);
usersRouter.post("/request-recover-password", requestRecoverPassword)
usersRouter.patch("/recover-password/:id", recoverPassword)

