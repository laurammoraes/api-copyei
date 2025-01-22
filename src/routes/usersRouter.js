import { Router } from "express";

import { registerUser } from "../controllers/users/register.js";
import { loginUser } from "../controllers/users/login.js";
import { logoutUser } from "../controllers/users/logout.js";



export const usersRouter = Router();

/* Public Routes */
usersRouter.post("/register", registerUser);
usersRouter.post("/login", loginUser);
usersRouter.get("/logout", logoutUser);


