import mongoose from "mongoose";
import { Post } from "../models/posts.model.js";

const postsController = {
    createPost: async (req, res) => {
        // todo: debug
        console.log("Fichiers reçus :", req.files);
        console.log("Fichiers reçus :", req.body);


        const { author, content } = req.body;

        if (!author) {
            res.status(400).json({ message: "Author is required." })
            return;
        }

        // Check if objectId
        if (!mongoose.Types.ObjectId.isValid(author)) {
            res.status(400).json({ message: "Invalid author ID." });
            return;
        };

        // Extract uploaded image paths from req.files
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const imagePaths = req.files['images'] ? req.files['images'].map(file => `${baseUrl}/uploads/posts/${file.filename}`) : [];
        const videoPaths = req.files['videos'] ? req.files['videos'].map(file => `${baseUrl}/uploads/posts/${file.filename}`) : [];

        // DB
        try {
            const newPost = new Post({
                author,
                content,
                images: imagePaths,
                videos: videoPaths
            })

            const savedPost = await newPost.save();

            return res.status(201).json({
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
        const postWithFullMediaUrls = posts.map(post => {
            const imagesWithFullUrls = post.images.map(imagePath => imagePath.startsWith("http") ? imagePath : `${baseUrl}${imagePath}`);
            const videosWithFullUrls = post.videos.map(videoPath => videoPath.startsWith("http") ? videoPath : `${baseUrl}${videoPath}`);

            // Destructuration get post + images
            return { ...post, images: imagesWithFullUrls, videos: videosWithFullUrls }
        })

        res.status(201).json({ message: "Posts successfully retrieved.", posts: postWithFullMediaUrls });
    },
    toggleLike: async (req, res) => {
        const { postId } = req.params;
        const userId = req.user._id;

        try {
            const post = await Post.findById(postId);

            if (!post) {
                res.status(404).json({ message: "Post not found." });

                return;
            };

            const isLiked = post.likes.includes(userId);
            if (isLiked) {
                post.likes.pull(userId);
                post.likesCount = post.likes.length;
            } else {
                post.likes.push(userId);
                post.likesCount = post.likes.length;
            };

            await post.save();

            return res.status(200).json({success: true, likesCount: post.likesCount, isLiked: !isLiked});

        } catch (error) {
            console.error("Error liking post", error);
            res.status(500).json({message: "Error while liking post."})
            return;
        }
    },
    addComment: async (req, res) => {
        const { postId } = req.params;
        const { author, text } = req.body;

        if (!postId || !author || !text) {
            res.status(400).json({ message: "Fields are required." })
            return;
        };

        // Check if objectId
        if (!mongoose.Types.ObjectId.isValid(author) || !mongoose.Types.ObjectId.isValid(postId)) {
            res.status(400).json({ message: "Invalid author or postId." });
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
                author,
                text,
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
    getComment: async (req, res) => {
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
            const post = await Post.findById(postId);
            if (!post) {
                res.status(404).json({ message: "Post not found." })
                return;
            };

            return res.status(200).json({ message: "Comments successfully retrieved.", comments: post.comments });

        } catch (error) {
            console.error("Error getting comment", error);
            res.status(500).json({ message: "Error getting comments.", error: error.message })
            return;
        };
    }, 
}

export default postsController;