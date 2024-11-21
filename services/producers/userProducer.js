// Producteurs (envoi de messages)
const connectRabbitMQ = require('../../clients/rabbitmq');

async function publishUserResponse(response) {
    if (!response || !response.status || !response.correlationId) {
        console.error('Response mal formée ou absente:', response);
        return; // Ne publie rien si la réponse est invalide
    }

    console.log('Utilisateur dans la réponse:', response);

    const channel = await connectRabbitMQ();
    const exchange = 'user.responses';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    const routingKey = `user.response.${response.status}`;

    const message = {
        event: 'user.response', // Ajoute explicitement le type d'événement
        correlationId: response.correlationId,
        status: response.status,
        message: response.message,
        user: response.user
    };

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
    console.log(`Published response:`, message);
}

module.exports = { publishUserResponse };
