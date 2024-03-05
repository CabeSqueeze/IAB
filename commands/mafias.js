const fetch = require("@replit/node-fetch");
const Discord = require("discord.js");

module.exports = {
  name: "mafias",
  description:
    "Display group names and user roles allied to Group ID 3246817 for a user.",
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
    let userId;
    let username;

    if (/^\d+$/.test(args[0])) {
      userId = args[0];
    } else {
      username = args[0];
    }

    if (!userId && !username) {
      return message.channel.send(
        "Please provide a valid user ID or username.",
      );
    }

    try {
      if (username) {
        const userSearchUrl = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(
          username,
        )}`;
        const userResponse = await fetch(userSearchUrl);
        const userData = await userResponse.json();

        if (userData.data && userData.data.length > 0) {
          userId = userData.data[0].id;
        } else {
          return message.channel.send("User not found.");
        }
      }

      const groupId = "3246817";
      const maxRows = 100;
      let startRowIndex = 0;
      let allAllies = [];

      while (true) {
        const apiUrl = `https://groups.roblox.com/v1/groups/${groupId}/relationships/allies?startRowIndex=${startRowIndex}&maxRows=${maxRows}`;
        const alliesResponse = await fetch(apiUrl);
        const alliesData = await alliesResponse.json();

        if (alliesData.relatedGroups && alliesData.relatedGroups.length > 0) {
          allAllies = allAllies.concat(alliesData.relatedGroups);
        }

        if (alliesData.relatedGroups.length === maxRows) {
          startRowIndex += maxRows;
        } else {
          break;
        }
      }

      const excludedGroups = [
        6209582, 6164189, 14739001, 16604883, 3262237, 6421026, 16765511,
        6114383, 6176092, 10914335,
      ];
      const filteredAllies = allAllies.filter(
        (ally) => !excludedGroups.includes(ally.id),
      );

      const groupsUrl = `https://groups.roblox.com/v1/users/${userId}/groups/roles`;
      const groupsResponse = await fetch(groupsUrl);
      const groupsData = await groupsResponse.json();

      if (groupsData.data && groupsData.data.length > 0) {
        const groupNamesAndRoles = [];

        groupsData.data.forEach((group) => {
          if (filteredAllies.some((ally) => ally.id === group.group.id)) {
            groupNamesAndRoles.push({
              name: group.group.name,
              role: group.role.name,
              link: `https://www.roblox.com/groups/${group.group.id}`,
            });
          }
        });

        if (groupNamesAndRoles.length > 0) {
          const embed = new Discord.MessageEmbed()
            .setColor("#141879")
            .setThumbnail(
              "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
            )
            .setFooter(
              "Internal Affairs Bureau",
              "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
            );

          const description = groupNamesAndRoles
            .map((group) => `[${group.name}](${group.link}) - ${group.role}`)
            .join("\n");
          embed.setDescription(description);
          if (username) {
            embed.setTitle(`${username}'s Mafia Affiliations`);
          }
          message.channel.send(embed);
        } else {
          message.channel.send(
            "The user is not a member of any groups allied to Chicago 1949.",
          );
        }
      } else {
        message.channel.send("The user is not a member of any groups.");
      }
    } catch (error) {
      console.error(error);
      message.channel.send("An error occurred while fetching data.");
      return;
    }
  },
};
