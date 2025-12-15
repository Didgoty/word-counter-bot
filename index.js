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
      lines.push(`**${i + 1}.** @${name} — **${count}** time(s)`);
    }

    return interaction.reply(
      `**Leaderboard for "${word}"**\n` + lines.join("\n")
    );
  }
  if (interaction.commandName == "fuckass fun facts") {
    function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const funFacts = [
      "Octopuses have three hearts.",
      "Bananas are naturally radioactive.",
      "A day on Venus is longer than a year on Venus.",
      "Wombat poop is cube-shaped.",
      "Sharks existed before trees.",
      "There are more possible games of chess than atoms in the observable universe.",
      "Honey never spoils and can last thousands of years.",
      "Cows have best friends and get stressed when separated.",
      "Your brain uses about 20% of your body’s energy.",
      "A shrimp’s heart is in its head.",
      "You are slightly taller in the morning than at night.",
      "The human body glows faintly, but our eyes can’t see it.",
      "Some turtles can breathe through their butts.",
      "The Eiffel Tower grows about 15 cm taller in summer.",
      "Sloths can hold their breath longer than dolphins.",
      "There are more trees on Earth than stars in the Milky Way.",
      "A cloud can weigh over a million tons.",
      "Space is completely silent.",
      "You can’t hum while holding your nose.",
      "The average person walks the equivalent of five times around the Earth in their lifetime.",
      "Oxford University is older than the Aztec Empire.",
      "A group of flamingos is called a flamboyance.",
      "Humans share about 60% of their DNA with bananas.",
      "There are more possible arrangements of a deck of cards than atoms on Earth.",
      "Cats can’t taste sweetness.",
      "The longest-living vertebrate is the Greenland shark.",
      "Your stomach replaces its lining every few days.",
      "Butterflies remember being caterpillars.",
      "Scotland has over 400 words for snow.",
      "Some metals explode in water.",
      "An eagle can see up to eight times better than a human.",
      "You have more bacteria in your body than human cells.",
      "A single teaspoon of honey is the lifetime work of 12 bees.",
      "Saturn could float in water (if a bathtub were big enough).",
      "The inventor of the Pringles can is buried in one.",
      "The dot over the letter i is called a tittle.",
      "There’s a species of jellyfish that is biologically immortal.",
      "The smell of rain has a name: petrichor.",
      "A bolt of lightning is hotter than the surface of the Sun.",
      "Humans can’t breathe and swallow at the same time.",
      "There are more fake flamingos in the world than real ones.",
      "The human nose can remember over 50,000 scents.",
      "Some frogs can freeze solid and survive.",
      "The average cloud weighs over a million tons.",
      "You blink about 15–20 times per minute.",
      "The moon is slowly moving away from Earth.",
      "A day on Mercury lasts longer than its year.",
      "Your taste buds change about every two weeks.",
      "Antarctica is technically the world’s largest desert."
    ];
    return interaction.reply(funFacts[getRandomInt(0, funFacts.length - 1)])

    


  }
});


client.login(process.env.DISCORD_TOKEN);
