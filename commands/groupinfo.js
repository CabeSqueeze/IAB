const { MessageEmbed } = require("discord.js");
const fetch = require("@replit/node-fetch");

module.exports = {
  name: "groupinfo",
  description: "Fetches information about a Roblox group.",
  async execute(message, args) {
    const allowedRoles = ["978180744092471316", "958103974815346688"];

    const hasAllowedRole = message.member.roles.cache.some((role) =>
      allowedRoles.includes(role.id),
    );
    if (!hasAllowedRole) {
      return message.channel.send(
        "You do not have permission to use this command.",
      );
    }

    if (!args[0]) {
      return message.channel.send("Please provide me a Roblox Group ID.");
    }

    const groupId = args[0];

    try {
      const response = await fetch(
        `https://groups.roblox.com/v1/groups/${groupId}`,
      );
      const data = await response.json();

      if (!data.owner || !data.memberCount) {
        return message.channel.send(
          "Unable to find the Roblox group, provide a valid Group ID.",
        );
      }

      const createdResponse = await fetch(
        `https://groups.roblox.com/v2/groups?groupIds=${groupId}`,
      );
      const createdData = await createdResponse.json();

      const groupData = createdData.data[0];

      const ownerResponse = await fetch(
        `https://users.roblox.com/v1/users/${data.owner.userId}`,
      );
      const ownerData = await ownerResponse.json();

      const groupWantedStatus =
        groupId === "15724292" ? "Terrorist Organization (AOS)" : "N/A";

      const embed = new MessageEmbed()
        .setTitle(`${data.name}'s Information`)
        .setDescription(
          `
          **Group Description:**\n\`\`\`
          ${data.description || "No description available"}\`\`\`
          **Group Owner:**\n${ownerData.name || "Unknown"}

          **Group Creation Date:**\n${formatDate(groupData.created)}

          **Member Count:**\n${data.memberCount.toLocaleString() || "Unknown"}

          **Group Wanted Status:**\n${groupWantedStatus}`,
        )
        .setThumbnail(
          "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
        )
        .setFooter(
          "Internal Affairs Bureau",
          "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
        )
        .setColor("#141879");

      await message.channel.send(embed);
    } catch (error) {
      console.error(error);
      message.channel.send(
        "An error occurred while fetching group information.",
      );
    }
  },
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}
