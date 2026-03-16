const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField,
Events
} = require("discord.js");

require("dotenv").config();

const client = new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID;

const REMINDER_TIME = 600000;

let language="id";

const ticketActivity={};

const text={
id:{
panelTitle:"🎫 Panel Tiket",
panelDesc:"Silahkan pilih jenis tiket",
help:"Butuh Bantuan",
refund:"Refund",
ask:"Pertanyaan",
created:"Tiket berhasil dibuat",
close:"Tutup Tiket",
reminderUser:"⏰ Reminder! User belum membalas tiket.",
reminderStaff:"⏰ Reminder! Staff belum membalas tiket."
},

melayu:{
panelTitle:"🎫 Panel Tiket",
panelDesc:"Sila pilih jenis tiket",
help:"Perlu Bantuan",
refund:"Pemulangan Wang",
ask:"Soalan",
created:"Tiket berjaya dibuat",
close:"Tutup Tiket",
reminderUser:"⏰ Pengguna belum membalas tiket",
reminderStaff:"⏰ Staff belum menjawab tiket"
},

malaysia:{
panelTitle:"🎫 Panel Tiket",
panelDesc:"Pilih jenis tiket",
help:"Perlu Bantuan",
refund:"Refund",
ask:"Pertanyaan",
created:"Tiket berjaya dibuat",
close:"Tutup Tiket",
reminderUser:"⏰ Pengguna belum balas tiket",
reminderStaff:"⏰ Staff belum balas tiket"
}
};

client.once("ready",async()=>{

console.log(`Bot online ${client.user.tag}`);

const guild=client.guilds.cache.first();

await guild.commands.set([
{
name:"panel",
description:"Kirim panel tiket"
},
{
name:"setlang",
description:"Ubah bahasa",
options:[
{
name:"bahasa",
type:3,
required:true,
choices:[
{name:"indonesia",value:"indonesia"},
{name:"melayu",value:"melayu"},
{name:"malaysia",value:"malaysia"}
]
}
]
}
]);

});

client.on(Events.InteractionCreate,async interaction=>{

if(interaction.isChatInputCommand()){

if(interaction.commandName==="panel"){

const embed=new EmbedBuilder()
.setTitle(text[language].panelTitle)
.setDescription(text[language].panelDesc)
.setColor("Blue");

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("help")
.setLabel(text[language].help)
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("refund")
.setLabel(text[language].refund)
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("ask")
.setLabel(text[language].ask)
.setStyle(ButtonStyle.Success)

);

interaction.reply({
embeds:[embed],
components:[row]
});

}

if(interaction.commandName==="setlang"){

const lang=interaction.options.getString("bahasa");

if(lang==="indonesia") language="id";
if(lang==="melayu") language="melayu";
if(lang==="malaysia") language="malaysia";

interaction.reply("Bahasa berhasil diubah");

}

}

if(interaction.isButton()){

const guild=interaction.guild;
const user=interaction.user;

if(["help","refund","ask"].includes(interaction.customId)){

const channel=await guild.channels.create({
name:`ticket-${user.username}`,
type:ChannelType.GuildText,
parent:TICKET_CATEGORY_ID,
permissionOverwrites:[
{
id:guild.id,
deny:[PermissionsBitField.Flags.ViewChannel]
},
{
id:user.id,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},
{
id:STAFF_ROLE_ID,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]
});

const closeRow=new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("close")
.setLabel(text[language].close)
.setStyle(ButtonStyle.Danger)
);

await channel.send({
content:`${user} <@&${STAFF_ROLE_ID}>`,
embeds:[
new EmbedBuilder()
.setTitle("Ticket Created")
.setDescription(`Kategori: ${interaction.customId}`)
.setColor("Green")
],
components:[closeRow]
});

ticketActivity[channel.id]=Date.now();

setInterval(()=>{

if(!ticketActivity[channel.id]) return;

if(Date.now()-ticketActivity[channel.id] > REMINDER_TIME){

channel.send(`<@${user.id}> <@&${STAFF_ROLE_ID}> Reminder tiket belum ada balasan.`);

ticketActivity[channel.id]=Date.now();

}

},REMINDER_TIME);

interaction.reply({
content:text[language].created,
ephemeral:true
});

}

if(interaction.customId==="close"){

delete ticketActivity[interaction.channel.id];

interaction.channel.delete();

}

}

});

client.on("messageCreate",(msg)=>{

if(!msg.channel.name.startsWith("ticket-")) return;

ticketActivity[msg.channel.id]=Date.now();

});

client.login(process.env.TOKEN);
