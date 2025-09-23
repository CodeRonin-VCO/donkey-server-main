import jwt from "jsonwebtoken";

export function generateToken({ id, username, email, role }) {
    
    //  Promise writing 
    return new Promise( (resolve, reject) => {
        const data = { id, username, email, role };
        const secretKey = process.env.JWT_SECRET;

        //  Config token 
        const option = {
            algorithm: "HS512",
            expiresIn: "1h",
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }

        //  Generate token 
        jwt.sign(data, secretKey, option, (error, token) => {
            if (error) {
                reject(new Error("Token not generated"));
                return;
            }
            resolve(token);
        });
    });
}

export function decodeToken(token) {

    //  Promise writing 
    return new Promise((resolve, reject) => {

        const secretKey = process.env.JWT_SECRET // Clef secret pour la signature du token

        //  Validation options 
        const options = {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }

        //  Check token 
        jwt.verify(token, secretKey, options, (error, data) => {
            if(error) {
                reject(error);
                return;
            }
            // todo: debug
            console.log("🧪 [decodeToken] Payload:", data);
            resolve(data);
        });
    });
};