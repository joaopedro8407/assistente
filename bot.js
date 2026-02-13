const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    }
});


const contatosAtendidos = new Map();

client.on('qr', qr => {
    console.log('QR RECEIVED');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot está online!');
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function enviarMenu(chat) {
    await chat.sendStateTyping();
    await delay(3000);

    await chat.sendMessage(
`Olá! Agradecemos seu contato.

Para direcionarmos o atendimento, informe o assunto:

1 - Orçamento
2 - Recrutamento
3 - Departamento Pessoal
4 - Financeiro

Digite o número da opção.`
    );
}

client.on('message', async msg => {

    if (msg.from.endsWith('@g.us')) return;

    const chat = await msg.getChat();
    const contato = msg.from;
    const texto = msg.body.toLowerCase();

    if (!contatosAtendidos.has(contato)) {
        contatosAtendidos.set(contato, true);
        await enviarMenu(chat);
        return;
    }

    await chat.sendStateTyping();
    await delay(2500);

    if (texto === '1') {
        await chat.sendMessage(
`Orçamento:
Envie sua solicitação detalhada para analisarmos.

Digite 0 para voltar ao menu ou sair para encerrar.`
        );
    }

    else if (texto === '2') {
        await chat.sendMessage(
`Recrutamento:
Envie seu currículo para recrutamento@hausen.eng.br
Telefone: (31) 3025-1130

Digite 0 para voltar ao menu ou sair para encerrar.`
        );
    }

    else if (texto === '3') {
        await chat.sendMessage(
`Departamento Pessoal:
Telefone: (31) 99619-8611

Digite 0 para voltar ao menu ou sair para encerrar.`
        );
    }

    else if (texto === '4') {
        await chat.sendMessage(
`Financeiro:
Envie para financeiro@hausen.eng.br

Digite 0 para voltar ao menu ou sair para encerrar.`
        );
    }

    else if (texto === '0') {
        await enviarMenu(chat);
    }

    else if (texto === 'sair') {
        contatosAtendidos.delete(contato);
        await chat.sendMessage("Atendimento encerrado. Caso precise, envie nova mensagem.");
    }

});

client.initialize();

