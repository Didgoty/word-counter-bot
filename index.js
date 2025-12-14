require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits } = require("discord.js");

const DATA_PATH = path.join(__dirname, "data.json");

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch {
    return { users: {} }; 
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

function extractWords(content) {
  const matches = content.match(/[A-Za-z]+/g);
  return matches ? matches.map(w => w.toLowerCase()) : [];
}

const data = loadData();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, 
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  const userId = message.author.id;

  const words = extractWords(message.content);
  if (words.length === 0) return;

  if (!data.users[userId]) data.users[userId] = {};

  for (const w of words) {
    data.users[userId][w] = (data.users[userId][w] || 0) + 1;
  }

  saveData(data);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "count") return;

  const user = interaction.options.getUser("user", true);
  let word = interaction.options.getString("word", true).trim().toLowerCase();
  if (!/^[a-z]+$/i.test(word)) {
    return interaction.reply({
      content: `Please use letters only for now (A–Z). Example: \`/count user:@Someone word:potato\``,
      ephemeral: true,
    });
  }

  const count = data.users?.[user.id]?.[word] ?? 0;

  await interaction.reply(
    `📊 **${user.username}** has said the word **"${word}"** **${count}** time(s) (since the bot started running).`
  );
});

client.login(process.env.DISCORD_TOKEN);
