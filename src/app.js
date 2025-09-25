import express from "express";
import morgan from "morgan";
import apiRouter from "./routers/index.js";
import { connectDB, initDB } from "./config/init-db.js";
import cors from "cors"
import { authentificationMiddleware } from "./middlewares/auh.middleware.js";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./sockets/socket.js";

// ==== Setup ====
const { PORT, NODE_ENV } = process.env;
const app = express();

// ==== Global middlewares ====
app.use(morgan("tiny"));
app.use(cors()); // manage http/htpps problems
app.use(express.json()); // convert in json
app.use("/api",authentificationMiddleware(), apiRouter) // main route + auth access
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // Serve uploaded files local

// ==== Connection DB ====
await connectDB();
await initDB();

// ==== Serveur HTTP natif pour socket.io ====
const server = http.createServer(app);

// ==== Initialise Socket.IO ====
const io = new Server(server, {
  cors: {
    origin: "*",  // adapte en prod pour ta sécurité
  }
});
setupSocket(io);


// ==== Middleware Error ====
app.use((error, req, res, next) => {
    console.log('Error : ' + error.cause);

    if (NODE_ENV === "dev") {
        res.status(500)
            .json({
                name: error.name,
                message: error.message || "No message",
                content: error.stack
            })
    } else {
        res.status(500).json({
            message: `An error occured in prod. Type : ${error.name}`
        })
    }
})

// ==== Serveur ====
server.listen(PORT, async (error) => {
    if (error) {
        console.log(`Failure to start server`, error);
        return;
    }

    console.log(`Web api running on:`, `http://localhost:${PORT}`, `[${NODE_ENV}]`);
});