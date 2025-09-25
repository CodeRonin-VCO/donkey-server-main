import mongoose from "mongoose";
import { User } from "../models/users.model.js";
import { Post } from "../models/posts.model.js";


const userController = {
    getPersonalData: async (req, res) => {
        const { id } = req.user;

        try {
            // Search user without pwd (select "-pwd")
            const userFound = await User.findById(id).select("-password -__v").exec();

            if (!userFound) {
                res.status(404).json({ message: "User not found." })
                return;
            };

            // Calculer le nombre de posts de l'utilisateur
            const postsCount = await Post.countDocuments({ author: id });
            const heartsGivenCount = await Post.countDocuments({ likes: id });

            const userWithCounts = {
                ...userFound.toObject(),
                postsCount,
                friendsCount: userFound.friendsCount || 0,
                heartsGivenCount,
            };

            return res.status(200).json({
                message: "User information successfully retrieved.",
                user: userWithCounts
            });

        } catch (error) {
            console.error("Error getting personal data", error);
            res.status(500).json({
                message: "Error getting personal data.",
                error: error.message
            })
            return;
        };
    },
    changePersonalData: async (req, res) => {
        const { id } = req.user;
        const updates = req.body;

        const allowedUpdates = ["firstname", "lastname", "bio", "loc"];
        const updateData = {};

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Aucun champ valide à mettre à jour." });
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            }).select("-password -__v");

            if (!updatedUser) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            return res.status(200).json({
                message: "Informations utilisateur mises à jour avec succès.",
                user: updatedUser
            });

        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
            console.error("Données envoyées pour la mise à jour :", updateData);
            return res.status(500).json({
                message: "Erreur lors de la mise à jour de l'utilisateur.",
                error: error.message
            });
        }
    },
    changeBanner: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Banner file is required." });
            }

            const userId = new mongoose.Types.ObjectId(req.user.id);
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            const bannerPath = `${baseUrl}/uploads/banners/${req.file.filename}`;

            // Met à jour le champ banner dans la base
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { banner: bannerPath },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found." });
            }

            return res.status(200).json({
                success: true,
                message: "Banner updated successfully.",
                banner: bannerPath,
            });

        } catch (error) {
            console.error("Error updating banner:", error);
            return res.status(500).json({ message: "Server error updating banner." });
        }
    },
    changeAvatar: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Avatar file is required." });
            }

            const userId = new mongoose.Types.ObjectId(req.user.id);
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            const avatarPath = `${baseUrl}/uploads/avatars/${req.file.filename}`;

            // Met à jour le champ avatar dans la base
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { avatar: avatarPath },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found." });
            }

            return res.status(200).json({
                success: true,
                message: "Avatar updated successfully.",
                avatar: avatarPath,
            });

        } catch (error) {
            console.error("Error updating avatar:", error);
            return res.status(500).json({ message: "Server error updating avatar." });
        }
    },
    deletePersonalData: async (req, res) => {
        const { id } = req.user;

        try {
            const deletedUser = await User.findByIdAndDelete(id).exec();

            if (!deletedUser) {
                res.status(404).json({ message: "User not found." });
                return;
            };

            return res.status(200).json({
                message: "User deleted successfully.",
                user: {
                    id: deletedUser._id,
                    email: deletedUser.email
                }
            });

        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({
                message: "Error deleting user.",
                error: error.message
            });
            return;
        };
    },
    getUserFriends: async (req, res) => {
        const { id } = req.user;
        try {
            const userWithFriends = await User.findById(id)
                .populate("friends", "-password -__v -email")
                .select("-password -__v");

            if (!userWithFriends) {
                return res.status(404).json({ message: "User not found." });
            };

            return res.status(200).json({
                message: "Friends list retrieved successfully.",
                friends: userWithFriends.friends
            });

        } catch (error) {
            console.error("Error retrieving friends:", error);
            return res.status(500).json({
                message: "Server error retrieving friends.",
                error: error.message
            });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find()
                .select("-password -__v -email")
                .exec();

            return res.status(200).json({
                message: "All users retrieved successfully.",
                users,
            });
        } catch (error) {
            console.error("Error getting all users:", error);

            return res.status(500).json({
                message: "Error getting all users.",
                error: error.message,
            });
        }
    },
    addFriends: async (req, res) => {
        const userId = req.user.id;
        const { friendId } = req.body;

        if (!friendId || !mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: "Invalid friend ID." });
        }

        if (friendId === userId) {
            return res.status(400).json({ message: "You cannot add yourself as a friend." });
        }

        try {
            // Vérifier que l'ami existe
            const friendUser = await User.findById(friendId);
            if (!friendUser) {
                return res.status(404).json({ message: "Friend user not found." });
            }

            // Récupérer l'utilisateur actuel
            const user = await User.findById(userId);

            // Vérifier si l'ami est déjà dans la liste
            if (user.friends.includes(friendId)) {
                return res.status(400).json({ message: "User is already your friend." });
            }

            // Ajouter l'ami
            user.friends.push(friendId);
            user.friendsCount = user.friends.length;

            await user.save();

            return res.status(200).json({
                message: "Friend added successfully.",
                friends: user.friends,
                friendsCount: user.friendsCount
            });

        } catch (error) {
            console.error("Error adding friend:", error);
            return res.status(500).json({
                message: "Server error adding friend.",
                error: error.message
            });
        }
    },
    deleteFriends: async (req, res) => {
        const userId = req.user.id;
        const { friendId } = req.body;

        if (!friendId || !mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: "Invalid friend ID." });
        }

        if (friendId === userId) {
            return res.status(400).json({ message: "You cannot remove yourself." });
        }

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            if (!user.friends.includes(friendId)) {
                return res.status(400).json({ message: "User is not your friend." });
            }

            // Remove friend from list
            user.friends = user.friends.filter(id => id.toString() !== friendId);
            user.friendsCount = user.friends.length;

            await user.save();

            return res.status(200).json({
                message: "Friend removed successfully.",
                friends: user.friends,
                friendsCount: user.friendsCount
            });

        } catch (error) {
            console.error("Error removing friend:", error);
            return res.status(500).json({
                message: "Server error removing friend.",
                error: error.message
            });
        }
    }

};

export default userController;