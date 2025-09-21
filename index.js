const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false // não vai gerar QR
    })

    // Salva sessão
    sock.ev.on("creds.update", saveCreds)

    // Se ainda não estiver registrado, pede código via número de telefone
    if (!sock.authState.creds.registered) {
        const phoneNumber = "+244939862061" // SEU NÚMERO AQUI
        const code = await sock.requestPairingCode(phoneNumber)
        console.log("📲 Digite esse código no WhatsApp para conectar:", code)
    }

    // Eventos de conexão
    sock.ev.on("connection.update", (update) => {
        const { connection } = update
        if (connection === "open") {
            console.log("✅ Uchiha_bot conectado com sucesso!")
        } else if (connection === "close") {
            console.log("⚠️ Conexão perdida. Tentando reconectar...")
            startBot()
        }
    })

    // Resposta às mensagens
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return

        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text

        if (!text) return

        if (text.toLowerCase() === "olá") {
            await sock.sendMessage(from, { text: "Oi, eu sou o Uchiha_bot 😏🔥" })
        } else if (text.toLowerCase() === "como está?") {
            await sock.sendMessage(from, { text: "Estou bem, pronto pra missão! 💀" })
        } else if (text.includes("http") || text.includes("https")) {
            await sock.sendMessage(from, { text: "🚫 Links não são permitidos neste grupo!" })
            await sock.groupParticipantsUpdate(from, [msg.key.participant], "remove")
        }
    })
}

startBot()
