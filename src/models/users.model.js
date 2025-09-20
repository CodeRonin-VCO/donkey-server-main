import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => /^\S+@\S+\.\S+$/.test(v),
            message: props => `${props.value} n'est pas un email valide !`
        }
    },
    password: { type: String, required: true },
    avatar: { type: String }, // URL ou nom de fichier
    bio: { type: String },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });


export const User = mongoose.model("User", userSchema);