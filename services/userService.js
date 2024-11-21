const User = require('../model/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function getAllUsers() {
    try {
        const users = await User.find().select('-password'); // Exclut les mots de passe des résultats
        return users;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des utilisateurs.', error);
    }
}

async function getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    return user || null;
}

async function updateUserById(userId, updates) {
    return await User.findByIdAndUpdate(userId, updates, { new: true });
}

async function deleteUserById(userId) {
    return await User.findByIdAndDelete(userId);
}

async function registerUser({ payload, correlationId }) {
    try {
        const existingUser = await User.findOne({ email: payload.email });
        if (existingUser) {
            //reponse d'erreur
            return { correlationId, status: 'error', message: 'Utilisateur déjà existant.' };
        }

        // Hash du mot de passe avant sauvegarde
        const hashedPassword = await bcrypt.hash(payload.password, 10);
        console.log('Mot de passe hashé:', hashedPassword);

        payload.password = hashedPassword;

        const newUser = new User(payload);
        await newUser.save();

        return {
            correlationId,
            status: 'success',
            message: 'Utilisateur créé avec succès.',
            user: newUser
        };
    } catch (error) {
        console.error('Erreur dans registerUser:', error);
        return { correlationId, status: 'error', message: "Erreur lors de l'enregistrement." };
    }
}

async function loginUser({ email, password, correlationId }) {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.error('Utilisateur non trouvé:', email);
            return {
                correlationId,
                status: 'error',
                message: 'Utilisateur non trouvé.'
            };
        }
        console.log(user);
        console.log(password, user.password);
        const isMatch = await bcrypt.compare(password, user.password);

        return {
            correlationId,
            status: isMatch ? 'success' : 'error',
            message: isMatch ? 'Connexion réussie.' : 'Utilisateur ou mot de passe incorrect',
            user: isMatch ? { id: user._id, email: user.email } : undefined // Inclure uniquement les champs nécessaires
        };
    } catch (error) {
        console.error('Erreur dans loginUser:', error);
        return {
            correlationId,
            status: 'error',
            message: 'Erreur serveur.'
        };
    }
}

async function handleUserValidation({ payload }) {
    try {
        const { userId, correlationId } = payload;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid userId:', userId);
            return {
                correlationId,
                status: 'error',
                message: 'Invalid userId format.'
            };
        }

        const user = await User.findById(userId);

        if (!user) {
            console.error('User not found for userId:', userId);
            return {
                correlationId,
                status: 'error',
                message: 'User not found.'
            };
        }

        return {
            correlationId,
            status: 'success',
            message: 'User is valid.',
            user: user._id
        };
    } catch (error) {
        console.error('Error in handleUserValidation:', error);
        return {
            status: 'error',
            message: 'User validation failed.'
        };
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    registerUser,
    loginUser,
    handleUserValidation
};
