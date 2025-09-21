const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const sock = makeWASocket({ auth: state });

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update;
        if (qr) {
            qrcode.generate(qr, { small: true });
        }
        if (connection === "close") {
            console.log("Conexão perdida, tentando reconectar...");
            startBot();
        } else if (connection === "open") {
            console.log("Bot conectado com sucesso!");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (!text) return;

        if (text.toLowerCase() === "olá") {
            await sock.sendMessage(from, { text: "Oi, eu sou o Uchiha_bot 😏🔥" });
        } else if (text.toLowerCase() === "como está?") {
            await sock.sendMessage(from, { text: "Estou bem, pronto pra missão! 💀" });
        } else if (text.includes("http") || text.includes("https")) {
            await sock.sendMessage(from, { text: "🚫 Links não são permitidos neste grupo!" });
            await sock.groupParticipantsUpdate(from, [msg.key.participant], "remove");
        }
    });

    sock.ev.on("creds.update", saveCreds);
}

startBot();
