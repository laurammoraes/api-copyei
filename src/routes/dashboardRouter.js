import { Router } from "express";

import { createUser } from "../controllers/dashboard/createUser.js";
import { listUsers } from "../controllers/dashboard/listUsers.js";
import { listDetailUser } from "../controllers/dashboard/listDetailUser.js";
import { pauseUser } from "../controllers/dashboard/pauseUser.js";
import { deleteUser } from "../controllers/dashboard/deleteUser.js"
import { activeUser } from "../controllers/dashboard/activeUser.js"
import { createManyUsers } from "../controllers/dashboard/createManyUsers.js"
import { downloadSheetWithAllUsers } from "../controllers/dashboard/downloadSheetWithAllUsers.js"
import { getLogs } from "../controllers/dashboard/getLogs.js"
import { updateRoleUser } from "../controllers/dashboard/updateRoleUser.js";
import { actionAccount } from "../controllers/payment/actionAccount.js"

export const dashRouter = Router();

dashRouter.post("/users/create", createUser);
dashRouter.get("/users/list", listUsers);
dashRouter.get("/users/user/list/:id", listDetailUser);
dashRouter.patch("/users/user/pause/:id", pauseUser);
dashRouter.delete("/users/user/delete/:id", deleteUser);
dashRouter.patch("/users/user/active/:id", activeUser);
dashRouter.post("/users/upload-sheet/create-many-users", createManyUsers);
dashRouter.get("/users/download-sheet/all", downloadSheetWithAllUsers);
dashRouter.get("/users/logs/:id", getLogs);
dashRouter.patch("/users/user/update/role", updateRoleUser)
dashRouter.post("/payment/actionAccount", actionAccount);

