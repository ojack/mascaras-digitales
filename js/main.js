var canvas, smoother, glasses, video, detector, ctx, fab, drawCanvas, buttons, brush, faceCanvas, fabricCanvas, faceCtx;
var SCALE_HEIGHT = 60;

var colors = ["#00f"];
var col = "#99cc00";
var colorIndex = 0;

window.onload = function() {
		buttons = [];
		smoother = new Smoother([0.9999999, 0.9999999, 0.999, 0.999], [0, 0, 0, 0]);
		video = document.getElementById('video');
		glasses = document.getElementById('glasses');

		getVideo();
		createCanvas();
		createUI();

	
	};

	function update(jscolor) {
    // 'jscolor' instance can be used as a string
   console.log(jscolor.value);
   col = "#"+jscolor.value;
   var f = fab.getActiveObject();
   fab.freeDrawingBrush.color = col;
			if(f){
				console.log(f);
				f.set("fill", col);
				fab.renderAll();
			}

}

	function getVideo(){
		try {
			compatibility.getUserMedia({video: true}, function(stream) {
				try {
					video.src = compatibility.URL.createObjectURL(stream);
				} catch (error) {
					video.src = stream;
				}
				compatibility.requestAnimationFrame(play);
			}, function (error) {
				alert('WebRTC not available');
			});
		} catch (error) {
			alert(error);
		}
	}

	function createCanvas(){
		canvas = document.getElementById('c');
		faceCanvas = document.getElementById('face');
		faceCtx = faceCanvas.getContext('2d');

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		ctx = canvas.getContext('2d');
		drawCanvas = document.getElementById('fabric');

		fab = new fabric.Canvas('fabric', {
            isDrawingMode: true
        });
        fab.add(new fabric.Circle({ radius: 30, fill: '#f55', top: 150, left: 150, opacity: 0.7 }));
       
        fab.renderAll();

		fab.freeDrawingBrush = new fabric['PencilBrush'](fab);
      	 fab.freeDrawingBrush.width = 10;
      	 fab.freeDrawingBrush.color = "#99cc00";
       // fab.freeDrawingBrush = new fabric.PencilBrush(fab);


	}

	function createUI(){
		var par = document.getElementById("ui");
		/*draw circle*/
		buttons.push(createButton(par, "fa fa-circle", function(){
			fab.isDrawingMode = false;
			fab.add(new fabric.Circle({ radius: 50, fill: col, top: 300, left: 300 }));
		}));

		/*draw rect*/
		buttons.push(createButton(par, "fa fa-square", function(){
			fab.isDrawingMode = false;
			fab.add(new fabric.Rect({ width: 60, height: 70, fill: col, top: 300, left: 300 }));
		}));

		
		/*set drawing mode*/
		buttons.push(createButton(par, "fa fa-paint-brush", function(){
			fab.isDrawingMode = true;
      		fab.freeDrawingBrush.width = 10;
      		buttons[3].className = "ui-button";
			buttons[2].className = "ui-button selected"
		}));
		//arrows-alt
		/*leave drawing mode*/
		buttons.push(createButton(par, "fa fa-arrows", function(){
			fab.isDrawingMode = false;
			buttons[2].className = "ui-button";
			buttons[3].className = "ui-button selected"

		}));

		/*move to trash*/
		buttons.push(createButton(par, "fa fa-trash", function(){
			fab.isDrawingMode = false;
			var f = fab.getActiveObject();
			if(f){
				f.remove();
			}
		}));

		buttons[2].className = "ui-button selected"
	}

	function createButton(parent, c, callback){
		var d = document.createElement('div');
		d.className = "ui-button";
		d.innerHTML = '<i class="'+c+'""></i>';
		parent.appendChild(d);
		d.onclick = callback;
		return d;
	}

	function drawFace(coords){
		faceCtx.drawImage(video, coords[0], coords[1], coords[2], coords[3], 0, 0, faceCanvas.width, faceCanvas.height);
	}

	function clearFace(coords){
		faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
	}

	function play() {
			compatibility.requestAnimationFrame(play);
			if (video.paused) video.play();
          	ctx.clearRect(0, 0, canvas.width, canvas.height);
			if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
	          	
	          	// Prepare the detector once the video dimensions are known:
	          	if (!detector) {
		      		var width = ~~(SCALE_HEIGHT * video.videoWidth / video.videoHeight); //~~removes anything to right of decimal
					var height  =SCALE_HEIGHT;
		      		detector = new objectdetect.detector(width, height, 1.1, objectdetect.frontalface);
		      	}
          		
          		// Perform the actual detection:
				var coords = detector.detect(video, 1);
				if (coords[0]) {
					//console.log("drawing face");
					var coord = coords[0];
					coord = smoother.smooth(coord);
					
					ctx.strokeStyle = "rgb(200,0,0)"; // sets the color to fill in the rectangle with
					//ctx.fillRect(10, 10, 55, 50);   // draws the rectangle at position 10, 10 with a width of 55 and a height of 50
					
					// Rescale coordinates from detector to video coordinate space:
					coord[0] *= video.videoWidth / detector.canvas.width;
					coord[1] *= video.videoHeight / detector.canvas.height;
					coord[2] *= video.videoWidth / detector.canvas.width;
					coord[3] *= video.videoHeight / detector.canvas.height;
					
					
					ctx.drawImage(drawCanvas, coord[0], coord[1], coord[2], coord[3]);
					

					

					drawFace(coord);

					
				} else {
					

					clearFace();
				}
			}
		}