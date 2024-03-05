const fetch = require("@replit/node-fetch");
const { MessageEmbed } = require("discord.js");

const allowedRoles = ["978180744092471316"];

module.exports = {
  name: "convert",
  description: "Get the user ID of a Roblox username",
  async execute(message, args) {
    const memberRoles = message.member.roles.cache.map((role) => role.id);
    const hasPermission = memberRoles.some((role) =>
      allowedRoles.includes(role),
    );

    if (!hasPermission) {
      return message.channel.send(
        "You do not have permission to use this command.",
      );
    }

    if (!args[0]) {
      return message.channel.send("Please provide a Roblox username.");
    }

    const username = args[0];
    const startTime = Date.now();

    try {
      const response = await fetch(
        `https://users.roblox.com/v1/usernames/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usernames: [username] }),
        },
      );

      const data = await response.json();

      const fetchTime = Date.now() - startTime;
      if (response.ok && data.data.length > 0) {
        const userId = data.data[0].id;

        const embed = new MessageEmbed()
          .setColor("#141879")
          .setTitle(`User ID was fetched for ${username}`)
          .setDescription(`\`\`\`${userId}\`\`\``)
          .setThumbnail(
            "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
          )
          .setFooter(
            `Internal Affairs Bureau | Data Fetched in ${fetchTime}ms`,
            "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
          );

        message.channel.send(embed);
      } else {
        message.channel.send("Could not find the user ID for that username.");
      }
    } catch (error) {
      console.error(error);
      message.channel.send("An error occurred while fetching the data.");
    }
  },
};
