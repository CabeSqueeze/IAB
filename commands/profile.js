const fetch = require("@replit/node-fetch");

module.exports = {
  name: "profile",
  description: "Retrieve and send the profile link of a Roblox user",
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
      return message.channel.send("Please provide a username.");
    }

    try {
      const username = args[0];

      const directUserId = await getUserIdByUsername(username);

      if (directUserId) {
        const profileUrl = `https://www.roblox.com/users/${directUserId}/profile`;
        message.channel.send(profileUrl);
      } else {
        const response = await fetch(
          `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(
            username,
          )}`,
        );
        const data = await response.json();

        if (response.ok && data.data.length > 0) {
          const userId = data.data[0].id;
          const profileUrl = `https://www.roblox.com/users/${userId}/profile`;
          message.channel.send(profileUrl);
        } else {
          return message.channel.send(
            "Could not find the user with that username.",
          );
        }
      }
    } catch (error) {
      console.error("An error occurred while fetching the data:", error);
      message.channel.send("An error occurred while fetching the data.");
    }
  },
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
