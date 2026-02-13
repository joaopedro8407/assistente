const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process'
        ]
    }
});

client.on('qr', qr => {
    console.log('📲 Escaneie o QR Code abaixo:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot está pronto!');
});

client.on('message', message => {
    if (message.body.toLowerCase() === 'oi') {
        message.reply('Olá 👋 Estou rodando no Koyeb 🚀');
    }
});

client.initialize();
