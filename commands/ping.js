module.exports = {
    name: "ping",
    description: "Ping command",
    execute(message, args) {
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
  
      message.channel.send("Pinging...").then((sentMessage) => {
        const pingTime = sentMessage.createdTimestamp - message.createdTimestamp;
        sentMessage.edit(
          `**Bot latency: ${pingTime}ms, API latency: ${message.client.ws.ping}ms.**`,
        );
      });
    },
  };
  