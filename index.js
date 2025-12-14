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
  if (interaction.commandName === "count") {
    const user = interaction.options.getUser("user", true);
    let word = interaction.options.getString("word", true).trim().toLowerCase();

    if (!/^[a-z]+$/i.test(word)) {
      return interaction.reply({
        content: `Please use letters only (A–Z). Example: \`/count user:@Someone word:potato\``,
        ephemeral: true,
      });
    }

    const count = data.users?.[user.id]?.[word] ?? 0;

    return interaction.reply(
      `**${user.username}** has said the word **"${word}"** **${count}** time(s).`
    );
  }

  if (interaction.commandName === "leaderboard") {
    let word = interaction.options.getString("word", true).trim().toLowerCase();

    if (!/^[a-z]+$/i.test(word)) {
      return interaction.reply({
        content: `Please use letters only (A–Z).`,
        ephemeral: true,
      });
    }

    const usersObj = data.users || {};
    const entries = Object.entries(usersObj)
      .map(([userId, words]) => [userId, words?.[word] ?? 0])
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (entries.length === 0) {
      return interaction.reply(`Nobody has said **"${word}"** yet.`);
    }

    const lines = [];
    for (let i = 0; i < entries.length; i++) {
      const [userId, count] = entries[i];

      let name = "Unknown User";
      try {
        const member = await interaction.guild.members.fetch(userId);
        name = member.displayName;
      } catch {
        // user not in this server or can't be fetched
      }
      if (count == 1) {
        lines.push(`**${i + 1}.** @${name} — **${count}** time`);
      } else {
        lines.push(`**${i + 1}.** @${name} — **${count}** times`);
      }
 
    }

    return interaction.reply(
      `**Leaderboard for "${word}"**\n` + lines.join("\n")
    );
  }
});


client.login(process.env.DISCORD_TOKEN);
