const fs = require('fs-jetpack');
const path = require('path');
const JSZip = require('jszip');
const captureElement = require('./capture-element-visual-representation');

const MAGIC_NUMBER = 26;

const configurationFilename = 'template.json';
const currentDir = process.cwd();

function getFile (fileSource, type = 'utf8') {
  if (fs.exists(fileSource) === 'file') {
    try {
      const file = fs.read(fileSource, type);
      return file;
    } catch (e) {
      throw e;
    }
  } else {
    throw Error('No file found.');
  }
}

function getBuilDir (configuration) {
  const { output } = configuration;
  const { dir } = output;

  return dir;
}

let cycle = 1;

function takePicturesOfBlocks (blocks) {
  const callStack = [];

  for (let i = 0; i < blocks.length; i++) {
    const { items } = blocks[i];

    for (let j = 0; j < items.length; j++) {
      const item = items[j];

      callStack.push({
        fileName: item.thumbnail,
        id: item.id,
        query: item.query
      });
    }
  }

  captureElement(callStack);
}

function main () {
  const configurationFilePath = path.join(currentDir, configurationFilename);
  const configurationFile = getFile(configurationFilePath, 'json');
  const buildDir = path.join(currentDir, getBuilDir(configurationFile));
  const packageFilePath = path.join(buildDir, 'arkio.builify.js');
  const packageFile = getFile(packageFilePath);

  const base64Data = packageFile.slice(0, -1).substring(MAGIC_NUMBER);

  JSZip.loadAsync(base64Data, {
    base64: true
  }).then(function (zip) {
    const manifestFile = zip.file('manifest.json').async('string').then(function success (content) {
      const manifestObject = JSON.parse(content);
      const blocks = manifestObject.blocks;
      
      takePicturesOfBlocks(blocks);
    });
  });
}

module.exports = main;

/*
    // Take picture
    if (takePictures) {
      const query = `.${block.attr('class').split(' ').join('.')}`;
      const fileName = `builder/thumbnails/${blockHash}.jpeg`;

      callStack.push({
        fileName,
        query,
        id: blockID
      });
    }

*/