import { User } from "../models/users.model.js";
import { hash, verify } from "argon2";
import { generateToken } from "../utils/jwt.utils.js";

const authController = {
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password ) {
            res.status(400).json({ message: "Email and password are required." })
            return;
        };

        try {
            const userFound = await User.findOne({ email }).exec();
            if (!userFound) {
                res.status(401).json({ message: "Invalid email or password." })
                return;
            };

            // Check password with Argon2id
            const isPasswordValid = await verify(userFound.password, password);
            if (!isPasswordValid) {
                res.status(401).json({ message: "Invalid email or password." });
                return;
            }

            const token = await generateToken({
                    id: userFound._id.toString(),
                    username: userFound.username,
                    email: userFound.email,
                    role: userFound.role
                });

            return res.status(200).json({
                message: "Connected successfully.",
                token,
                user: {
                    _id: userFound._id,
                    email: userFound.email,
                    firstname: userFound.firstname,
                    lastname: userFound.lastname,
                    avatar: userFound.avatar,
                    createdAt: userFound.createdAt,
                    updatedAt: userFound.updatedAt
                }
            });

        } catch (error) {
            console.error("Login error", error, {
                error: error.message,
                stack: error.stack,
                email: email
            });
            res.status(500).json({ message: "An error occurred during login." });
            return;
        };
    },
    register: async (req, res) => {
        const { firstname, lastname, email, password } = req.body;
        console.log("Received body:", req.body);

        if (!email || !password || !firstname || !lastname) {
            res.status(400).json({ message: "Fields (email, password, firstname or lastname) are required." })
            return;
        };

        // Password validation (// front)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters, one uppercase letter, one number, and one special character."
            });
        }

        // DB
        try {
            // Does user exist?
            const existingUser = await User.findOne({ email }).exec();
            if (existingUser) {
                res.status(409).json({ message: "This email is already in use." })
                return;
            };

            // Hash argon2id
            const hashedPassword = await hash(password);

            // Create user
            const newUser = new User({
                email,
                password: hashedPassword,
                lastname,
                firstname
            });
            const savedNewUser = await newUser.save();

            // 
            return res.status(201).json({
                message: "User created successfully.",
                user: {
                    email: savedNewUser.email,
                    firstname: savedNewUser.firstname,
                    lastname: savedNewUser.lastname
                }
            });

        } catch (error) {
            console.error("Error creating new user", error);
            res.status(500).json({ message: "Error creating new user.", error: error.message })
            return;
        };
    },
    updatePassword: async (req, res) => {
        const { email, newPassword } = req.body;

        // Vérification des champs requis
        if (!email || !newPassword) {
            res.status(400).json({ message: "Email and new password are required." });
            return;
        };

        try {
            const userFound = await User.findOne({ email }).exec();
            if (!userFound) {
                res.status(404).json({ message: "User not found." });
                return;
            };

            // Hash argon2id
            const hashedPassword = await hash(newPassword);

            // Update password
            userFound.password = hashedPassword;

            return res.status(200).json({ message: "Password updated successfully." });

        } catch (error) {
            console.error("Error updating password", error);
            res.status(500).json({ message: "An error occurred while updating the password." });
            return;
        };
    }
}

export default authController;