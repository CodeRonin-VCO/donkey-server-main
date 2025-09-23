import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { _id: true }); // ← force la création de _id


const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: false },
    images: [{ type: String, required: false }],
    videos: [{ type: String, required: false }],
    links: [{ type: String, required: false }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    comments: [CommentSchema],
    commentsCount: { type: Number, default: 0 },
    tags: [{ type: String }]
}, { timestamps: true });

export const Post = mongoose.model('Post', postSchema);
