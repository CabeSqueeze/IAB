const fs = require("fs");
const http = require("http");
const { Client, Collection } = require("discord.js");

const client = new Client();

client.commands = new Collection();

const prefix = ".";

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on("ready", () => {
  console.log("Discord Ready");
  client.user.setActivity("Chicago Police Department", { type: "WATCHING" });
});

client.on("message", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("An error occurred while executing the command.");
  }
});

client.login(process.env.DISCORD_TOKEN);

const server = http.createServer(function (req, res) {
  res.write("The bot has successfully started.");
  res.end();
});

server.listen(8080);
