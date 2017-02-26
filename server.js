// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const lwip = require('lwip');
const sizeOf = require('image-size');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(fileUpload());

app.post('/upload', function(req, res) {
  
  const image = req.files.image;
  const color = req.body.color;
  
  if (image != undefined) {
    const imageInfo = sizeOf(image.data);

    console.log("image dimensions: w = " + imageInfo.width + " h = " + imageInfo.height);

    if (imageInfo.width == imageInfo.height) {
      // if the image is already a square, send it back
      console.log("image is already squared");
      sendImage(image, imageInfo.type, res);
    }
    else {
      lwip.open(image.data, imageInfo.type, function(err, image) {

        let maxSize = 0;
        let left = 0;
        let top = 0;

        if (imageInfo.width > imageInfo.height) {
          maxSize = imageInfo.width;
          top = imageInfo.width/ 2 - imageInfo.height / 2;
        } else if (imageInfo.height > imageInfo.width) {
          maxSize = imageInfo.height;
          left = imageInfo.height/ 2 - imageInfo.width / 2;
        }

        console.log("White square: " + maxSize);
        console.log("Pasting image pos: left = " + left + " top = " + top);

        lwip.create(maxSize, maxSize, color, function(err, whiteImage) {
          whiteImage.paste(left, top, image, function(err, finalImage) {
            sendImage(finalImage, imageInfo.type, res);
          });
        });
      });
    }
  } else {
    res.send('Aucun fichier');
  }
});

function sendImage(image, type, res) {
  image.toBuffer(type, function(err, buffer) {
    res.writeHead(200, {'Content-Type': 'image' });
    res.end(buffer, 'binary');
  });
}

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
