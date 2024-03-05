const fetch = require("@replit/node-fetch");
const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
require('dotenv').config();

const apiKey = process.env.BLOXLINK_API_KEY;

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

module.exports = {
  name: "check",
  description: "Fetches information about a Roblox account.",
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

    let userId = args[0];

    if (!userId) {
      // If userId is not provided, fetch the user's Roblox ID using Bloxlink API
      try {
        console.log("Fetching Roblox ID using Bloxlink API...");
        const response = await fetch(
          `https://api.blox.link/v4/public/guilds/699027931355152435/discord-to-roblox/${message.author.id}`,
          {
            headers: {
              Authorization: apiKey,
            },
          }
        );
        const data = await response.json();
        console.log("Bloxlink API response:", data);
        if (data.robloxID) {
          userId = data.robloxID;
        } else {
          return message.channel.send(
            "Unable to find your Roblox ID. Please provide a valid Roblox username or User ID."
          );
        }
      } catch (error) {
        console.error("An error occurred while fetching Roblox ID:", error);
        return message.channel.send(
          "An error occurred while fetching your Roblox ID."
        );
      }
    } else if (isNaN(userId)) {
      userId = await getUserIdByUsername(userId);
    }

    if (!userId) {
      return message.channel.send(
        "Unable to find any player with that username/userid."
      );
    }

    try {
      const userData = await fetchUserData(userId);

      if (!userData) {
        return message.channel.send("Invalid Roblox username or ID.");
      }

      const embed = await createEmbed(userData, userId);

      await message.channel.send(embed);
    } catch (error) {
      console.error("An error occurred:", error);
      return message.channel.send(
        "An error occurred while fetching Roblox user information."
      );
    }
  }
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

async function fetchUserData(userId) {
  const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
  const data = await response.json();
  return data;
}

async function createEmbed(userData, userId) {
  const { name, created } = userData;
  const accountCreatedDate = new Date(created).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let [friendCount, followerCount, followingCount, pastUsernames, userGroups] =
    await Promise.all([
      fetchUserFriends(userId),
      fetchUserFollowers(userId),
      fetchUserFollowings(userId),
      fetchUserPastUsernames(userData.id),
      fetchUserGroups(userId),
    ]);

  const customGroupNames = {
    16604883: "Chicago Bailiffs",
    6209582: "Internal Affairs Bureau",
    14739001: "Detective Bureau",
    6164189: "Major Crimes Division",
  };

  const chicagoGroupDetails = formatGroupDetails(
    userGroups.data,
    customGroupNames,
  );
  const policeRank = getPoliceRank(userGroups.data);

  friendCount =
    friendCount !== undefined && friendCount !== null ? friendCount : "N/A";
  followerCount =
    followerCount !== undefined && followerCount !== null
      ? followerCount
      : "N/A";
  followingCount =
    followingCount !== undefined && followingCount !== null
      ? followingCount
      : "N/A";
  pastUsernames =
    pastUsernames && pastUsernames.length > 0
      ? pastUsernames.join(", ")
      : "N/A";

  const embed = new Discord.MessageEmbed()
    .setColor("#141879")
    .setTitle(`${name}'s Profile Check`)
    .setThumbnail(
      "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
    )
    .setFooter(
      "Internal Affairs Bureau",
      "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
    )
    .addField("Username", name)
    .addField("User ID", userId)
    .addField("Account Created", accountCreatedDate)
    .addField("Friends", friendCount)
    .addField("Followers", followerCount)
    .addField("Following", followingCount)
    .addField("Past Usernames", pastUsernames)
    .addField("Police Rank", policeRank)
    .addField("Police Divisions", " ")
    .addFields(chicagoGroupDetails);

  return embed;
}

function formatGroupDetails(groups, customGroupNames) {
  return groups
    .filter((group) =>
      Object.keys(customGroupNames).includes(group.group.id.toString()),
    )
    .map((group) => ({
      name: customGroupNames[group.group.id],
      rank: group.role.name,
    }))
    .map(({ name, rank }) => ({ name, value: rank, inline: true }));
}

async function fetchUserFriends(userId) {
  const response = await fetch(
    `https://friends.roblox.com/v1/users/${userId}/friends/count`,
  );
  const data = await response.json();
  return data.count || 0;
}

async function fetchUserFollowers(userId) {
  const response = await fetch(
    `https://friends.roblox.com/v1/users/${userId}/followers/count`,
  );
  const data = await response.json();
  return data.count || 0;
}

async function fetchUserFollowings(userId) {
  const response = await fetch(
    `https://friends.roblox.com/v1/users/${userId}/followings/count`,
  );
  const data = await response.json();
  return data.count || 0;
}

async function fetchUserPastUsernames(userId) {
  const response = await fetch(
    `https://users.roblox.com/v1/users/${userId}/username-history?limit=100&sortOrder=Asc`,
  );
  const data = await response.json();
  return data.data.map((usernameData) => usernameData.name) || [];
}

async function fetchUserGroups(userId) {
  const response = await fetch(
    `https://groups.roblox.com/v1/users/${userId}/groups/roles`,
  );
  const data = await response.json();
  return data;
}

function getPoliceRank(groups) {
  const policeGroup = groups.find((group) => group.group.id === 3262237);
  return policeGroup ? policeGroup.role.name : "N/A";
}
