import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { uploadAvatar, uploadBanner } from "../middlewares/upload.middleware.js";


const userRouter = Router();

userRouter.route("/info")
    .get(userController.getPersonalData)
    .put(userController.changePersonalData)
    .delete(userController.deletePersonalData);

userRouter.route("/info/banner").put(uploadBanner, userController.changeBanner);
userRouter.route("/info/avatar").put(uploadAvatar, userController.changeAvatar);


userRouter.route("/info/connections")
    .get(userController.getUserFriends)
    .post(userController.addFriends)
    .delete(userController.deleteFriends);
userRouter.route("/info/connections/allusers").get(userController.getAllUsers);

export default userRouter;