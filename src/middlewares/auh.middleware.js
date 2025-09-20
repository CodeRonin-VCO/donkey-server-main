// Manage authentification & cors here

import { decodeToken } from "../utils/jwt.utils.js";


export function authentificationMiddleware() {

    return async (req, res, next) => {
        // Get identification data 
        const authData = req.headers["authorization"] ?? "";

        //  Extract token 
        const [prefix, token] = authData.split(" ");

        // If not → reject
        if (prefix?.toLowerCase() !== "bearer" || !token) {
            req.user = null;

            next();

            return;
        };

        // If yes → get data from token and autorized access
        try {
            req.user = await decodeToken(token);

        } catch {
            req.user = null;
        };

        next();
    };
};

export function authorizedMiddleware() {

    return (req, res, next) => {
        //  User isConnected? 
        if (!req.user) {
            res.sendStatus(401);
            return;
        };

        next();
    }
}