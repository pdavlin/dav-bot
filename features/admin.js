module.exports = function (controller) {
  let channels;
  const channelLoader = async bot => {
    console.log('Attempting to load channels...');
    await bot.api.conversations.list({}, (err, response) => {
      channels = response.channels;
    });
  };

  controller.hears('!say', 'direct_message', async (bot, message) => {
    if (channels === undefined) {
      console.log('channels undefined');
      await bot.reply(
        message,
        `I'm trying to load the channel list.`
      );
      await channelLoader(bot);
    } else if (channels === null) {
      console.log('channnels null');
    }
    if (message.user === 'U1CRB864E') {
      let [inputChannel, ...rest] = message.text.split(' ').splice(1),
        text = rest.join(' '),
        channelId;
      if (inputChannel.startsWith('<')) {
        channelId = inputChannel.substring(
          inputChannel.lastIndexOf("#") + 1,
          inputChannel.lastIndexOf("|")
        );
      }
      if (channels !== undefined && channelId === undefined) {
        for (const channel of channels) {
          if (channel.name.toUpperCase() === inputChannel.toUpperCase()) {
            console.log(
              `I found a channel called ${channel.name}, its id is ${channel.id}`
            );
            channelId = channel.id;
            break;
          }
        }
      }
      if (!!channelId) {
        await bot.say({
          text,
          channel: channelId
        });
      } else {
        await bot.reply(
          message,
          `I can't find that channel. Have you tried not being a lunkhead?`
        );
      }
    } else {
      await bot.reply(
        message,
        `Don't tell me what to do, I'm not your lackey`
      );
    }
  });
};

