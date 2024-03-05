const fetch = require("@replit/node-fetch");

module.exports = {
  name: "badgeinfo",
  description: "Get information about a specific badge for a user",
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

    const commandUsage =
      "Provide me a Roblox username/User ID along with a Badge ID.";

    if (args.length !== 2) {
      return message.channel.send(commandUsage);
    }

    const [target, badgeId] = args;

    let userId = "";
    if (!isNaN(target)) {
      userId = target;
    } else {
      try {
        const userResponse = await fetch(
          `https://users.roblox.com/v1/usernames/users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ usernames: [target] }),
          },
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.data.length > 0) {
            userId = userData.data[0].id;
          } else {
            return message.channel.send("User is invalid or does not exist.");
          }
        } else {
          throw new Error("Unexpected error");
        }
      } catch (error) {
        console.error(error);
        return message.channel.send(
          "An error occurred while fetching the user data.",
        );
      }
    }

    try {
      const response = await fetch(
        `https://badges.roblox.com/v1/users/${userId}/badges/awarded-dates?badgeIds=${badgeId}`,
        {
          headers: {
            accept: "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (data.data.length > 0) {
          const awardedDate = data.data[0].awardedDate;
          const dateObject = new Date(awardedDate);
          const formattedDate = dateObject.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          message.channel.send(
            `The Badge ID ${badgeId} was awarded to the user on ${formattedDate}.`,
          );
        } else {
          message.channel.send(
            `The Badge ID ${badgeId} was not awarded to the user.`,
          );
        }
      } else if (response.status === 400) {
        message.channel.send(
          "Too many badge IDs. Please provide only one badge ID.",
        );
      } else if (response.status === 404) {
        message.channel.send("User is invalid or does not exist.");
      } else {
        throw new Error("Unexpected error");
      }
    } catch (error) {
      console.error(error);
      message.channel.send("An error occurred while fetching the data.");
    }
  },
};
