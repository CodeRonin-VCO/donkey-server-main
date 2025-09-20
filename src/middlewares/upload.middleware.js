import multer from "multer";
import path from "path";

// ==== Choose type files ====
const fileFilter = (req, file, callback) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error('Type de fichier non autorisé !'), false);
    }
};

// ==== Storage for post images ====
const postStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'posts');
        callback(null, uploadDir); // Utilise le chemin absolu
    },
    filename: (req, file, callback) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        callback(null, uniqueName);
    }
});

export const uploadPostMedia = multer({
    storage: postStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 200 * 1024 * 1024 } // Augmentez la limite de taille pour les vidéos (ex: 50 Mo)
}).fields([
    { name: 'images', maxCount: 5 }, // Champ pour les images
    { name: 'videos', maxCount: 1 }  // Champ pour les vidéos
]);


// ==== Storage for user avatars ====
const avatarStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
        callback(null, uploadDir); // Utilise le chemin absolu
    },
    filename: (req, file, callback) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        callback(null, uniqueName);
    }
});

export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
}).single("avatar"); // Field name: "avatar"

