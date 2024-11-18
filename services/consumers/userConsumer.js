const connectRabbitMQ = require('../../clients/rabbitmq');
const userService = require('../userService');

async function consumeUserEvents() {
  const channel = await connectRabbitMQ();
  const queue = 'user-service.queue';
  const exchange = 'user.events';

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, 'user.*');

  console.log(`Waiting for user events in queue: ${queue}...`);

  channel.consume(queue, async (msg) => {
    if (msg) {
      const event = JSON.parse(msg.content.toString());
      console.log(`Received event: ${event.event}`, event.payload);

      if (!event.payload) {
        console.error('Payload absent pour cet événement:', event);
        channel.ack(msg); // Acquitte le message pour éviter des re-traitements
        return;
      }

      const { correlationId, payload } = event;
      let response;

    switch (event.event) {
      case 'user.register':
        response = await userService.registerUser({ payload, correlationId });
        break;
      case 'user.login':
        response = await userService.loginUser({...payload, correlationId });
        break;
      default:
        console.warn(`Warning -> Événement non pris en charge: ${event.event}`);
        response = null // Pas de réponse à générer pour les événements non pris en charge
    }

      if (response) {
        await publishUserResponse(response);
      } else {
        console.warn('Aucune réponse générée pour cet événement:', event);
      }

      channel.ack(msg); // Acquitte le message après traitement
    }
  });
}

async function publishUserResponse(response) {
  if (!response || !response.status || !response.correlationId) {
    console.error('Response mal formée ou absente:', response);
    return; // Ne publie rien si la réponse est invalide
  }

  const channel = await connectRabbitMQ();
  const exchange = 'user.responses';
  await channel.assertExchange(exchange, 'topic', { durable: true });

  const routingKey = `user.response.${response.status}`;
  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(response)));
  console.log(`Published response:`, response);
}

module.exports = { consumeUserEvents };
