import { Router } from "express";
import authRouter from "./auth.router.js";
import userRouter from "./user.router.js";
import postsRouter from "./posts.router.js";
import { authorizedMiddleware } from "../middlewares/auh.middleware.js";


const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/user", authorizedMiddleware(), userRouter);
apiRouter.use("/posts", authorizedMiddleware(), postsRouter);

export default apiRouter;