const axios = require("axios");
const { MessageEmbed } = require("discord.js");

const allowedRoles = ["978180744092471316", "958103974815346688"];

module.exports = {
  name: "fetchrank",
  description: "Fetch usernames of users with a specific rank in the CPD group",
  async execute(message, args) {
    const hasAllowedRole = message.member.roles.cache.some((role) =>
      allowedRoles.includes(role.id),
    );
    if (!hasAllowedRole) {
      return message.channel.send(
        "You do not have permission to use this command.",
      );
    }

    const rankNames = [
      "Suspended",
      "Cadet",
      "Police Officer",
      "Senior Officer",
      "Corporal",
      "Sergeant",
      "Staff Sergeant",
      "Lieutenant",
      "Captain",
      "Commander",
      "Deputy Chief",
      "Chief",
      "Mayor",
      "Group Manager",
      "Developer",
      "Group Holder",
    ];

    const rankIds = {
      Suspended: 1,
      Cadet: 2,
      "Police Officer": 3,
      "Senior Officer": 4,
      Corporal: 5,
      Sergeant: 6,
      "Staff Sergeant": 7,
      Lieutenant: 8,
      Captain: 9,
      Commander: 10,
      "Deputy Chief": 11,
      Chief: 12,
      Mayor: 13,
      "Group Manager": 14,
      Developer: 254,
      "Group Holder": 255,
    };

    const requestedRank = args.join(" ");

    const rankId = rankIds[requestedRank];
    if (!rankId) {
      return message.channel.send(
        "Invalid rank name, please write the rank name correctly.",
      );
    }

    const startTime = Date.now();

    let cursor = null;
    let usersWithRank = [];

    try {
      do {
        const response = await axios.get(
          `https://groups.roblox.com/v1/groups/3262237/users`,
          {
            params: { cursor },
          },
        );

        const data = response.data;
        const users = data.data;
        usersWithRank = usersWithRank.concat(
          users.filter((user) => user.role.rank === rankId),
        );

        cursor = data.nextPageCursor;
      } while (cursor);

      const fetchTime = Date.now() - startTime;
      if (usersWithRank.length > 0) {
        const embed = new MessageEmbed()
          .setColor("#141879")
          .setTitle(`List of users holding the rank: "${requestedRank}"`)
          .setFooter(
            `Internal Affairs Bureau | Data Fetched in ${fetchTime}ms | Total Users: ${usersWithRank.length}`,
            "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
          )
          .setThumbnail(
            "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
          );

        const formattedUsernames = usersWithRank
          .map((user, index) => `${index + 1}. ${user.user.username}`)
          .join("\n");
        const chunkedUsernames = splitArray(formattedUsernames.split("\n"), 25);

        chunkedUsernames.forEach((chunk) => {
          embed.addField("\u200B", chunk, true);
        });

        message.channel.send(embed);
      } else {
        message.channel.send(`No users found with rank "${requestedRank}".`);
      }
    } catch (error) {
      console.error(error);
      message.channel.send("An error occurred while fetching the data.");
    }
  },
};

function splitArray(arr, len) {
  const chunks = [];
  let i = 0;
  const n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
}
