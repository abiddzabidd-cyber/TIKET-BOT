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

const STAFF_ROLE_IDS = process.env.STAFF_ROLE_IDS.split(",");
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
close:"Tutup Tiket"
},
melayu:{
panelTitle:"🎫 Panel Tiket",
panelDesc:"Sila pilih jenis tiket",
help:"Perlu Bantuan",
refund:"Pemulangan Wang",
ask:"Soalan",
created:"Tiket berjaya dibuat",
close:"Tutup Tiket"
},
malaysia:{
panelTitle:"🎫 Panel Tiket",
panelDesc:"Pilih jenis tiket",
help:"Perlu Bantuan",
refund:"Refund",
ask:"Pertanyaan",
created:"Tiket berjaya dibuat",
close:"Tutup Tiket"
}
};
client.once("ready", async () => {

console.log(`Bot online ${client.user.tag}`);

const guild = client.guilds.cache.get(process.env.GUILD_ID);

if(!guild){
console.log("Guild tidak ditemukan");
return;
}

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
name: "setlang",
description: "Ubah bahasa bot",
options: [
{
type: 3,
name: "bahasa",
description: "Pilih bahasa bot",
required: true,
choices: [
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

let perms=[
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
}
];

STAFF_ROLE_IDS.forEach(role=>{
perms.push({
id:role,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
});
});

const channel=await guild.channels.create({
name:`ticket-${user.username}`,
type:ChannelType.GuildText,
parent:TICKET_CATEGORY_ID,
permissionOverwrites:perms
});

const closeRow=new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("close")
.setLabel(text[language].close)
.setStyle(ButtonStyle.Danger)
);

let staffMention = STAFF_ROLE_IDS.map(id=>`<@&${id}>`).join(" ");

await channel.send({
content:`${user} ${staffMention}`,
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

channel.send(`⏰ Reminder! ${user} ${staffMention} tiket belum dibalas.`);

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
