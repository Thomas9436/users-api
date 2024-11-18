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

module.exports = { publishUserEvent };
