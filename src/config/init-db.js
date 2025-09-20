import mongoose from 'mongoose';
import models from '../models/index.js';
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';


// ==== Get env data ====
const { DB_DATABASE, DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT } = process.env;


const uri = `mongodb://${DB_USER ? DB_USER + ':' + DB_PASSWORD + '@' : ''}${DB_SERVER}:${DB_PORT}/${DB_DATABASE}`;

// ==== Init mangoose ====
const connectDB = async () => {
    try {
        mongoose.connect(uri)
        console.log(`MongoDB connected`);

    } catch (error) {
        console.log(`Error mongoDB`, error.message);
        process.exit(1);
    }
};

// ==== Synchronize with fake data ====
// todo: vérifier si on garde
const initDB = async () => {
    try {
        const { User, Post } = models;

        // Load fake data (json)
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const usersPath = path.join(__dirname, "./../data/users.json");
        const postsPath = path.join(__dirname, "./../data/posts.json");

        // Read json files
        const usersRaw = fs.readFileSync(usersPath, "utf-8");
        const postsRaw = fs.readFileSync(postsPath, "utf-8");

        // Parse json files
        const usersData = JSON.parse(usersRaw);
        const postsData = JSON.parse(postsRaw);

        // todo: debug → supprimer après les tests
        // Delete users & posts
        await User.deleteMany({});
        await Post.deleteMany({});


        // Insert users if none exists
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const insertedUsers = await User.insertMany(usersData.users);
            console.log(`Users inserted:`, insertedUsers.map(u => u.email));
        };

        // Insert posts if none exists
        const postCount = await Post.countDocuments();
        if (postCount === 0) {
            const insertedPosts = await Post.insertMany(postsData.posts);
            console.log(`Posts inserted:`, insertedPosts.map(p => p.id));
        }

        console.log(`Database initialization complete`);


    } catch (error) {
        console.error("Database initialization error :", error.message);
        process.exit(1);
    };
};

export {
    connectDB,
    // FIXME: Fake data
    initDB
}