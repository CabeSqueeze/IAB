const fetch = require("@replit/node-fetch");
const Discord = require("discord.js");

module.exports = {
  name: "cheaterfetchgroup",
  description: "Fetch cheaters in a Roblox group using CCR API",
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

    if (!args[0]) {
      return message.channel.send("Please provide a group ID.");
    }

    const groupId = args[0];

    try {
      message.channel.send(
        "Finding cheaters from the given Roblox group, please wait patiently as it can take up to a few minutes due to API limitations...",
      );

      const members = await getGroupMembers(groupId);
      const cheaters = await findCheaters(members);

      if (cheaters.length > 0) {
        for (const cheater of cheaters) {
          const embed = createEmbed(cheater);
          message.channel.send(embed);
        }
      } else {
        message.reply("No cheaters found in the group.");
      }
    } catch (error) {
      console.error(error);
      message.reply("An error occurred while fetching the data.");
    }
  },
};

async function getGroupMembers(groupId) {
  const response = await fetch(
    `https://groups.roblox.com/v1/groups/${groupId}/users?sortOrder=Asc&limit=100`,
  );
  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

async function findCheaters(members) {
  const cheaters = [];

  for (const member of members) {
    const username = member.user.username;
    const userId = member.user.userId;
    const ccrResponse = await fetch(
      `https://ccr.catgang.ru/check.php?uid=${userId}&format=plaintext`,
    );
    const ccrData = await ccrResponse.text();

    if (ccrData) {
      cheaters.push({ username, ccrData });
    }
  }

  return cheaters;
}

function createEmbed(cheater) {
  const { username, ccrData } = cheater;
  const profileUrl = `https://www.roblox.com/users/${username}/profile`;
  const thumbnailUrl =
    "https://images-ext-1.discordapp.net/external/mio-O9MCnJSFG88DdckqQZUBeA7qea4I0mlcqhBPZj8/%3Fsize%3D4096/https/cdn.discordapp.com/icons/699027931355152435/841e58d80222c541379e92b84efdb760.png?format=webp&quality=lossless";

  const embed = new Discord.MessageEmbed()
    .setColor("#00027f")
    .setThumbnail(thumbnailUrl)
    .setTitle("Cheater has been found.")
    .addField("Username", username)
    .addField("Profile", profileUrl)
    .addField("Evidence", `\`\`\`${ccrData}\`\`\``)
    .setFooter(
      "Internal Affairs Bureau",
      "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
    );

  return embed;
}
