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

// Controle de estado por usuário
const userState = {};

client.on('qr', qr => {
    console.log('📲 Escaneie o QR Code abaixo:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot está pronto!');
});

function sendMainMenu(message) {
    userState[message.from] = "main";
    message.reply(
`📋 *MENU PRINCIPAL*

1️⃣ - Suporte  
2️⃣ - Financeiro  
3️⃣ - Informações  

Digite o número da opção desejada.`
    );
}

client.on('message', async message => {
    const msg = message.body.toLowerCase();

    // Sempre permitir voltar ao menu
    if (msg === "menu") {
        return sendMainMenu(message);
    }

    if (!userState[message.from]) {
        return sendMainMenu(message);
    }

    // ===== MENU PRINCIPAL =====
    if (userState[message.from] === "main") {

        if (msg === "1") {
            userState[message.from] = "suporte";
            return message.reply(
`🛠 *SUPORTE*

1️⃣ - Problemas técnicos  
2️⃣ - Falar com atendente  

0️⃣ - Voltar ao menu`
            );
        }

        if (msg === "2") {
            userState[message.from] = "financeiro";
            return message.reply(
`💰 *FINANCEIRO*

1️⃣ - Segunda via de boleto  
2️⃣ - Informações de pagamento  

0️⃣ - Voltar ao menu`
            );
        }

        if (msg === "3") {
            return message.reply("ℹ️ Somos uma empresa especializada em soluções digitais 🚀");
        }
    }

    // ===== SUBMENU SUPORTE =====
    if (userState[message.from] === "suporte") {

        if (msg === "1") {
            userState[message.from] = "problema_tecnico";
            return message.reply("🔧 Descreva seu problema técnico:");
        }

        if (msg === "2") {
            return message.reply("👨‍💻 Um atendente entrará em contato em breve.");
        }

        if (msg === "0") {
            return sendMainMenu(message);
        }
    }

    // ===== PERGUNTA PROBLEMA TÉCNICO =====
    if (userState[message.from] === "problema_tecnico") {
        userState[message.from] = "main";
        return message.reply(
`📩 Obrigado por descrever o problema:

"${message.body}"

Nossa equipe irá analisar e responder em breve.

Digite *menu* para voltar ao início.`
        );
    }

    // ===== SUBMENU FINANCEIRO =====
    if (userState[message.from] === "financeiro") {

        if (msg === "1") {
            return message.reply("📄 A segunda via será enviada para seu e-mail cadastrado.");
        }

        if (msg === "2") {
            return message.reply("💳 Aceitamos PIX, cartão e boleto.");
        }

        if (msg === "0") {
            return sendMainMenu(message);
        }
    }
});

client.initialize();
