const fetch = require("@replit/node-fetch");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "ccr",
  description: "Check CCR for a Roblox username or user ID",
  async execute(message, args) {
    const allowedRoles = [
      "978180744092471316",
      "958103974815346688",
      "699324305690984559",
    ];

    const hasAllowedRole = message.member.roles.cache.some((role) =>
      allowedRoles.includes(role.id),
    );
    if (!hasAllowedRole) {
      return message.channel.send(
        "You do not have permission to use this command.",
      );
    }

    if (!args[0]) {
      return message.channel.send("Provide me a Roblox username or User ID.");
    }

    const input = args[0];

    try {
      let userId;
      let username;

      if (isNaN(input)) {
        const response = await fetch(
          `https://users.roblox.com/v1/usernames/users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ usernames: [input] }),
          },
        );

        const data = await response.json();

        if (response.ok && data.data.length > 0) {
          userId = data.data[0].id;
          username = data.data[0].name;
        } else {
          return message.channel.send(
            "Unable to find any player with that username/userid.",
          );
        }
      } else {
        const response = await fetch(
          `https://users.roblox.com/v1/users/${input}`,
        );

        if (response.ok) {
          const data = await response.json();
          userId = data.id;
          username = data.name;
        } else {
          return message.channel.send("Could not find the user with that ID.");
        }
      }

      const ccrResponse = await fetch(
        `https://ccr.catgang.ru/check.php?uid=${userId}&format=plaintext`,
      );
      const ccrData = await ccrResponse.text();

      if (ccrResponse.ok) {
        const ccrOutput = ccrData
          ? ccrData
          : `No results were found for ${username}.`;
        const embeds = createEmbeds(username, ccrOutput, userId);

        for (let i = 0; i < embeds.length; i++) {
          const embed = embeds[i];
          embed.setFooter(
            `Internal Affairs Bureau - Result ${i + 1}/${embeds.length}`,
            "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
          );
          message.channel.send({ embed });
        }
      } else {
        throw new Error(`Error fetching CCR data: ${ccrResponse.statusText}`);
      }
    } catch (error) {
      console.error(error);
      message.channel.send("An error occurred while fetching the data.");
    }
  },
};

function createEmbeds(username, ccrOutput, userId) {
  const maxEmbedLength = 4096;
  const codeBlockStart = "```";
  const codeBlockEnd = "```";

  const embeds = [];
  let remainingOutput = ccrOutput;

  while (remainingOutput.length > 0) {
    const chunk = remainingOutput.substring(0, maxEmbedLength);
    remainingOutput = remainingOutput.substring(maxEmbedLength);

    const embed = new MessageEmbed()
      .setTitle(`${username}'s Clan Cheater Registry Results`)
      .setColor("#141879")
      .setThumbnail(
        "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
      );

    if (remainingOutput.length > 0) {
      const content = `${codeBlockStart}${chunk}${codeBlockEnd}`;
      embed.setDescription(`\n\n${content}`);
    } else {
      const content = `${codeBlockStart}${chunk}${codeBlockEnd}`;
      embed.setDescription(`\n\n${content}`);
    }

    embeds.push(embed);
  }

  return embeds;
}
