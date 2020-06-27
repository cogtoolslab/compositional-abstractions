var config = require('./display_config.js');

// This file contains helper functions for computing the error between 
// the target and the structure built by the participant.

function extractBitmap(sketch, imsize) {

  // rescale image to be close to 64x64
  var scaleFactor = imsize / sketch.width;
  var rescaled = resize(sketch, scaleFactor);
  var imgData = rescaled.getContext('2d').getImageData(0, 0, imsize, imsize);

  // now go through and get all filled in pixels in R channel
  var pixels = imgData.data;
  const binaryImage = new Uint8Array(imsize * imsize);
  // getImageData is RGBA, and you
  // want to start with blue channel, so the 2nd index
  for (var i = 2, n = pixels.length; i < n; i += 4) {
    const point = pixels[i];
    const ind = Math.floor(i / 4);
    const thresh = 200;
    // voxels darker than thresh in blue channel set to 1 (filled in)
    // voxels brighter than thresh in blue channel probably still blank (empty)
    binaryImage[ind] = point < thresh ? 1 : 0;
  }
  return binaryImage;
}

var resize = function (img, scale) {
  // Takes an image and a scaling factor and returns the scaled image

  // The original image is drawn into an offscreen canvas of the same size
  // and copied, pixel by pixel into another offscreen canvas with the
  // new size.

  var widthScaled = img.width * scale;
  var heightScaled = img.height * scale;

  var orig = document.createElement('canvas');
  orig.width = img.width;
  orig.height = img.height;
  var origCtx = orig.getContext('2d');
  origCtx.drawImage(img, 0, 0);
  var origPixels = origCtx.getImageData(0, 0, img.width, img.height);

  var scaled = document.createElement('canvas');
  scaled.width = widthScaled;
  scaled.height = heightScaled;
  var scaledCtx = scaled.getContext('2d');
  var scaledPixels = scaledCtx.getImageData(0, 0, widthScaled, heightScaled);

  for (var y = 0; y < heightScaled; y++) {
    for (var x = 0; x < widthScaled; x++) {
      var index = (Math.floor(y / scale) * img.width + Math.floor(x / scale)) * 4;
      var indexScaled = (y * widthScaled + x) * 4;
      scaledPixels.data[indexScaled] = origPixels.data[index];
      scaledPixels.data[indexScaled + 1] = origPixels.data[index + 1];
      scaledPixels.data[indexScaled + 2] = origPixels.data[index + 2];
      scaledPixels.data[indexScaled + 3] = origPixels.data[index + 3];
    }
  }
  scaledCtx.putImageData(scaledPixels, 0, 0);
  return scaled;
}

function printWorld(image, rowLim, colLim, imsize) {
  // Print the image
  for (let row = 0; row < rowLim; row++) {
    let str = '';
    for (let col = 0; col < colLim; col++) {
      str += image[row * imsize + col] === 1 ? 'x' : ' ';
    }
    console.log(`${(row + '').padStart(3, '0')} ${str}`);
  }
}

function subsetWorld(image, rowLim, colLim, imsize) {
  // get subset of image
  let subset = [];
  for (let row = 0; row < rowLim; row++) {
    for (let col = 0; col < colLim; col++) {
      subset.push(image[row * imsize + col]);
    }
  }
  return subset;
}

function getPixelSum(im) {
  return math.sum(Array.from(im))
}

function getPrecision(im1, im2) {
  // im1 is the target image
  // im2 is the reconstruction
  arr1 = Array.from(im1);
  arr2 = Array.from(im2);
  prod = math.dotMultiply(arr1, arr2);
  fp = math.subtract(arr2, prod); // false positives = reconstruction minus matches
  numerator = math.sum(prod);
  denominator = math.sum(numerator, math.sum(fp));
  score_to_be_returned = math.divide(numerator, denominator);
  return score_to_be_returned;
}

function getRecall(im1, im2) {
  // im1 is the target image
  // im2 is the reconstruction  
  arr1 = Array.from(im1);
  arr2 = Array.from(im2);
  prod = math.dotMultiply(arr1, arr2);
  fn = math.subtract(arr1, prod); // false negatives = all target pixels minus matches
  numerator = math.sum(prod);
  denominator = math.sum(math.sum(prod), math.sum(fn));
  score_to_be_returned = math.divide(numerator, denominator);
  return score_to_be_returned;
}

function F1Score(im1, im2) {
  // im1 is the target image
  // im2 is the reconstruction  
  // see: https://en.wikipedia.org/wiki/F1_score
  // f1 = 2 * (precision * recall) / (precision + recall)
  recall = getRecall(im1, im2);
  precision = getPrecision(im1, im2);
  numerator = math.multiply(precision, recall);
  denominator = math.sum(precision, recall);
  quotient = math.divide(numerator, denominator);
  //console.log('recall = ', recall);
  //console.log('precision = ', precision);
  // console.log('quotient = ', quotient);  
  score_to_be_returned = denominator == 0 ? 0 : math.multiply(2, quotient);

  return score_to_be_returned
}

function getScore(canvas0, canvas1, agprop, imsize) {
  // canvas0 is ID of canvas element 0, e.g., 'defaultCanvas0'
  // canvas1 is ID of canvas element 1, e.g., 'defaultCanvas1'
  // agprop is proportion of canvas height that is above the floor, 'above ground prop'
  // imsize is size of rescaled canvas, e.g., 64

  target = document.getElementById(canvas0);
  targ = extractBitmap(target, imsize);
  //printWorld(targ, 47, imsize, imsize);
  targs = subsetWorld(targ, 47, imsize, imsize);

  reconstruction = document.getElementById(canvas1);
  recon = extractBitmap(reconstruction, imsize);
  //printWorld(recon, 47, imsize, imsize);
  recons = subsetWorld(recon, 47, imsize, imsize);

  t = Array.from(targs);
  r = Array.from(recons);

  score_to_be_returned = F1Score(t, r);
  return score_to_be_returned;

}


/** Discrete Scores
 * Compute stimulus map from blockList
 * Implement F1 score based on two discrete world maps
 */

function getDiscreteWorld(blockList) {

  var targetDiscrete = new Array(config.discreteEnvWidth);
  for (let i = 0; i < config.discreteEnvWidth; i++) {
    targetDiscrete[i] = new Array(config.discreteEnvHeight).fill(false); // true represents free (NOT BLOCK PRESENT)
  }

  Array.prototype.forEach.call(blockList, block => { // not a Block object
    // add block to map
    var width = block.width;
    var height = block.height;
    var blockLeft = block.x;
    var blockBottom = block.y;
    var blockTop = blockBottom + height;
    var blockRight = blockLeft + width;

    // console.log('block', block);
    // console.log('width', width);
    // console.log('height', height);
    // console.log('blockLeft', blockLeft);
    // console.log('blockBottom', blockBottom);

    for (let y = blockBottom; y < blockTop; y++) {
      for (let x = blockLeft; x < blockRight; x++) {
        targetDiscrete[x][y] = true;
      }
    };
      
  });

  // console.log(targetDiscrete);

  return (targetDiscrete);
}

function printTwoDiscreteMaps(target, built) {
  // input: two bitmaps- target and built structure
  // output: score

  console.log(target);
  console.log(built)

  console.log(F1Score(target,built));

}

function getScoreDiscrete(target, built) {
  // input: two bitmaps- target and built structure
  // output: score

  // console.log('target', target);
  // console.log('built', built);

  return parseInt(F1Score(target, built)*100);

}

module.exports = {
  getDiscreteWorld,
  getScoreDiscrete
};

