const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           description: Prénom de l'utilisateur
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: Nom de famille de l'utilisateur
 *           example: "Doe"
 *         email:
 *           type: string
 *           description: Adresse email unique de l'utilisateur
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           description: Mot de passe de l'utilisateur (hashé)
 *           example: "hashed_password123"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'utilisateur
 *           example: "2023-10-01T00:00:00.000Z"
 *         cvs:
 *           type: array
 *           items:
 *             type: string
 *             description: Références des CVs associés à l'utilisateur (ObjectId)
 *             example: "615c1f1e1c4a1c001f4f5b5a"
 */

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
