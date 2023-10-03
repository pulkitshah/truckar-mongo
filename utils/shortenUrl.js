const validUrl = require('valid-url');
const shortid = require('shortid');
const Url = require('../models/Url');

const getShortenedUrl = async (longUrl, baseUrl) => {
  if (!validUrl.isUri(baseUrl)) {
    return 'Invalid base URL';
  }

  const urlCode = shortid.generate();

  try {
    let url = await Url.findOne({
      longUrl,
    });

    if (url) {
      return url;
    } else {
      // join the generated short code the the base url
      const shortUrl = baseUrl + '/c/' + urlCode;

      // invoking the Url model and saving to the DB
      url = new Url({
        longUrl,
        shortUrl,
        urlCode,
        date: new Date(),
      });
      await url.save();
      return url;
    }
  } catch (err) {
    // exception handler
    console.log(err);
    return 'Server Error';
  }
};
module.exports = getShortenedUrl;
