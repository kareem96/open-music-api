const nodemailer = require('nodemailer');
class MailSender{
    constructor(){
        this._transport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_ADDRESS,
                user: process.env.MAIL_PASSWORD,
            }
        });
    }

    sendEmail(targetEmail, content){
        const message = {
            from: 'Open Music V3',
            to: targetEmail,
            subject: 'Export Playlist',
            text: 'Terlampir ekspor playlist',
            attachment:[
                {
                    filename: 'playlist.json',
                    content,
                    conteType: 'application/json',
                }
            ]
        };
        return this._transport.sendMail(message);
    }
}
module.exports = MailSender;