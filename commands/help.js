module.exports = {
    name: "help",
    description: "Send role-specific commands based on user roles.",
    async execute(message, args) {
      const bureauCommandRole = "978180744092471316";
      const seniorInvestigativeOfficerRole = "958103974815346688";
      const investigativeOfficerRole = "699324305690984559";
  
      const memberRoles = message.member.roles.cache;
  
      let commandMessage = "";
  
      if (memberRoles.has(bureauCommandRole)) {
        commandMessage = `
  \`\`\`
  The following commands are accessible to you as a member of Bureau Command:
  
  .help                                        Displays all bot commands and how to use them.
  .badgeinfo username/userid badgeid           Displays the the date when the badge was earned.
  .ccr username/userid                         Displays cheating history of a user.
  .check username/userid                       Displays the user's profile information.
  .convert username                            Converts a username into Roblox user id.
  .massconvert usernames                       Converts multiple usernames into Roblox user ids.
  .fetchrank rank name                         Fetches the usernames of people holding the specified CPD rank.
  .gamepasses username/userid                  Displays the gamepasses that the user owns.
  .groupinfo groupid                           Displays information about a Roblox group.
  .mafias username/userid                      Displays the mafias that the user is a part of.
  .ping                                        Displays the bot's latency.
  .profile username/userid                     Sends the user's profile link.
  \`\`\``;
      } else if (memberRoles.has(seniorInvestigativeOfficerRole)) {
        commandMessage = `
  \`\`\`
  The following commands are accessible to you as a Senior Investigative Officer:
  
  .help                                        Displays all bot commands and how to use them.
  .badgeinfo username/userid badgeid           Displays the the date when the badge was earned.
  .ccr username/userid                         Displays cheating history of a user.
  .check username/userid                       Displays the user's profile information.
  .fetchrank rank name                         Fetches the usernames of people holding the specified CPD rank.
  .gamepasses username/userid                  Displays the gamepasses that the user owns.
  .groupinfo groupid                           Displays information about a Roblox group.
  .mafias username/userid                      Displays the mafias that the user is a part of.
  .ping                                        Displays the bot's latency.
  .profile username/userid                     Sends the user's profile link.
  \`\`\``;
      } else if (memberRoles.has(investigativeOfficerRole)) {
        commandMessage = `
  \`\`\`
  The following commands are accessible to you as a Investigative Officer:
  
  .help                                        Displays all bot commands and how to use them.
  .badgeinfo username/userid badgeid           Displays the the date when the badge was earned.
  .ccr username/userid                         Displays cheating history of a user.
  .check username/userid                       Displays the user's profile information.
  .gamepasses username/userid                  Displays the gamepasses that the user owns.
  .groupinfo groupid                           Displays information about a Roblox group.
  .ping                                        Displays the bot's latency.
  .profile username/userid                     Sends the user's profile link.
  \`\`\``;
      }
  
      if (commandMessage) {
        await message.channel.send(commandMessage);
      } else {
        await message.channel.send(
          "You do not have permission to use this command.",
        );
      }
    },
  };
  