// index.js
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info")

    const sock = makeWASocket({
        printQRInTerminal: false, // Desativa QR code
        auth: state
    })

    // Exibe código de 8 dígitos no terminal
    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode("244939862061") // <-- seu número
        console.log("📲 Seu código de emparelhamento é:", code)
    }

    // Evento de mensagens recebidas
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return
        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text

        console.log("💬 Mensagem recebida de", from, ":", text)

        // Comando simples
        if (text?.toLowerCase() === "!ping") {
            await sock.sendMessage(from, { text: "🏓 Pong!" })
        }

        if (text?.toLowerCase() === "!dono") {
            await sock.sendMessage(from, { text: "👑 O dono sou eu: +244939862061 (Madara Uchiha)" })
        }
    })

    // Evento de conexão
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update
        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error instanceof Boom &&
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
            console.log("⚠️ Conexão fechada. Reconectar:", shouldReconnect)
            if (shouldReconnect) {
                startBot()
            }
        } else if (connection === "open") {
            console.log("✅ Bot conectado com sucesso!")
        }
    })

    sock.ev.on("creds.update", saveCreds)
}

startBot()
