import models from "../models/index.js";

// Map pour garder la correspondance entre mongo et socket
const usersMap = new Map(); // userId -> socketId

export function setupSocket(io) {
    // Ecouter les connexions entrantes
    io.on("connection", (socket) => {
        console.log("✅ New user connected:", socket.id);

        // Stocker l'id mongo dans socket (usersMap)
        socket.on("register_user", (userId) => {
            usersMap.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });

        socket.on("send_message", async ({ sender, receiver, content }) => {
            try {
                // Création message
                const message = new models.Message({ sender, receiver, content });
                await message.save(); // sauvegarde en DB

                // Récupérer le bon utilisateur pour lui envoyer l'image
                const receiverSocketId = usersMap.get(receiver);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receive_message", message);
                };

            } catch (error) {
                console.error("Failed to save message:", error);
            }
        });

        socket.on("disconnect", () => {
            // Trouver l'utilisateur (lien mongo - socket)
            for (const [userId, sockId] of usersMap.entries()) {
                if (sockId === socket.id) {
                    // Supprimer l'association
                    usersMap.delete(userId);
                    console.log(`User ${userId} disconnected and removed from map`);
                    break;
                }
            }
        });
    });
}
