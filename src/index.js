window.onload = function () {

  let container = document.getElementById("canvas-container"),
      canvas = document.getElementById("mycanvas"),
      ctx = canvas.getContext('2d'),
      imageLoader = document.getElementById('imageLoader'),
      scale = document.getElementById('scale'),
      rotate = document.getElementById('rotate'),
      customText = document.getElementById('custom-text'),
      download = document.getElementById("download"),
      preview = document.getElementById("preview"),
      control = document.querySelectorAll('.control'),
      scaleVal,
      rotateVal,
      x,
      y,
      hRatio,
      vRatio,
      ratio,
      text = customText.value,
      dt,
      previewCounter = 0;

      //hide all controls but first 
      for (let i = 0; i < control.length; i++) {
        control[i].classList.add('hidden');
      }
      // get other controls by ID to show when that step 
      const uploads = document.querySelector("#upload-container");
      const scaleZoom = document.querySelector("#scale-zoom-container");
      const textAdd = document.querySelector("#text-container");
      const downloads = document.querySelector("#dl-container");
      uploads.classList.toggle("hidden");


  /***************(set context text characteristics)************/
  ctx.lineWidth = 5;
  ctx.font = '32pt Fira Sans';
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  // ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  // img = document.getElementById('start-image'),
  //   /*************(step 1, load the image from file) ********/
  imageLoader.addEventListener('change', loadImage, false);

  /************* (step 2, scale and rotate) ********************/

  scale.addEventListener('change', doTransform, false);
  rotate.addEventListener('change', doTransform, false);
  /************* (and swap out buttons when done) **************/
  const doneScaleZoom = document.querySelector("#done-scale-zoom");
  doneScaleZoom.addEventListener('click', function(){
    textAdd.classList.toggle("hidden");
    scaleZoom.classList.toggle("hidden");
  });

  /************* ( step 3, add text ) **************************/
  customText.addEventListener('keyup', redrawText, true);
  preview.addEventListener('click', previewCanvas, false);
  download.addEventListener('click', downloadImg, false);
  const doneText = document.querySelector("#done-text");
  doneText.addEventListener('click', function () {
    textAdd.classList.toggle("hidden");
    downloads.classList.toggle("hidden");
  });

  /************** ( capture scale and rotate values  ) **********/
  function getScaleVal() {
    scaleVal = document.getElementById('scale').value;
    return scaleVal;
  }

  function getRotateVal() {
    rotateVal = document.getElementById('rotate').value;
    return rotateVal;
  }

  let img = new Image();
  img.crossOrigin = "Anonymous";
  
  img.onload = function () {

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const scale = Math.max(canvas.width / w, canvas.height / h);

    let x = (canvas.width / 2) - (w / 2) * scale;
    let y = (canvas.height / 2) - (h / 2) * scale;
    // Draw it
    ctx.drawImage(img, x, y, w * scale, h * scale );
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  
  function loadImage(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let reader = new FileReader();
    reader.onload = function (event) {
      img.src = event.target.result;
      img.setAttribute("crossOrigin", "anonymous");
      source = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
    uploads.classList.toggle("hidden");
    scaleZoom.classList.toggle("hidden");
    return false;
  }

  function doTransform() {
    ctx.save();
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Translate to center so transformations will apply around this point
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Perform scale
    scaleVal = getScaleVal();
    ctx.scale(scaleVal, scaleVal);

    // Perform rotation
    rotateVal = getRotateVal();
    ctx.rotate(rotateVal * Math.PI / 180);

    // Reverse the earlier translation
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const scale = Math.max(canvas.width / w, canvas.height / h);

    let x = (canvas.width / 2) - (w / 2);
    let y = (canvas.height / 2) - (h / 2);
    // Draw it

    ctx.drawImage(img, x, y, img.width, img.height);
    ctx.restore();

  }

  /************** ( for redrawing canvas on each keystroke  ) ***************/
  // called by keyup in the text input field 
  function redrawText() {

    doTransform();

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      let words = text.split(' ');
      let line = '';

      context.lineWidth = 5;
      context.font = '44px Myriad Pro';
      context.strokeStyle = 'black';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.lineJoin = 'round';

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.strokeText(line.slice(0, -1), x, y);
          context.fillText(line.slice(0, -1), x, y);
          line = words[n];
          y += lineHeight;
        }
        else {
          line = testLine;
        }
      }
      context.strokeText(line.slice(0, -1), x, y);
      context.fillText(line.slice(0, -1), x, y);
    }

    let text = document.getElementById('custom-text').value;

    // Set the text style
    text = text.toUpperCase();
    x = canvas.width / 2;
    y = 100;
    wrapText(ctx, text, x, y, 500, 40);

  }

  function previewCanvas() {
    try {
      dt = canvas.toDataURL('image/png');
    }
    catch (err) {
      console.log("Error: " + err);
    }

    //now here try to save image in dir 
    dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
    // /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
    dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');
  }

  function downloadImg() {
    previewCanvas();
    this.href = dt;
    dt = "";
    location.reload();
  }
}
