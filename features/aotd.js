const request = require('request-promise');
const MongoClient = require('mongodb').MongoClient;
const url = `${process.env.MONGO_URI}`;

const songlinkRequestByTypeAndId = async (inputType, inputId) =>
  request({
    uri: 'https://api.song.link/v1-alpha.1/links',
    method: 'GET',
    qs: {
      userCountry: 'US',
      type: inputType,
      platform: 'spotify',
      id: inputId
    },
    json: true
  })

const songlinkRequestByUrl = async url =>
  request({
    uri: 'https://api.song.link/v1-alpha.1/links',
    method: 'GET',
    qs: {
      url: url
    },
    json: true
  })

const checkIfAlbumInDb = (id) => {
  MongoClient.connect(url, async (err, client) => {
    const db = client.db("aotd");
    db.collection("upcoming").find({ id: id }).toArray().then((result) => {
      if (result.length === 0) return true;
      else return false;

    }).catch((err) => {

      console.error(err);
      return false;
    }).finally(() => db.close());
  });
}

module.exports = (controller) => {
  controller.hears(['musiclink', new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/, 'i')], 'message', async function (bot, message) {
    let songlinkReply;
    if (message.matches[0].includes('spotify') && (message.matches[4].includes('album') || message.matches[4].includes('track'))) {
      let inputArray = message.matches[4].split('/');
      inputArray[2] = inputArray[2].split('?')[0];
      if (inputArray[1] === 'track')
        inputArray[1] = 'song';

      try {
        songlinkReply = await songlinkRequestByTypeAndId(inputArray[1], inputArray[2]);

      } catch (err) {
        songlinkReply = '';
        console.error(err);
      }
    } else if (message.matches[0].includes('play.google.com')) {
      try {
        songlinkReply = await songlinkRequestByUrl(encodeURI(message.matches[0]));
      } catch (err) {
        songlinkReply = '';
        console.error(err);
      }
    }

    if (songlinkReply !== '') {
      const songlinkEntityId = songlinkReply.entityUniqueId;
      await bot.reply(message, {
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `Looks like a great ${songlinkReply.entitiesByUniqueId[songlinkEntityId].type}! *Here's a link that everyone can use to listen:*`
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `\n*Artist:* ${songlinkReply.entitiesByUniqueId[songlinkEntityId].artistName}\n*Album*: ${songlinkReply.entitiesByUniqueId[songlinkEntityId].title}\n*SongLink URL*: ${songlinkReply.pageUrl}`
            },
            "accessory": {
              "type": "image",
              "image_url": songlinkReply.entitiesByUniqueId[songlinkEntityId].thumbnailUrl,
              "alt_text": "alt text for image"
            }
          }
        ]
      });
      if (songlinkReply.entitiesByUniqueId[songlinkEntityId].type === 'album' && !checkIfAlbumInDb(songlinkEntityId)) askWhetherToStoreAlbumInDb()
    }
  });
}
