const express = require("express");
const fileUpload = require("express-fileupload");
const lwip = require("lwip");
const imageType = require("image-type");
const text2png = require("text2png");

const app = express();

app.use(express.static("public"));
app.use(fileUpload());

app.post("/upload", function(req, res) {
  
  const image = req.files.image;
  const color = req.body.color;
  const flip = req.body.flip === "on";
  const newSize = req.body.newsize;
  const textcolor = req.body.textcolor;
  const addText = textcolor !== "no"; 
  const position = req.body.position;
  const fontsize = req.body.fontsize || "30";
  
  console.log(req.body);
  
  if (image != undefined) {
    const type = imageType(image.data);
    
    lwip.open(image.data, type.ext, function(err, image) {
    
      const height = image.height();
      const width = image.width();
      
      const max = Math.max(height, width);

      console.log("image dimensions: w = " + width + " h = " + height);
      
      const opt = { textColor: textcolor, padding: 10, font: fontsize + "px sans-serif" };
      
      var text = text2png("Motif Teaforyoubijoux", opt);
      
      lwip.open(text, "png", function(err, text) {
        
        const batch = image.batch();

        if (flip) {
          console.log("flipping");

          batch.mirror("x");
        }

        if (height != width) {
          console.log("square size: " + max);

          batch.contain(max, max, color);
        }

        if (newSize) {
          console.log("new dimension: " + newSize)

          const newSizeInt = parseInt(newSize, 10);
          
          batch.resize(newSizeInt, newSizeInt);
        }

        if (addText) {
          var top = 0;
          var left = 0;
          
          switch (position) {
            case "up-left":
              break;
            case "up-center":
              left = max / 2 - text.width() / 2;
              break;
            case "up-right":
              left = max - text.width();
              break;
            case "down-left":
              top = max - text.height();
              break;
            case "down-center":
              left = max / 2 - text.width() / 2;
              top = max - text.height();
              break;
            case "down-right":
              left = max - text.width();
              top = max - text.height();
              break;
          }
          
          batch.paste(left, top, text);
        }

        batch.toBuffer(type.ext, function(err, buffer) {
          res.writeHead(200, {'Content-Type': type.mime });
          res.end(buffer, "binary");
        });
      });
    });
    
  } else {
    res.send("Aucun fichier");
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
