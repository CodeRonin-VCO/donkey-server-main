import { Router } from "express";
import { Message } from "../models/messages.model.js";


const messagesRouter = Router();
messagesRouter.get("/", async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { friendId } = req.query;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId },
            ],
        }).sort({ createdAt: 1 });

        return res.json({ messages });

    } catch (err) {
        next(err);
    }
});

export default messagesRouter;