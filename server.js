const express = require('express');
const fileUpload = require('express-fileupload');
const lwip = require('lwip');
const imageType = require('image-type');

const app = express();

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
        console.log('flipping');
        
        batch.mirror('x');
      }

      if (height != width) {
        let squareSize = Math.max(height, width);
        
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
