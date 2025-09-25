import mongoose from "mongoose";
import { Post } from "../models/posts.model.js";

const postsController = {
    createPost: async (req, res) => {
        const author = new mongoose.Types.ObjectId(req.user.id); // récupérer avec le token
        const { content } = req.body;

        if (!content) {
            res.status(400).json({ message: "Content is required." })
            return;
        }

        // Extract uploaded image paths from req.files
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const imagePaths = req.files['images'] ? req.files['images'].map(file => `${baseUrl}/uploads/posts/${file.filename}`) : [];
        const videoPaths = req.files['videos'] ? req.files['videos'].map(file => `${baseUrl}/uploads/posts/${file.filename}`) : [];

        // DB
        try {
            const newPost = new Post({
                author: author,
                content: content,
                images: imagePaths,
                videos: videoPaths
            })

            const savedPost = await newPost.save();

            return res.status(201).json({
                succes: true,
                message: "Post successfully created.",
                post: savedPost
            })

        } catch (error) {
            console.error(`Error creating post`, error);
            res.status(500).json({ message: "Error creating post.", error: error.message })
            return;
        }
    },
    getPost: async (req, res) => {
        const posts = await Post.aggregate([
            { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
            { $unwind: '$author' },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    'author.email': 0,
                    'author.password': 0,
                    'author.bio': 0,
                    'author.friends': 0,
                    'author.createdAt': 0,
                    'author.updatedAt': 0,
                }
            }
        ])

        // Build the complete URL for photos
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const userId = req.user?.id?.toString();
        const postWithFullMediaUrls = posts.map(post => {
            const imagesWithFullUrls = post.images.map(imagePath => imagePath.startsWith("http") ? imagePath : `${baseUrl}${imagePath}`);
            const videosWithFullUrls = post.videos.map(videoPath => videoPath.startsWith("http") ? videoPath : `${baseUrl}${videoPath}`);

            const isLiked = userId && post.likes?.some(id => id.toString() === userId);

            // Destructuration get post + images
            return { ...post, images: imagesWithFullUrls, videos: videosWithFullUrls, isLiked, likes:undefined }
        })

        res.status(201).json({ message: "Posts successfully retrieved.", posts: postWithFullMediaUrls });
    },
    toggleLike: async (req, res) => {
        const { postId } = req.params;
        const author = new mongoose.Types.ObjectId(req.user.id);

        try {
            const post = await Post.findById(postId);

            if (!post) {
                res.status(404).json({ message: "Post not found." });
                return;
            };

            const isLiked = post.likes.includes(author);
            if (isLiked) {
                post.likes.pull(author);
                post.likesCount = post.likes.length;
            } else {
                post.likes.push(author);
                post.likesCount = post.likes.length;
            };

            await post.save();

            return res.status(200).json({ success: true, likesCount: post.likesCount, isLiked: !isLiked });

        } catch (error) {
            console.error("Error liking post", error);
            res.status(500).json({ message: "Error while liking post." })
            return;
        }
    },
    addComment: async (req, res) => {
        const { postId } = req.params;
        const { text } = req.body;
        const author = new mongoose.Types.ObjectId(req.user.id);


        if (!text) {
            res.status(400).json({ message: "Comment text is required." })
            return;
        };

        // Check if objectId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            res.status(400).json({ message: "Invalid postId." });
            return;
        };

        // DB
        try {
            const post = await Post.findById(postId);
            if (!post) {
                res.status(404).json({ message: "Post not found." })
                return;
            };

            // Create new comment
            const newComment = {
                author: author,
                text: text,
                date: new Date().toISOString()
            };

            // Add to post
            post.comments.push(newComment);
            post.commentsCount = post.comments.length;

            // Save the updated post
            await post.save();

            // Send response
            return res.status(201).json({ message: "Comment successfully added.", comments: newComment, commentsCount: post.commentsCount });

        } catch (error) {
            console.error("Error adding comment", error);
            res.status(500).json({ message: "Error creating comment.", error: error.message })
            return;
        };
    },
    getComments: async (req, res) => {
        const { postId } = req.params;

        if (!postId) {
            res.status(400).json({ message: "Post ID is required." })
            return;
        };

        // Check if objectId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            res.status(400).json({ message: "Invalid post ID." });
            return;
        };

        // DB
        try {
            const post = await Post.findById(postId).populate({
                path: "comments.author",
                select: "firstname lastname avatar"
            });
            if (!post) {
                res.status(404).json({ message: "Post not found." })
                return;
            };

            return res.status(200).json({ success: true, message: "Comments successfully retrieved.", comments: post.comments });

        } catch (error) {
            console.error("Error getting comment", error);
            res.status(500).json({ message: "Error retrieving comments.", error: error.message })
            return;
        };
    },
}

export default postsController;