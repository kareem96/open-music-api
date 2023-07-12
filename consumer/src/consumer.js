const amqp = require('amqplib');
require('dotenv').config();
const PlaylistsService = require('./PlaylistService');
const MailSender = require('./MailSender');
const Listener = require('./listener');

const init = async () => {
    const service = new PlaylistsService();
    const sender = new MailSender();
    const listener = new Listener(service, sender);
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    await channel.assertQueue('export:playlistsongs', {
       durable: true 
    });
    channel.consume('export:playlistsongs', listener.listen, {noAck: true});
    console.log('Server consumer berjalan');
}
init();