import { User } from "../models/users.model.js";


const userController = {
    getPersonalData: async (req, res) => {
        if (!req.user.email) {
            res.status(400).json({ message: 'Email is required.' })
            return
        };

        const { email } = req.user;

        try {
            // Search user without pwd (select "-pwd")
            const userFound = await User.findOne({ email }).select("-password -__v").exec();

            if (!userFound) {
                res.status(404).json({ message: "User not found." })
                return;
            };

            return res.status(200).json({
                message: "User information successfully retrieved.",
                user: userFound
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
        if (!req.user || !req.user.email) {
            res.status(400).json({ message: 'Unauthorized. Email is required.' })
            return;
        };

        const { email } = req.user;
        const updates = req.body;

        const allowedUpdates = ["firstname", "lastname", "email", "avatar", "bio"];
        const updateData = {};

        // Filter authorized fields
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            };
        });

        // Check if there's fields to be updated
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: "No valid fields to update." });
            return;
        };

        try {
            const updatedUser = await User.findOneAndUpdate({ email }, updateData, {
                new: true,
                runValidators: true
            }).select("-password -__v");

            if (!updatedUser) {
                res.status(404).json({ message: "User not found." });
                return;
            };


            return res.status(200).json({
                message: "User information updated successfully.",
                user: updatedUser
            });

        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({
                message: "Error updating user.",
                error: error.message
            });
            return;
        };
    },
    deletePersonalData: async (req, res) => {
        if (!req.user || !req.user.email) {
            res.status(400).json({ message: 'Email is required.' });
            return;
        };

        const { email } = req.user;

        try {
            const deletedUser = await User.findOneAndDelete({ email }).exec();

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
    }
};

export default userController;