const fetch = require("@replit/node-fetch");
const Discord = require("discord.js");

module.exports = {
  name: "r2d",
  description: "Resolves the Discord ID(s) linked with a Roblox account.",
  execute: async (message, args) => {
    const robloxInput = args[0];
    if (!robloxInput) {
      return message.channel.send("Please provide a valid Roblox username or ID.");
    }

    let robloxId = robloxInput;
    if (isNaN(robloxId)) {
      robloxId = await getUserIdByUsername(robloxInput);
    }

    if (!robloxId) {
      return message.channel.send("Unable to find any player with that username/userid.");
    }

    try {
      const response = await fetch(
        `https://api.blox.link/v4/public/guilds/699027931355152435/roblox-to-discord/${robloxId}`,
        {
          headers: {
            Authorization: process.env.BLOXLINK_API_KEY,
          },
        }
      );
      const data = await response.json();
      if (response.status === 200 && data.discordIDs && data.discordIDs.length > 0) {
        const embed = new Discord.MessageEmbed()
          .setColor("#141879")
          .setTitle("Roblox to Discord Data Fetch")
          .addField("Roblox Username/ID", robloxInput)
          .addField("Discord IDs", data.discordIDs.join(", "));

        message.channel.send(embed);
      } else {
        message.channel.send("No Discord IDs linked with this Roblox account.");
      }
    } catch (error) {
      console.error("An error occurred while fetching Discord IDs:", error);
      message.channel.send(
        "An error occurred while fetching the Discord IDs. Please try again later."
      );
    }
  },
};

async function getUserIdByUsername(username) {
  try {
    const response = await fetch(
      "https://users.roblox.com/v1/usernames/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usernames: [username] }),
      },
    );
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].id;
    }
    return null;
  } catch (error) {
    console.error("An error occurred while fetching user ID:", error);
    return null;
  }
}
