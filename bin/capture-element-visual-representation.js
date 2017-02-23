const _ = require('lodash');
const webshot = require('webshot');
const Jimp = require('jimp');
const Log = require('./log');

const webshotConfiguration = {
  host: 'http://localhost:3000/',
  windowSize: {
    width: 1920,
    height: 1080
  },
  renderDelay: 1000
};

function takeDaShot (blocksList) {
  if (!blocksList) {
    return;
  }

  const stack = blocksList;

  if (stack.length > 0) {
    const len = stack.length - 1;
    const item = stack[len];

    Log(Log.PICTURE, `query: "${item.query}"; fileName: "${item.fileName}; id: "${item.id}`);

    webshot(webshotConfiguration.host, item.fileName, {
      siteType: 'url',
      windowSize: webshotConfiguration.windowSize,
      captureSelector: item.query,
      renderDelay: webshotConfiguration.renderDelay,
      shotSize: {
        width: 'window',
        height: 'window'
      }
    }, (error) => {
      if (error) {
        throw error;
      }

      Jimp.read(item.fileName).then((image) => {
        image
          .scale(0.5)
          .write(item.fileName);

        Log(Log.PICTURE, `Succesfully took picture of "${item.id}".`);

        stack.pop();
        takeDaShot(stack);
      }).catch((err) => {
          console.error(err);
      });
    });
  } else {
    Log(Log.INFO, 'PICTURES DONE');
  }
}

function captureElementVisualRepresentation (elementsToCapture) {
  if (!elementsToCapture || !_.isArray(elementsToCapture)) {
    return;
  }

  takeDaShot(elementsToCapture);
}

module.exports = captureElementVisualRepresentation;
