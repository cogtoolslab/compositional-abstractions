// This file contains helper functions for computing the error between 
// the target and the structure built by the participant.

function extractBitmap(sketch,imsize) {

  // rescale image to be close to 64x64
  var scaleFactor = imsize/sketch.width;
  var rescaled = resize(sketch, scaleFactor);
  var imgData = rescaled.getContext('2d').getImageData(0, 0, imsize, imsize);

  // now go through and get all filled in pixels in R channel
  var pixels  = imgData.data;
  const binaryImage = new Uint8Array(imsize * imsize);
  // getImageData is RGBA, and you
  // want to start with blue channel, so the 2nd index
  for (var i = 2, n = pixels.length; i < n; i += 4) {
    const point = pixels[i];
    const ind = Math.floor(i/4);
    const thresh = 200;
    // voxels darker than thresh in blue channel set to 1 (filled in)
    // voxels brighter than thresh in blue channel probably still blank (empty)
    binaryImage[ind] = point < thresh ? 1 : 0;
  }
  return binaryImage;
}

var resize = function( img, scale ) {
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
    var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled, heightScaled );

    for( var y = 0; y < heightScaled; y++ ) {
        for( var x = 0; x < widthScaled; x++ ) {
            var index = (Math.floor(y / scale) * img.width + Math.floor(x / scale)) * 4;
            var indexScaled = (y * widthScaled + x) * 4;
            scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
            scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
            scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
            scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
        }
    }
    scaledCtx.putImageData( scaledPixels, 0, 0 );
    return scaled;
}

function printWorld(image, imsize) {
  // Print the image
  for (let row = 0; row < imsize; row++) {
    let str = '';
    for (let col = 0; col < imsize; col++) {
      str += image[row * imsize + col] === 1 ? 'x' : ' ';
    }
    console.log(`${(row+'').padStart(3, '0')} ${str}`);
  }

}

function F1Score(im1,im2) {
  // see: https://en.wikipedia.org/wiki/F1_score
}

function matchScore(im1, im2) {
  // supersimple: multiples the two images together and sums up the result
  arr1 = Array.from(im1);
  arr2 = Array.from(im2);
  prod = math.dotMultiply(arr1,arr2);
  numerator = math.sum(prod);
  denominator = getPixelSum(im1);
  score = math.divide(numerator,denominator);
  return score;
}

function getPixelSum(im) {
  return math.sum(Array.from(im))
}

function getMatchScore(canvas0, canvas1, imsize) {
  // canvas0 is ID of canvas element 0, e.g., 'defaultCanvas0'
  // canvas1 is ID of canvas element 1, e.g., 'defaultCanvas1'
  // imsize is size of rescaled canvas, e.g., 64

  target = document.getElementById(canvas0);
  targ = extractBitmap(target,imsize);
  // printWorld(targ, imsize);

  environment = document.getElementById(canvas1);
  env = extractBitmap(environment,imsize);
  // printWorld(env, imsize);

  t = Array.from(targ);
  e = Array.from(env);
  score = matchScore(t,e);    
  return score;
}
