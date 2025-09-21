import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: false },
    images: [{ type: String, required: false }],
    videos: [{ type: String, required: false }],
    links: [{ type: String, required: false }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: [{ type: Number, default: 0 }],
    comments: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        date: { type: Date, default: Date.now }
    }],
    commentsCount: [{ type: Number, default: 0 }],
    tags: [{ type: String }]
}, { timestamps: true });

export const Post = mongoose.model('Post', postSchema);
