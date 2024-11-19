// Producteurs (envoi de messages)
const connectRabbitMQ = require('../../clients/rabbitmq');

async function publishUserEvent(eventType, payload) {
  const channel = await connectRabbitMQ();

  const exchange = 'user.events';
  await channel.assertExchange(exchange, 'topic', { durable: true });

    const routingKey = `user.${eventType}`;

    const message = {
      event: routingKey,
      payload: payload
    };

  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
  console.log(`Published event: ${routingKey}`, payload);
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


module.exports = { publishUserEvent, publishUserResponse };
