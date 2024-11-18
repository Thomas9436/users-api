const User = require('../model/userModel');
const { publishUserEvent } = require('./producers/userProducer');
const bcrypt = require('bcrypt');

async function getAllUsers() {
  try {
    const users = await User.find().select('-password'); // Exclut les mots de passe des résultats
    return users;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des utilisateurs.');
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
    console.log('Payload pour registerUser:', payload);
    // Logique métier
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      return {correlationId, status: 'error', message: 'Utilisateur déjà existant.' };
    }

    const newUser = new User(payload);
    await newUser.save();

    // Publie un événement RabbitMQ après la création réussie de l'utilisateur
    await publishUserEvent('created', {
      correlationId, // Inclut le correlationId dans l'événement
      email: newUser.email,
      id: newUser._id,
      status: 'success', // Indiquer le statut de l'opération
      message: 'Utilisateur créé avec succès.' // Message explicatif
    });

    return {correlationId, status: 'success', message: 'Utilisateur créé avec succès.', user: newUser };
  } catch (error) {
    console.error('Erreur dans registerUser:', error);
    return {correlationId,  status: 'error', message: 'Erreur lors de l\'enregistrement.' };
  }
}

async function loginUser({ email, password, correlationId }) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        correlationId,
        status: 'error',
        message: 'Utilisateur ou mot de passe incorrect.'
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    return {
      correlationId, // Ajoute le correlationId
      status: isMatch ? 'success' : 'error',
      message: isMatch ? 'Connexion réussie.' : 'Utilisateur ou mot de passe incorrect.',
      userId: isMatch ? user._id : null
    };
  } catch (error) {
    console.error('Erreur dans loginUser:', error);
    return {
      correlationId, // Ajoute le correlationId
      status: 'error',
      message: 'Erreur serveur.'
    };
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  registerUser, 
  loginUser
};
