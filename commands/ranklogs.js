const { Client, MessageEmbed } = require('discord.js');
const fetch = require('@replit/node-fetch');
const fs = require('fs');

const groupData = [
  {
    groupId: 6209582,
    channelId: '1214021657023225898', // Replace with your channel ID
    groupName: 'Internal Affairs Bureau',
  },
  {
    groupId: 3262237,
    channelId: '1214021657023225898', // Replace with your channel ID
    groupName: 'Chicago Police Department',
  },
  {
    groupId: 16604883,
    channelId: '1214021657023225898', // Replace with your channel ID
    groupName: 'Chicago Bailiffs',
  },
  {
    groupId: 14739001,
    channelId: '1214021657023225898', // Replace with your channel ID
    groupName: 'Detective Bureau',
  },
  {
    groupId: 6164189,
    channelId: '1214021657023225898', // Replace with your channel ID
    groupName: 'Majors Crime Division',
  },
  // Add more group data objects as needed
];

const client = new Client();
const interval = 30000; // Interval in milliseconds

client.once('ready', () => {
  console.log('Bot is ready');
  setInterval(() => {
    processData(groupData);
  }, interval);
});

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function processData(groupData) {
  const previousData = loadData();

  groupData.forEach(({ groupId, channelId, groupName }) => {
    fetchGroupData(groupId)
      .then((currentData) => {
        const previousMembers = previousData[groupId] || [];

        const newMembers = currentData.filter((member) => !previousMembers.find((prevMember) => prevMember.userId === member.userId));
        const leftMembers = previousMembers.filter((member) => !currentData.find((currMember) => currMember.userId === member.userId));

        newMembers.forEach((member) => {
          const messageData = {
            title: `A member has joined ${groupName}!`,
            color: 588836,
            author: {
              name: 'Join',
              icon_url: 'https://cdn.discordapp.com/attachments/1009097032872493147/1214256231179358208/JOIN.png?ex=65f8733d&is=65e5fe3d&hm=24e75fb6099cd4e5c7af2c32a73260f5ca9ac9ccbf595f5c9133c402b109230e&',
            },
            fields: [
              { name: 'Username', value: member.username },
              { name: 'New Rank', value: member.role.name },
            ],
            footer: {
              text: `${groupName} Rank logs • ${getCurrentTimestamp()}`,
            },
          };
          sendMessage(channelId, messageData);
        });

        leftMembers.forEach((member) => {
          const messageData = {
            title: `A member has left ${groupName}!`,
            color: 16712708,
            author: {
              name: 'Left',
              icon_url: 'https://cdn.discordapp.com/attachments/1009097032872493147/1214256250716426291/Left.png?ex=65f87341&is=65e5fe41&hm=aa03f4bb1364792724ab56867fbc6ea778f200c7d30b707c956825d70cbf299e&',
            },
            fields: [
              { name: 'Username', value: member.username },
              { name: 'Old Rank', value: member.role.name },
            ],
            footer: {
              text: `${groupName} Rank logs • ${getCurrentTimestamp()}`,
            },
          };
          sendMessage(channelId, messageData);
        });

        currentData.forEach((member) => {
          const previousMember = previousMembers.find((prevMember) => prevMember.userId === member.userId);

          if (previousMember && previousMember.role.rank !== member.role.rank) {
            let messageData;

            if (previousMember.role.rank > member.role.rank) {
              messageData = {
                title: `A member has been demoted in ${groupName}!`,
                color: 11683328,
                author: {
                  name: 'Demotion',
                  icon_url: 'https://cdn.discordapp.com/attachments/1009097032872493147/1214419424010833950/bl_1.png?ex=65f90b39&is=65e69639&hm=5bb03318ced757c9eed0d1f55fa0992534ca8773d50c8d30d760a939858721a4&',
                },
                fields: [
                  { name: 'Username', value: member.username },
                  { name: 'New Rank', value: member.role.name },
                  { name: 'Old Rank', value: previousMember.role.name },
                ],
                footer: {
                  text: `${groupName} Rank logs • ${getCurrentTimestamp()}`,
                },
              };
            } else {
              messageData = {
                title: `A member has been promoted in ${groupName}!`,
                color: 10289407,
                author: {
                  name: 'Promotion',
                  icon_url: 'https://cdn.discordapp.com/attachments/1009097032872493147/1214419424904355870/bl_2.png?ex=65f90b39&is=65e69639&hm=9bb58e9488bb75710d9feec2a9bc1c8118aebb37737e06d9eed460930f7e8daf&',
                },
                fields: [
                  { name: 'Username', value: member.username },
                  { name: 'New Rank', value: member.role.name },
                  { name: 'Old Rank', value: previousMember.role.name },
                ],
                footer: {
                  text: `${groupName} Rank logs • ${getCurrentTimestamp()}`,
                },
              };
            }

            sendMessage(channelId, messageData);
          }
        });

        previousData[groupId] = currentData;
        saveData(previousData);

      })
      .catch((error) => {
        console.error('Failed to fetch group data:', error);
      });
  });
}

function loadData() {
  try {
    const data = fs.readFileSync('previousData.json', 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('previousData.json not found, creating new file...');
      saveData({});
      return {};
    } else {
      console.error('Failed to load data from file:', error);
      return {};
    }
  }
}

function saveData(data) {
  fs.writeFile('previousData.json', JSON.stringify(data), (err) => {
    if (err) {
      console.error('Failed to save data to file:', err);
    } else {
      console.log('Data saved to file');
    }
  });
}

function sendMessage(channelId, messageData) {
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error(`Channel with ID ${channelId} not found`);
    return;
  }

  const { title, color, author, fields, footer } = messageData;

  const embed = new MessageEmbed()
    .setTitle(title)
    .setColor(color)
    .setAuthor(author.name, author.icon_url)
    .addFields(fields)
    .setFooter(footer.text);

  console.log('Sending embed:', embed);

  channel.send(embed)
    .then(() => {
      console.log(`Embed sent to channel: ${channelId}`);
    })
    .catch((error) => {
      console.error(`Failed to send embed to channel ${channelId}:`, error);
    });
}

function fetchGroupData(groupId) {
  return fetch(`https://groups.roblox.com/v1/groups/${groupId}/users?sortOrder=Asc&limit=100`)
    .then((response) => response.json())
    .then((data) => {
      if (data.data) {
        return data.data.map((member) => {
          return {
            userId: member.user.userId,
            username: member.user.username,
            role: {
              name: member.role.name,
              rank: member.role.rank,
            },
          };
        });
      } else {
        throw new Error('Failed to fetch group data');
      }
    });
}

client.login(process.env.DISCORD_TOKEN);
