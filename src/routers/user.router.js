import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";


const userRouter = Router();

userRouter.route("/info")
    .get(userController.getPersonalData)
    .put(uploadAvatar ,userController.changePersonalData)
    .delete(userController.deletePersonalData);

export default userRouter;