module.exports = function(controller) {
  let channels;
  const channelLoader = async bot => {
    bot.api.conversations.list({}, (err, response) => {
      channels = response.channels;
    });
  };

  controller.hears('!say', 'direct_message', async (bot, message) => {
    if (channels === undefined) {
      console.log('channels undefined');
      await channelLoader(bot);
    } else if (channels === null) {
      console.log('channnels null');
    }
    if (message.user === 'U1CRB864E') {
      let [inputChannel, ...rest] = message.text.split(' ').splice(1),
        text = rest.join(' '),
        sayChannel;
      console.log(channels.length, typeof channels);

      for (const channel of channels) {
        if (channel.name.toUpperCase() === inputChannel.toUpperCase()) {
          sayChannel = channel;
          console.log(
            `I found a channel called ${channel.name}, its id is ${channel.id}`
          );
          break;
        }
      }
      if (!!sayChannel) {
        await bot.say({
          text,
          channel: sayChannel.id
        });
      } else {
        await bot.reply(
          message,
          `channel not found!`
        );
      }
    }
  });
};

