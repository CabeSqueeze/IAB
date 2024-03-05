const fetch = require("@replit/node-fetch");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "massconvert",
  description: "Convert usernames into user IDs",
  async execute(message, args) {
    const allowedRoles = ["978180744092471316"];

    const hasAllowedRole = message.member.roles.cache.some((role) =>
      allowedRoles.includes(role.id),
    );

    if (!hasAllowedRole) {
      return message.channel.send(
        "You do not have permission to use this command.",
      );
    }

    if (args.length === 0) {
      return message.channel.send(
        "Please provide a list of usernames to convert.",
      );
    }

    const usernames = args.join(" ").split(/,\s*|\s+/);
    const totalUsernames = usernames.length;

    const startTime = Date.now();

    try {
      const response = await fetch(
        `https://users.roblox.com/v1/usernames/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usernames }),
        },
      );

      const data = await response.json();

      console.log("Data from Roblox API:", data);

      const fetchTime = Date.now() - startTime;

      if (response.ok && data.data.length > 0) {
        const userIds = data.data.map((user) => user.id);
        const formattedIDs = userIds.join(", ");

        const embed = new MessageEmbed()
          .setColor("#141879")
          .setTitle("Usernames were mass converted to User IDs:")
          .setThumbnail(
            "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
          )
          .setDescription(`\`\`\`${formattedIDs}\`\`\``)
          .setFooter(
            "Internal Affairs Bureau",
            "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
          );

        const convertedCount = userIds.length;
        const leftCount = totalUsernames - convertedCount;

        if (leftCount > 0) {
          const leftUsernames = usernames.slice(convertedCount);
          embed.addField(
            "Usernames for the following accounts were not found:",
            `\`\`\`${leftUsernames.join(", ")}\`\`\``,
          );
        }

        message.channel.send(embed);
      } else {
        message.channel.send(
          "None of the provided usernames could be converted to user IDs.",
        );
      }
    } catch (error) {
      console.error(error);
      message.channel.send("An error occurred while fetching the data.");
    }
  },
};
