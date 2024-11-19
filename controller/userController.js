const userService = require('../services/userService');
const bcrypt = require('bcrypt');

exports.getUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const updates = { ...req.body };

        // Si le mot de passe est présent dans les mises à jour, le hacher
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await userService.updateUserById(req.params.id, updates);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Erreur dans updateUser:', error);
        res.status(500).json({ message: 'Erreur serveur.', error });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await userService.deleteUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error });
    }
};