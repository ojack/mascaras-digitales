var canvas, smoother, glasses, video, detector, ctx, fab, drawCanvas, brush, faceCanvas, fabricCanvas, faceCtx;
var SCALE_HEIGHT = 100;

var colors = ["#00f"];

var colorIndex = 0;

window.onload = function() {
	
		smoother = new Smoother([0.9999999, 0.9999999, 0.999, 0.999], [0, 0, 0, 0]);
		video = document.getElementById('video');
		glasses = document.getElementById('glasses');

		getVideo();
		createCanvas();
		createUI();

	
		
		
		[].slice.call(document.getElementById('list').children).forEach(function(e) {
			e.addEventListener('click', function() {
				glasses.src = e.src;
			}, false);
		});
	};



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
            isDrawingMode: false
        });
        fab.add(new fabric.Circle({ radius: 30, fill: '#f55', top: 150, left: 150, opacity: 0.7 }));
        fab.renderAll();

        console.log(fabric);
       // fab.freeDrawingBrush = new fabric.PencilBrush(fab);


	}

	function createUI(){
		var par = document.getElementById("ui");
		/*draw circle*/
		createButton(par, function(){
			fab.isDrawingMode = false;
			fab.add(new fabric.Circle({ radius: 50, fill: colors[colorIndex], top: 300, left: 300 }));
		});

		/*draw rect*/
		createButton(par, function(){
			fab.isDrawingMode = false;
			fab.add(new fabric.Rect({ width: 60, height: 70, fill: colors[colorIndex], top: 300, left: 300 }));
		});

		createButton(par, function(){
			var f = fab.getActiveObject();
			if(f){
				console.log(f);
				f.set("fill", colors[colorIndex]);
				fab.renderAll();
			}
		});

		createButton(par, function(){
			fab.isDrawingMode = true;
			console.log(fab);
			fab.freeDrawingBrush = new fabric['PencilBrush'](fab);
			fab.freeDrawingBrush.color = colors[colorIndex];
      		fab.freeDrawingBrush.width = 10;

		});

		createButton(par, function(){
			fab.isDrawingMode = false;
		});

		createButton(par, function(){
			fab.isDrawingMode = false;
			var f = fab.getActiveObject();
			if(f){
				f.remove();
			}
		});
	}

	function createButton(parent, callback){
		var d = document.createElement('div');
		d.className = "ui-button";
		parent.appendChild(d);
		d.onclick = callback;
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
		      		detector = new objectdetect.detector(width, height, 1.8, objectdetect.frontalface);
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
					// Display glasses overlay: 
					// glasses.style.left    = ~~(coord[0] + coord[2] * 1.0/8 + video.offsetLeft) + 'px';
					// glasses.style.top     = ~~(coord[1] + coord[3] * 0.8/8 + video.offsetTop) + 'px';
					// glasses.style.width   = ~~(coord[2] * 6/8) + 'px';
					// glasses.style.height  = ~~(coord[3] * 6/8) + 'px';


					glasses.style.opacity = 1;

					drawFace(coord);

					
				} else {
					var opacity = glasses.style.opacity - 0.2;
					glasses.style.opacity = opacity > 0 ? opacity : 0;

					clearFace();
				}
			}
		}