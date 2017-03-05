// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const lwip = require('lwip');
const sizeOf = require('image-size');
const imageType = require('image-type');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(fileUpload());

app.post('/upload', function(req, res) {
  
  const image = req.files.image;
  const color = req.body.color;
  const flip = req.body.flip === 'on';
  
  if (image != undefined) {
    let type = imageType(image.data);
      
    lwip.open(image.data, type.ext, function(err, image) {
        
      let height = image.height();
      let width = image.width();

      console.log("image dimensions: w = " + width + " h = " + height);
      
      let batch = image.batch();
        
      if (flip) {
        batch.mirror('x');
      }

      let squareSize = 0;
      let left = 0;
      let top = 0;
  
      if (width > height) {
        squareSize = width;
        top = width / 2 - height / 2;
      } else if (height > width) {
        squareSize = height;
        left = height / 2 - width / 2;
      }
        
      if (squareSize != 0) {
        console.log("square size: " + squareSize);
        batch.contain(squareSize, squareSize, color);
      }

      batch.toBuffer(type.ext, function(err, buffer) {
        res.writeHead(200, {'Content-Type': type.mime });
        res.end(buffer, 'binary');
      });
      
    });
    
  } else {
    res.writeHead(200, {'Content-Type': 'text/html' });
    res.send('Aucun fichier');
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
