const {
Client,
GatewayIntentBits,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField
} = require("discord.js")

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
})

const TOKEN = process.env.TOKEN
const STAFF_ROLE = process.env.STAFF_ROLE
const TICKET_CATEGORY = process.env.TICKET_CATEGORY

let language = "indonesia"
let openTickets = new Map()

const text = {
indonesia: {
panel: "Klik tombol untuk membuat tiket",
created: "Tiket kamu dibuat",
staffTag: "Staff akan segera membantu",
staffNoReply: "Staff belum merespon tiket ini",
userNoReply: "User belum merespon tiket ini",
close: "Tiket akan ditutup 5 detik"
},
melayu: {
panel: "Klik butang untuk buat tiket",
created: "Tiket kamu dibuat",
staffTag: "Staff akan membantu",
staffNoReply: "Staff belum balas tiket ini",
userNoReply: "User belum balas tiket ini",
close: "Tiket akan ditutup 5 saat"
},
malaysia: {
panel: "Tekan butang untuk buka tiket",
created: "Tiket anda dibuat",
staffTag: "Staff akan membantu anda",
staffNoReply: "Staff belum respon tiket ini",
userNoReply: "User belum respon tiket ini",
close: "Tiket akan ditutup dalam 5 saat"
}
}

client.once("ready", async () => {

console.log(`Bot online ${client.user.tag}`)

const guild = client.guilds.cache.first()

await guild.commands.set([
{
name: "panel",
description: "Kirim panel tiket"
},
{
name: "setlang",
description: "Ubah bahasa bot",
options: [
{
name: "bahasa",
description: "Pilih bahasa",
type: 3,
required: true,
choices: [
{ name: "indonesia", value: "indonesia" },
{ name: "melayu", value: "melayu" },
{ name: "malaysia", value: "malaysia" }
]
}
]
}
])

})

client.on("interactionCreate", async interaction => {

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "panel") {

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("create_ticket")
.setLabel("🎫 Buat Tiket")
.setStyle(ButtonStyle.Primary)
)

await interaction.reply({
content: text[language].panel,
components: [row]
})

}

if (interaction.commandName === "setlang") {

language = interaction.options.getString("bahasa")

await interaction.reply({
content: `Bahasa diubah ke **${language}**`
})

}

}

if (interaction.isButton()) {

if (interaction.customId === "create_ticket") {

if (openTickets.has(interaction.user.id)) {
return interaction.reply({
content: "Kamu sudah punya tiket",
ephemeral: true
})
}

const channel = await interaction.guild.channels.create({
name: `ticket-${interaction.user.username}`,
type: ChannelType.GuildText,
parent: TICKET_CATEGORY,
permissionOverwrites: [
{
id: interaction.guild.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},
{
id: interaction.user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},
{
id: STAFF_ROLE,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]
})

openTickets.set(interaction.user.id, channel.id)

const closeRow = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("close_ticket")
.setLabel("🔒 Close Ticket")
.setStyle(ButtonStyle.Danger)
)

await channel.send({
content: `<@${interaction.user.id}> <@&${STAFF_ROLE}>\n${text[language].staffTag}`,
components: [closeRow]
})

interaction.reply({
content: `${text[language].created}: ${channel}`,
ephemeral: true
})

setTimeout(() => {
channel.send(`<@&${STAFF_ROLE}> ${text[language].staffNoReply}`)
}, 300000)

setTimeout(() => {
channel.send(`<@${interaction.user.id}> ${text[language].userNoReply}`)
}, 600000)

}

if (interaction.customId === "close_ticket") {

await interaction.channel.send(text[language].close)

setTimeout(() => {
interaction.channel.delete()
}, 5000)

}

}

})

client.login(TOKEN)
