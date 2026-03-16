const {
Client,
GatewayIntentBits,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField,
EmbedBuilder
} = require("discord.js")

const client = new Client({
intents: [GatewayIntentBits.Guilds]
})

const TOKEN = process.env.TOKEN
const OWNER_ID = process.env.OWNER_ID
const TICKET_CATEGORY = process.env.TICKET_CATEGORY

let openTickets = new Map()

client.once("ready", async () => {

console.log(`Bot online ${client.user.tag}`)

const guild = client.guilds.cache.first()

await guild.commands.set([
{
name: "panel",
description: "Kirim panel tiket"
},
{
name: "add",
description: "Tambah user ke tiket",
options: [
{
name: "user",
description: "User yang ingin ditambahkan",
type: 6,
required: true
}
]
},
{
name: "remove",
description: "Hapus user dari tiket",
options: [
{
name: "user",
description: "User yang ingin dihapus",
type: 6,
required: true
}
]
}
])

})

client.on("interactionCreate", async interaction => {

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "panel") {

const embed = new EmbedBuilder()
.setColor(0xFFD700)
.setTitle("🎫 SISTEM SUPPORT TIKET")
.setDescription(
"Selamat datang di **Customer Support Server**.\n\n"+
"Jika kamu mengalami masalah, ingin bertanya, melakukan refund, atau membuat order baru, kamu bisa membuat tiket support.\n\n"+
"Staff kami akan membantu kamu secepat mungkin.\n\n"+
"📌 **Peraturan Tiket**\n"+
"• Jangan spam tiket\n"+
"• Jelaskan masalah dengan jelas\n"+
"• Tunggu staff membalas\n\n"+
"Silakan pilih kategori tiket di bawah."
)

const row = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("bantuan")
.setLabel("🛠 Bantuan")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("refund")
.setLabel("💰 Refund")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("pertanyaan")
.setLabel("❓ Pertanyaan")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("order")
.setLabel("📦 Order")
.setStyle(ButtonStyle.Danger)

)

interaction.reply({
embeds:[embed],
components:[row]
})

}

if (interaction.commandName === "add") {

if (interaction.user.id !== OWNER_ID)
return interaction.reply({content:"❌ Hanya owner",ephemeral:true})

const user = interaction.options.getUser("user")

await interaction.channel.permissionOverwrites.edit(user.id,{
ViewChannel:true,
SendMessages:true
})

interaction.reply(`✅ ${user} ditambahkan ke tiket`)

}

if (interaction.commandName === "remove") {

if (interaction.user.id !== OWNER_ID)
return interaction.reply({content:"❌ Hanya owner",ephemeral:true})

const user = interaction.options.getUser("user")

await interaction.channel.permissionOverwrites.delete(user.id)

interaction.reply(`❌ ${user} dihapus dari tiket`)

}

}

if (interaction.isButton()) {

if (
interaction.customId === "bantuan" ||
interaction.customId === "refund" ||
interaction.customId === "pertanyaan" ||
interaction.customId === "order"
){

await interaction.deferReply({ephemeral:true})

if(openTickets.has(interaction.user.id))
return interaction.editReply("❌ Kamu sudah punya tiket")

const channel = await interaction.guild.channels.create({
name:`${interaction.customId}-${interaction.user.username}`,
type:ChannelType.GuildText,
parent:TICKET_CATEGORY,
permissionOverwrites:[
{
id:interaction.guild.id,
deny:[PermissionsBitField.Flags.ViewChannel]
},
{
id:interaction.user.id,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},
{
id:OWNER_ID,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]
})

openTickets.set(interaction.user.id,channel.id)

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("close_ticket")
.setLabel("🔒 Close Ticket")
.setStyle(ButtonStyle.Danger)
)

channel.send({
content:`<@${interaction.user.id}> <@${OWNER_ID}> tiket dibuat`,
components:[row]
})

interaction.editReply(`✅ Tiket dibuat: ${channel}`)

}

if(interaction.customId==="close_ticket"){

interaction.channel.send("🔒 Tiket akan ditutup dalam 5 detik")

setTimeout(()=>{
interaction.channel.delete().catch(()=>{})
},5000)

}

}

})

client.login(TOKEN)
