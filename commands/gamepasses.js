const fetch = require("@replit/node-fetch");
const Discord = require("discord.js");

const gamepasses = {
  "Luxury-Vehicle-License": { id: 7011219, category: "Miscellaneous" },
  "Silver-AK-47": { id: 7011225, category: "Weapons" },
  "Double XP": { id: 7011255, category: "Miscellaneous" },
  "Double income": { id: 7011257, category: "Miscellaneous" },
  "Triple XP": { id: 7011258, category: "Miscellaneous" },
  "Triple Income": { id: 7011259, category: "Miscellaneous" },
  "Light body Armor": { id: 7011261, category: "Armor" },
  "Medium body Armor": { id: 7011262, category: "Armor" },
  "Heavy Body Armor": { id: 7011264, category: "Armor" },
  "Checkings account": { id: 8461757, category: "Miscellaneous" },
  "Golden Tommy": { id: 8764607, category: "Weapons" },
  "Crosshair Customization": { id: 12955526, category: "Miscellaneous" },
  Dadao: { id: 40485006, category: "Weapons" },
  Kar98k: { id: 182612470, category: "Weapons" },
  "Advanced Vehicle Customization": {
    id: 175841627,
    category: "Miscellaneous",
  },
};

const allowedRoles = [
  "978180744092471316",
  "958103974815346688",
  "699324305690984559",
];

module.exports = {
  name: "gamepasses",
  description: "Check gamepasses owned by a user.",
  async execute(message, args) {
    const hasPermission = message.member.roles.cache.some((role) =>
      allowedRoles.includes(role.id),
    );
    if (!hasPermission) {
      return message.channel.send(
        "You do not have permission to use this command.",
      );
    }

    const input = args[0];
    const isUserID = /^\d+$/.test(input);
    let userID;

    if (isUserID) {
      userID = input;
    } else {
      const fetchedUserID = await getUserIdByUsername(input);
      if (fetchedUserID) {
        userID = fetchedUserID;
      } else {
        message.channel.send("Invalid user ID or username provided.");
        return;
      }
    }

    const categories = {};

    for (const gamepass in gamepasses) {
      const gamepassData = gamepasses[gamepass];
      const gamepassId = gamepassData.id;
      const category = gamepassData.category;
      const url = `https://inventory.roblox.com/v1/users/${userID}/items/GamePass/${gamepassId}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        const owned = data && data.data && data.data.length > 0;
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({ name: gamepass, owned });
      } catch (error) {
        console.log(
          `An error occurred while retrieving gamepass data for ${gamepass}:`,
          error,
        );
        return;
      }
    }

    const name = isUserID ? "User" : args[0];
    const embed = new Discord.MessageEmbed()
      .setTitle(`${name}'s Gamepasses`)
      .setColor("#141879")
      .setThumbnail(
        "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
      )
      .setFooter(
        "Internal Affairs Bureau",
        "https://tr.rbxcdn.com/b539947b52b50ae13176e7c1a4961645/150/150/Image/Png",
      );

    for (const category in categories) {
      const categoryContent = categories[category]
        .map((gamepass) => `${gamepass.name}: ${gamepass.owned ? "✅" : "❌"}`)
        .join("\n");
      embed.addField(category, categoryContent);
    }

    message.channel.send(embed);
  },
};

async function getUserIdByUsername(username) {
  const url = "https://users.roblox.com/v1/usernames/users";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernames: [username],
      }),
    });

    const data = await response.json();

    if (data && data.data && data.data.length > 0) {
      return data.data[0].id;
    }
  } catch (error) {
    console.log(
      `An error occurred while retrieving user ID for ${username}:`,
      error,
    );
  }

  return null;
}
