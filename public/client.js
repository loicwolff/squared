$(function() {
  $("#image").change(function() {
    let file = this.files[0];
  
    let img = new Image();
    img.onload = function() {
      var size = {
        width: this.width,
        height: this.height
      };
      
      console.log(size);
      
      URL.revokeObjectURL(this.src);

      $("#image-size").text("Taille image: " + size.width + " x " + size.height).show();
      $("#resizer").show();
    }

    var objectURL = URL.createObjectURL(file);
    img.src = objectURL;
  });
})
