// user-service/services/userService.js
const { client, publishMessage } = require('../config/mqttClient');
const bcrypt = require('bcrypt');
const User = require('../model/users');

// Connexion au broker MQTT et abonnement aux topics
client.on('connect', () => {
    console.log('Connecté à MQTT pour le userService');

    client.subscribe('user-register', (err) => {
        if (!err) console.log('Souscrit au topic user-register');
    });

    client.subscribe('user-login', (err) => {
        if (!err) console.log('Souscrit au topic user-login');
    });

    client.subscribe('user-get', (err) => {
        if (!err) console.log('Souscrit au topic user-get');
    });
});

// Gestion des messages MQTT pour l'inscription, la connexion et la récupération d'utilisateur
client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());

    if (topic === 'user-register') {
        const response = await registerUser(data);
        publishMessage('user-response', JSON.stringify(response));
    }

    if (topic === 'user-login') {
        const response = await loginUser(data);
        publishMessage('user-response', JSON.stringify(response));
    }

    if (topic === 'user-get') {
        const response = await getUserById(data.userId);
        response.correlationId = data.correlationId;
        publishMessage('user-get-response', JSON.stringify(response));
    }
});

// Fonction pour inscrire un utilisateur
async function registerUser({ firstName, lastName, email, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return { email, status: 'error', message: 'Cet utilisateur existe déjà.' };
    }

    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();

    return { email, status: 'success', message: 'Utilisateur créé avec succès.' };
}

// Fonction pour connecter un utilisateur
async function loginUser({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
        return { email, isMatch: false, message: 'Utilisateur ou mot de passe incorrect.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    return {
        email,
        userId: isMatch ? user._id : null,
        isMatch,
        message: isMatch ? 'Connexion réussie.' : 'Utilisateur ou mot de passe incorrect.'
    };
}

// Fonction pour récupérer un utilisateur par ID
async function getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    return user ? { userId, status: 'success', user } : { userId, status: 'error', message: 'Utilisateur non trouvé' };
}

module.exports = {
    registerUser,
    loginUser,
    getUserById
};
