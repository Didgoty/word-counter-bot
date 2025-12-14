require("dotenv").config();
const { REST, Routes } = require("discord.js");

const commands = [
  {
    name: "count",
    description: "Count how many times a user has said a word.",
    options: [
      { name: "user", description: "User to check", type: 6, required: true },
      { name: "word", description: "Word to count (letters only)", type: 3, required: true },
    ],
        name: "leaderboard",
    description: "Top 10 users who have said a word the most.",
    options: [
      { name: "word", description: "Word to rank (letters only)", type: 3, required: true },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log("Slash command registered/updated.");
})();
