const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process'
        ]
    }
});

let sessoes = {};
const TEMPO_RESET = 30 * 60 * 1000; // 30 minutos

// ================= MENU =================

function menuPrincipal() {
    return `Olá! Agradecemos seu contato.

Para direcionarmos o atendimento, favor nos informar o assunto:

1 - Orçamento
2 - Recrutamento / Currículos
3 - Departamento Pessoal
4 - Financeiro
5 - Outros

Digite o número da opção desejada.`;
}

function menuFinal() {
    return `

Digite:
0 - Voltar ao menu principal
9 - Encerrar atendimento`;
}

// ================= DIGITAÇÃO HUMANA =================

async function enviarComDigitacao(chat, mensagem) {

    const partes = mensagem.split('\n\n');

    for (let parte of partes) {

        const tempoPorLetra = 60; // velocidade humana
        const tempoMinimo = 1500;
        const tempo = Math.max(tempoMinimo, parte.length * tempoPorLetra);

        const interval = setInterval(() => {
            chat.sendStateTyping();
        }, 4000);

        await new Promise(resolve => setTimeout(resolve, tempo));

        clearInterval(interval);

        await chat.sendMessage(parte);

        await new Promise(resolve => 
            setTimeout(resolve, 800 + Math.random() * 1200)
        );
    }
}

// ================= EVENTOS =================

client.on('qr', (qr) => {
    console.log('\nESCANEIE O QR CODE:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot conectado no Railway!');
});

client.on('message', async (message) => {

    // Ignorar grupos
    if (message.from.includes('@g.us')) return;

    // Ignorar mensagens próprias
    if (message.fromMe) return;

    const numero = message.from;
    const agora = Date.now();
    const texto = message.body.trim();

    // RESET DE SESSÃO
    if (!sessoes[numero] || (agora - sessoes[numero].ultimaInteracao) > TEMPO_RESET) {
        sessoes[numero] = { etapa: "menu", ultimaInteracao: agora };

        const chat = await message.getChat();
        await enviarComDigitacao(chat, menuPrincipal());
        return;
    }

    sessoes[numero].ultimaInteracao = agora;

    // ================= MENU PRINCIPAL =================

    if (sessoes[numero].etapa === "menu") {

        let resposta = "";

        switch (texto) {
            case "1":
                resposta = "Para orçamentos, por favor descreva sua solicitação detalhadamente.";
                break;

            case "2":
                resposta = `Recrutamento / Currículos

Agradecemos seu interesse em fazer parte do time Hausen.

Envie seu currículo para:
recrutamento@hausen.eng.br

Telefone:
(31) 3025-1130`;
                break;

            case "3":
                resposta = `Departamento Pessoal

Entre em contato pelo telefone:
(31) 99619-8611`;
                break;

            case "4":
                resposta = `Financeiro

Envie sua mensagem para:
financeiro@hausen.eng.br`;
                break;

            case "5":
                resposta = "Por favor, descreva sua solicitação.";
                break;

            default:
                resposta = "Opção inválida.\n\n" + menuPrincipal();
        }

        resposta += menuFinal();
        sessoes[numero].etapa = "final";

        const chat = await message.getChat();
        await enviarComDigitacao(chat, resposta);
        return;
    }

    // ================= MENU FINAL =================

    if (sessoes[numero].etapa === "final") {

        if (texto === "0") {
            sessoes[numero].etapa = "menu";
            const chat = await message.getChat();
            await enviarComDigitacao(chat, menuPrincipal());
            return;
        }

        if (texto === "9") {
            delete sessoes[numero];
            const chat = await message.getChat();
            await enviarComDigitacao(chat, "Atendimento encerrado. Caso precise, estamos à disposição.");
            return;
        }

        const chat = await message.getChat();
        await enviarComDigitacao(chat, "Digite 0 para voltar ao menu principal ou 9 para encerrar.");
    }

});

client.initialize();
