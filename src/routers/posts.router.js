import { Router } from "express";
import postsController from "../controllers/posts.controller.js";
import { uploadPostMedia } from "../middlewares/upload.middleware.js";


const postsRouter = Router();
postsRouter.route("/")
    .post(uploadPostMedia, postsController.createPost)
    .get(postsController.getPost);
    
postsRouter.route("/:postId/like")
    .post(postsController.toggleLike);

postsRouter.route("/:postId/comments")
    .post(postsController.addComment)
    .get(postsController.getComment);

export default postsRouter;