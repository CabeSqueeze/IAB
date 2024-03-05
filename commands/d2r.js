const fetch = require("@replit/node-fetch");
const Discord = require("discord.js");

async function fetchUserData(userId) {
  const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
  const data = await response.json();
  return data;
}

module.exports = {
  name: "d2r",
  description: "Converts a Discord ID to a Roblox username and ID.",
  execute: async (message, args) => {
    const discordId = args[0];
    if (!discordId || isNaN(discordId)) {
      return message.channel.send("Please provide a valid Discord ID.");
    }

    try {
      const response = await fetch(
        `https://api.blox.link/v4/public/guilds/699027931355152435/discord-to-roblox/${discordId}`,
        {
          headers: {
            Authorization: process.env.BLOXLINK_API_KEY,
          },
        }
      );
      const data = await response.json();
      if (response.status === 200 && data.robloxID) {
        const userData = await fetchUserData(data.robloxID);
        if (userData) {
          const embed = new Discord.MessageEmbed()
            .setColor("#141879")
            .setTitle("Discord to Roblox Data Fetch")
            .addField("Username", userData.name)
            .addField("User ID", data.robloxID);

          message.channel.send(embed);
        } else {
          message.channel.send("Failed to fetch Roblox username.");
        }
      } else {
        const embed = new Discord.MessageEmbed()
          .setColor("#FF0000")
          .setTitle("Unable to fetch Roblox ID")
          .setDescription("Unable to fetch Roblox due to them either being not verified in this server, or not being part of this server at all.");

        message.channel.send(embed);
      }
    } catch (error) {
      console.error("An error occurred while fetching Roblox ID:", error);
      message.channel.send(
        "An error occurred while fetching the Roblox ID. Please try again later."
      );
    }
  },
};
