console.log("deploy script started");
require("dotenv").config();
const { REST, Routes } = require("discord.js");

console.log("deploy script started");
console.log("TOKEN present?", Boolean(process.env.DISCORD_TOKEN));
console.log("CLIENT_ID:", process.env.CLIENT_ID);
console.log("GUILD_ID:", process.env.GUILD_ID);





const commands = [
  {
    name: "count",
    description: "Count how many times a user has said a word.",
    options: [
      { name: "user", description: "User to check", type: 6, required: true },
      { name: "word", description: "Word to count (letters only)", type: 3, required: true },
    ],
  },
  {
    name: "leaderboard",
    description: "Top 10 users who have said a word the most.",
    options: [
      { name: "word", description: "Word to rank (letters only)", type: 3, required: true },
    ],
  },
  {
    name: "fuckass-fun-facts", 
    description: "generates a fuckass fun fact",

  },
  {
    name: "8-ball",
    description: "decides your fate",
    options: [
      { name: "request", description: "What will you ask the real magic totally not ransom 8-ball??", type: 3, required: true },
    ]
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("About to PUT commands...");
    const res = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log(" Done. Registered:", Array.isArray(res) ? res.length : res);
  } catch (e) {
    console.error(" Error deploying commands:", e);
  }
})();
