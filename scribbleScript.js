	//alert('testing');
		function dist( x1, y1, x2, y2){// this is the distance function
			var distance = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
			return distance;
		}
		
		function lineAngle(x0, y0, x1, y1){// This function calculates the inclination angle of any given line
			var angle;
		
			if(x1>x0){
				if(y1>y0){//quadrant 1
					angle = Math.atan((y1-y0)/(x1-x0));
				}
				else if(y1==y0){//on +ve x axis
						angle = 0;
				}
				else{//quadrant 4
					angle = (Math.atan((y1-y0)/(x1-x0)))+(2*Math.PI);
				}
			}
			else if(x1==x0){
				if(y1>y0){//on +ve y axis
					angle = 0.5*Math.PI;
				}
				else if(y1==y0){
					angle = null;
				}
				else{// on -ve y axis
					angle = 1.5*Math.PI;
				}
			}
			else{
				if(y1>y0){//quadrant 2
					angle = (1*Math.PI)+(Math.atan((y1-y0)/(x1-x0)));
				}
				else if(y1==y0){//on -ve x axis
					angle = 1*Math.PI;
				}
				else{//quadrant 3
					angle = (1*Math.PI)+(Math.atan((y1-y0)/(x1-x0)));
				}
			}
			
			return angle;
		}
		
		function hexToRgb(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}
		
		var canvas1 = document.getElementById("canvas_1");
		var canvas2 = document.getElementById("canvas_2");
		var canvasImg = document.getElementById("canvas_img");
		var c1 = canvas1.getContext("2d");
			c1.fillStyle = "#6e6e6e";
			c1.strokeStyle = "#000000";
			c1.font = "20px Arial";
		var c2 = canvas2.getContext("2d");
			c2.strokeStyle = "#575757";
			c2.fillStyle = "#b8b8b8"
		var c3 = canvasImg.getContext("2d");
				
		var mouse1X, mouse1Y, mouse2X, mouse2Y,mouse_ix,mouse_iy;
		var centerX, centerY, radius, startAngle, stopAngle;
		var penIsDown = false;
		var centerSelected = false;
		var curveStarted = false;
		var myCanvas = $('#canvas_screen');
		var toolList = document.getElementById('tool_list');
		var helpText = $('#help_text');
		var imageData;
		var eraserSize = 30;;
		
		var currentTool = "none";
		//variables for paint bucket tool<>
		var pixelStack = new Array();
		var startR,startG,startB,startA;//,startX,startY;
		var fillR,fillG,fillB,fillA;
		//variables for paint bucket tool</>
		
		//variables for imageUpload tool<>
		var imageUploaded;
		var aspectRatio;
		var imgUpload;
		var imageIsLoaded = false;
		//variables for imageUpload tool</>
		
		var lines = new Array();
		var rectangles = new Array();
		var circles = new Array();
		var freeHand = new Array();
		var curves = new Array();
		var eraseArray = new Array();
		
		
	function floodFill(startX,startY,ctx){
		changeColor();//updates the canvas fillStyle to the selected in the colour selector tool
		
		imageData = ctx.getImageData(0,0,canvas1.width,canvas1.height);
		startR = imageData.data[(startY*canvas1.width+startX)*4];
		startG = imageData.data[(startY*canvas1.width+startX)*4+1];
		startB = imageData.data[(startY*canvas1.width+startX)*4+2];
		startA = imageData.data[(startY*canvas1.width+startX)*4+3];
			
		pixelStack.push([startX,startY]);
		
		while(pixelStack.length){
			var newPos,x,y,pixelPos,reachLeft,reachRight;
			newPos = pixelStack.pop();
			x = newPos[0];
			y = newPos[1];
			
			pixelPos = (y*canvas1.width + x) * 4;
			
			while(y-- >= 0 && matchStartColor(pixelPos)){
				pixelPos -= canvas1.width * 4;
			}
			pixelPos += canvas1.width * 4;
			++y;
			reachLeft = false;
			reachRight = false;
			
			while(y++ < canvas1.height-1 && matchStartColor(pixelPos)){
				colorPixel(pixelPos);
				
				if(x > 0){
					if(matchStartColor(pixelPos - 4)){
						if(!reachLeft){
							pixelStack.push([x - 1, y]);
							reachLeft = true;
						}
					}
					else if(reachLeft){
						reachLeft = false;
					}
				}//boom
				
				if(x < canvas1.width-1){
					if(matchStartColor(pixelPos + 4)){
						if(!reachRight){
							pixelStack.push([x + 1, y]);
							reachRight = true;
						}
					}
					else if(reachRight){
						reachRight = false;
					}
				}
			
				pixelPos += canvas1.width * 4;
			}
		}
		ctx.putImageData(imageData,0,0);
	}
	
	function matchStartColor(pix){
		var r = imageData.data[pix];
		var g = imageData.data[pix+1];
		var b = imageData.data[pix+2];
		var a = imageData.data[pix+3];
		
		return(r==startR&&g==startG&&b==startB&&a==startA);
	}
	
	function colorPixel(pix){
		imageData.data[pix] = hexToRgb(c1.fillStyle).r;
		imageData.data[pix+1] = hexToRgb(c1.fillStyle).g;
		imageData.data[pix+2] = hexToRgb(c1.fillStyle).b;
		imageData.data[pix+3] = 255;
	}
	
	function renderObject(obj, rc){
        if(rc == typeof undefined) {
            rc = c1;
        }
		if(obj.type == "line"){
			rc.beginPath();
			rc.moveTo(obj.startPt[0], obj.startPt[1]);
			rc.lineTo(obj.endPt[0], obj.endPt[1]);
			rc.stroke();
		}else if(obj.type == "rectangle"){
			rc.beginPath();
			rc.strokeRect(obj.vert1[0],obj.vert1[1],obj.vert2[0]-obj.vert1[0],obj.vert2[1]-obj.vert1[1]);
			if(obj.tobeFilled){
				rc.fillStyle = obj.fillColor;
				rc.fillRect(obj.vert1[0],obj.vert1[1],obj.vert2[0]-obj.vert1[0],obj.vert2[1]-obj.vert1[1]);
			}
		}else if(obj.type == "circle"){
			rc.beginPath();
			rc.arc(obj.center[0], obj.center[1], obj.rad, obj.Ang1, obj.Ang2);
			rc.stroke();
		}
		else if(obj.type == "freehand"){
			rc.beginPath();
			rc.moveTo(obj.points[0][0], obj.points[0][1]);
			for(var i = 1; i < obj.points.length; i++){
				rc.lineTo(obj.points[i][0],obj.points[i][1]);
			}
			rc.stroke();
		}
		else if(obj.type == "curve"){
			rc.beginPath();
			rc.moveTo(obj.startPt[0], obj.startPt[1]);
			rc.quadraticCurveTo(obj.intPt[0],obj.intPt[1], obj.endPt[0], obj.endPt[1]);
			rc.stroke();
		}
		else if(obj.type == "flood"){
			rc.fillStyle = obj.floodColor;
			floodFill(obj.floodPt[0], obj.floodPt[1], rc);
		}
		else if(obj.type == "erase"){
			rc.clearRect(obj.vert1[0],obj.vert1[1],obj.vert2[0]-obj.vert1[0],obj.vert2[1]-obj.vert1[1]);
		}
		else if(obj.type == "image"){
			var img = new Image();
			img.src = obj.image;
			rc.drawImage(img,0,0,canvas1.width,canvas1.height);
		}
		else if(obj.type == "text"){
			rc.font = obj.font;
			rc.fillStyle = obj.txtColor;
			rc.fillText(obj.value, obj.basePt[0], obj.basePt[1]);
		}
	}
	
	//click events for all kinds of tools
	$('.scribblePad').click(function(e){
	//click function code for the line tool
		if(currentTool == "line"){
		//without the chain option checked
			if(!chainCheckbox.checked){
			if(!penIsDown){
				mouse1X = e.pageX - this.offsetLeft;
				mouse1Y = e.pageY - this.offsetTop;
				penIsDown = true;
				helpText.text('Pick the ending point or Hit Esc to stop drawing');
			}
			else if(penIsDown){
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				penIsDown = false;
				//console.log(mouse2X+", "+mouse2Y);
				c2.clearRect(0,0,canvas2.width,canvas2.height);
				c1.beginPath();
				c1.moveTo(mouse1X,mouse1Y);
				c1.lineTo(mouse2X,mouse2Y);
				lines.push(new Array(mouse1X,mouse1Y,mouse2X,mouse2Y));
				c1.stroke();
				helpText.text('Pick the starting point');
				
				var lineObj = {type : "line", startPt : new Array(mouse1X,mouse1Y), endPt : new Array(mouse2X,mouse2Y)};
				pingData(lineObj);
			}
			}
			//with the chain option checked
			else if(chainCheckbox.checked){
			if(!penIsDown){
				mouse1X = e.pageX - this.offsetLeft;
				mouse1Y = e.pageY - this.offsetTop;
				penIsDown = true;
				helpText.text('Continue picking points. Hit Esc to stop drawing');
				//console.log(mouse1X+", "+mouse1Y);
			}
			else if(penIsDown){
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				c1.beginPath();
				c1.moveTo(mouse1X,mouse1Y);
				c1.lineTo(mouse2X,mouse2Y);
				lines.push(new Array(mouse1X,mouse1Y,mouse2X,mouse2Y));
				c1.stroke();
				mouse1X = mouse2X; mouse1Y = mouse2Y;
				
				var lineObj = {type : "line", startPt : new Array(mouse1X,mouse1Y), endPt : new Array(mouse2X,mouse2Y)};
				pingData(lineObj);
			}
			}
		}
		//code for rectangle tool
		else if(currentTool == "rectangle"){
			if(!penIsDown){
				mouse1X = e.pageX - this.offsetLeft;
				mouse1Y = e.pageY - this.offsetTop;
				//console.log(mouse1X+", "+mouse1Y);
				penIsDown = true;
				helpText.text('Pick the second corner or Hit Esc to stop drawing');
			}
			else if(penIsDown){
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				penIsDown = false;
				c1.beginPath();
				c1.strokeRect(mouse1X,mouse1Y,mouse2X-mouse1X,mouse2Y-mouse1Y);
				if(fillCheckbox.checked){
					c1.fillRect(mouse1X,mouse1Y,mouse2X-mouse1X,mouse2Y-mouse1Y);
				}
				rectangles.push(new Array(mouse1X,mouse1Y,mouse2X,mouse2Y,fillCheckbox.checked));
				helpText.text('Pick first corner of the rectangle');
				//pushing the corner coordinates to the array - last element is a bool whether the rectangle should be filled or not.
				
				var recObj = {type: "rectangle", vert1: new Array(mouse1X,mouse1Y), vert2: new Array(mouse2X,mouse2Y), 
								tobeFilled: fillCheckbox.checked, fillColor: c1.fillStyle};
				pingData(recObj);
			}
			
		}
		//code for circle tool
		else if(currentTool == "circle"){
			if(!centerSelected){
				centerX = e.pageX - this.offsetLeft;
				centerY = e.pageY - this.offsetTop;
				centerSelected = true;
				helpText.text('Pick the starting point of the arc/circle');
				//console.log(centerX + ", " + centerY);
			}
			else if(centerSelected){
				if(!penIsDown){
					mouse1X = e.pageX - this.offsetLeft;
					mouse1Y = e.pageY - this.offsetTop;
					penIsDown = true;
					
					radius = dist(centerX,centerY,mouse1X,mouse1Y);
					startAngle = lineAngle(centerX,centerY,mouse1X,mouse1Y);
					helpText.text('Pick the ending point');
				}
				else if(penIsDown){
					mouse2X = e.pageX - this.offsetLeft;
					mouse2Y = e.pageY - this.offsetTop;
					penIsDown = false;
					centerSelected = false;
					
					stopAngle = lineAngle(centerX,centerY,mouse2X,mouse2Y);
					if(Math.abs(startAngle-stopAngle)<(Math.PI/60)){
							if(reverseCheckbox.checked){stopAngle = startAngle + 2*Math.PI}
							else if(!reverseCheckbox.checked){stopAngle = startAngle - 2*Math.PI}
					}
					
					c1.beginPath();
					if(reverseCheckbox.checked){
						c1.arc(centerX,centerY,radius,startAngle,stopAngle);
						circles.push(new Array(centerX,centerY,radius,startAngle,stopAngle));
						
						var cirObj = {type: "circle", center: new Array(centerX, centerY), rad: radius, Ang1: startAngle, 
										Ang2: stopAngle};
						pingData(cirObj);
					}
					else{
						c1.arc(centerX,centerY,radius,stopAngle,startAngle);
						circles.push(new Array(centerX,centerY,radius,stopAngle,startAngle));
						
						var cirObj = {type: "circle", center: new Array(centerX, centerY), rad: radius, Ang1: stopAngle, 
										Ang2: startAngle};
						pingData(cirObj);
					}
					c1.stroke();
					helpText.text('Select the centre of the arc/circle');
				}
			}
		}
		else if(currentTool == "freehand"){
			if(!penIsDown){
				penIsDown = true;
				freeHand = [];
				mouse1X = e.pageX - this.offsetLeft;
				mouse1Y = e.pageY - this.offsetTop;
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				freeHand.push(new Array(mouse1X,mouse1Y));
				//console.log(mouse1X,mouse1Y);
				helpText.text('Click to stop drawing');
			}
			else if(penIsDown){
				//freeHand[freeHand.length-1][2] = false;
				penIsDown = false;
				
				var frObj = {type: "freehand", points: freeHand}
				pingData(frObj);
				
				helpText.text('Click to start drawing free hand');
			}
		}
		else if(currentTool == "curve"){
			if(!penIsDown){
				penIsDown = true;//console.log('penIsDown = '+penIsDown);
				mouse1X = e.pageX - this.offsetLeft;
				mouse1Y = e.pageY - this.offsetTop;
				helpText.text('continue selecting control points or hit Esc to stop');
			}
			else if(penIsDown){
				if(!curveStarted){
					curveStarted = true;
					mouse_ix = e.pageX - this.offsetLeft;
					mouse_iy = e.pageY - this.offsetTop;
				}
				else if(curveStarted){
					mouse2X = e.pageX - this.offsetLeft;
					mouse2Y = e.pageY - this.offsetTop;
					c1.beginPath();
					c1.moveTo(mouse1X,mouse1Y);
					c1.quadraticCurveTo(mouse_ix,mouse_iy,(mouse_ix+mouse2X)/2,(mouse_iy+mouse2Y)/2);
					c1.stroke();
					curves.push(new Array(mouse1X,mouse1Y,mouse_ix,mouse_iy,(mouse_ix+mouse2X)/2,(mouse_iy+mouse2Y)/2));
					
					var curObj = {type: "curve", startPt: new Array(mouse1X, mouse1Y), intPt: new Array(mouse_ix,mouse_iy),
									endPt: new Array((mouse_ix+mouse2X)/2,(mouse_iy+mouse2Y)/2)};
					pingData(curObj);
					//console.log(mouse_ix,mouse_iy);
					//console.log(mouse1X+" "+mouse1Y+" "+mouse_ix+" "+mouse_iy+" "+(mouse_ix+mouse2X)/2+" "+(mouse_iy+mouse2Y)/2);
					mouse1X = (mouse_ix+mouse2X)/2;mouse1Y = (mouse_iy+mouse2Y)/2;
					mouse_ix = mouse2X;mouse_iy = mouse2Y;
				}
			}
		}
		else if(currentTool == "floodFill"){
			var startX = e.pageX - this.offsetLeft;
			var startY = e.pageY - this.offsetTop;
			
			floodFill(startX, startY, c1);
			
			var floodObj = {type: "flood", floodPt: new Array(startX,startY), floodColor: c1.fillStyle};
			pingData(floodObj);
		}
		else if(currentTool == "eraser"){
			if(!penIsDown){
				mouse1X = e.pageX - this.offsetLeft;
				mouse1Y = e.pageY - this.offsetTop;
				//console.log(mouse1X+", "+mouse1Y);
				penIsDown = true;
				helpText.text('Pick the second corner of the area to be cleared or hit esc to abort');
			}
			else if(penIsDown){
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				penIsDown = false;
				c1.beginPath();
				c1.clearRect(mouse1X,mouse1Y,mouse2X-mouse1X,mouse2Y-mouse1Y);
				
				helpText.text('Pick first corner of the area to be cleared');
				//pushing the corner coordinates to the array - last element is a bool whether the rectangle should be filled or not.
				
				var erObj = {type: "erase", vert1: new Array(mouse1X,mouse1Y), vert2: new Array(mouse2X,mouse2Y)};
				pingData(erObj);
			}
			
		}
		else if(currentTool == "image"){
			imgUpload = $('#imgUpload');
			if(!penIsDown){
					if(imageIsLoaded){
					aspectRatio = $('#imageUploaded').height()/$('#imageUploaded').width();//defining the aspect ratio of the image
				
					mouse1X = e.pageX - this.offsetLeft;
					mouse1Y = e.pageY - this.offsetTop;
			
					imageUploaded = document.getElementById('imageUploaded');
					//c2.drawImage(imageUploaded,mouse1X,mouse1Y);
					penIsDown = true;
					helpText.text('Resize the image to the wanted size and click to draw the image');
				}
				else if(!imageIsLoaded){
					alert('No image selected');
				}
			}
			else if(penIsDown){
				c2.clearRect(0,0,canvas2.width,canvas2.height);
				
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				
				c3.drawImage(imageUploaded,mouse1X,mouse1Y,mouse2X-mouse1X,(mouse2X-mouse1X)*aspectRatio);
				
				var encImg = canvasImg.toDataURL();
				var imgObj = {type: "image", image: encImg};
				c3.clearRect(0,0,canvas1.width,canvas1.height);
				c1.drawImage(imageUploaded,mouse1X,mouse1Y,mouse2X-mouse1X,(mouse2X-mouse1X)*aspectRatio);
				pingData(imgObj);
				//$('#imageUploaded').remove();removing the image division which was hidden
				//imgUpload.replaceWith( imgUpload = imgUpload.clone( true ) );//resetting the input file element
				penIsDown = false;
				//imageIsLoaded = false;
				helpText.text('Choose an image file to upload and draw');
			}
		}
		else if(currentTool == "text"){
			var txt = $('#text_input').val();
			var txtSize = $('#textSize').val();
			if(txt == ''){alert('No Text to Write');}
			else{
				mouse1X = e.pageX - this.offsetLeft;
				mouse1Y = e.pageY - this.offsetTop;
				
				c1.font = txtSize+"px Arial";
				c1.fillText(txt,mouse1X,mouse1Y);
				
				var txtObj = {type: "text", font: c1.font, value: txt, basePt : new Array(mouse1X, mouse1Y), txtColor: c1.fillStyle};
				pingData(txtObj);
			}
		}
		else if(currentTool == "none"){
			alert('please select a tool ot start drawing');
		}
	});
	
	$('.scribblePad').mousemove(function(e){
		if(currentTool == "line"){
			if(penIsDown){
				c2.clearRect(0,0,canvas2.width,canvas2.height);
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				c2.beginPath();
				c2.moveTo(mouse1X,mouse1Y);
				c2.lineTo(mouse2X,mouse2Y);
				c2.stroke();
				//console.log(mouse2X+", "+mouse2Y);
			}
			else if(!penIsDown){c2.clearRect(0,0,canvas2.width,canvas2.height);}
		}
		else if(currentTool == "rectangle"){
			if(penIsDown){
				c2.clearRect(0,0,canvas2.width,canvas2.height);
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				c2.beginPath();
				c2.strokeRect(mouse1X,mouse1Y,mouse2X-mouse1X,mouse2Y-mouse1Y);
			}
			else if(!penIsDown){c2.clearRect(0,0,canvas2.width,canvas2.height);}
		}
		else if(currentTool == "circle"){
			if(!centerSelected){c2.clearRect(0,0,canvas2.width,canvas2.height);}
			else if(centerSelected){
				if(!penIsDown){
					c2.clearRect(0,0,canvas2.width,canvas2.height);
					mouse_ix = e.pageX - this.offsetLeft;
					mouse_iy = e.pageY - this.offsetTop;
					c2.beginPath();
					c2.moveTo(centerX,centerY);
					c2.lineTo(mouse_ix,mouse_iy);
					c2.stroke();
				}
				else if(penIsDown){
					c2.clearRect(0,0,canvas2.width,canvas2.height);
					mouse_ix = e.pageX - this.offsetLeft;
					mouse_iy = e.pageY - this.offsetTop;
					
					stopAngle = lineAngle(centerX,centerY,mouse_ix,mouse_iy);
					if(Math.abs(startAngle-stopAngle)<(Math.PI/60)){
							if(reverseCheckbox.checked){stopAngle = startAngle + 2*Math.PI}
							else if(!reverseCheckbox.checked){stopAngle = startAngle - 2*Math.PI}
					}
					
					c2.beginPath();
					if(reverseCheckbox.checked){c2.arc(centerX,centerY,radius,startAngle,stopAngle);}
					else{c2.arc(centerX,centerY,radius,stopAngle,startAngle);}
					c2.stroke();
				}
			}
		}
		else if(currentTool == "freehand"){
			if(penIsDown){
				mouse1X = mouse2X;
				mouse1Y = mouse2Y;
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				c1.beginPath();
				c1.moveTo(mouse1X,mouse1Y);
				c1.lineTo(mouse2X,mouse2Y);
				c1.stroke();
				freeHand.push(new Array(mouse2X,mouse2Y));
			}
		}
		else if(currentTool == "curve"){
			if(penIsDown){
				if(!curveStarted){
					c2.clearRect(0,0,canvas2.width,canvas2.height);
					mouse2X = e.pageX - this.offsetLeft;
					mouse2Y = e.pageY - this.offsetTop;
					c2.beginPath();
					c2.moveTo(mouse1X,mouse1Y);
					c2.lineTo(mouse2X,mouse2Y);
					c2.stroke();
					//console.log(mouse2X+", "+mouse2Y);
				}
				else if(curveStarted){
					c2.clearRect(0,0,canvas2.width,canvas2.height);
					mouse2X = e.pageX - this.offsetLeft;
					mouse2Y = e.pageY - this.offsetTop;
					c2.beginPath();
					c2.moveTo(mouse_ix,mouse_iy);
					c2.lineTo(mouse2X,mouse2Y);
					c2.stroke();
					c2.beginPath();
					c2.moveTo(mouse1X,mouse1Y);
					c2.quadraticCurveTo(mouse_ix,mouse_iy,(mouse_ix+mouse2X)/2,(mouse_iy+mouse2Y)/2);
					c2.stroke();
					//console.log(mouse2X+", "+mouse2Y);
				}
			}
			else if(!penIsDown){c2.clearRect(0,0,canvas2.width,canvas2.height);}
		}
		else if(currentTool == "eraser"){
			if(penIsDown){
				c2.clearRect(0,0,canvas2.width,canvas2.height);
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				c2.beginPath();
				c2.strokeRect(mouse1X,mouse1Y,mouse2X-mouse1X,mouse2Y-mouse1Y);
			}
			else if(!penIsDown){c2.clearRect(0,0,canvas2.width,canvas2.height);}
		}
		else if(currentTool == "image"){
			if(penIsDown){
				c2.clearRect(0,0,canvas2.width,canvas2.height);
				
				mouse2X = e.pageX - this.offsetLeft;
				mouse2Y = e.pageY - this.offsetTop;
				
				c2.drawImage(imageUploaded,mouse1X,mouse1Y,mouse2X-mouse1X,(mouse2X-mouse1X)*aspectRatio);
			}
			else if(!penIsDown){
				c2.clearRect(0,0,canvas2.width,canvas2.height);
			}
		}
		else if(currentTool == "text"){
			mouse1X = e.pageX - this.offsetLeft;
			mouse1Y = e.pageY - this.offsetTop;
			
			var txt = $('#text_input').val();
			var txtSize = $('#textSize').val();
			if(txt != ""){
				c2.clearRect(0,0,canvas2.width,canvas2.height);
				c2.font = txtSize+"px Arial";
				c2.fillText(txt, mouse1X, mouse1Y);
			}
		}
	});
		
	window.addEventListener("keydown",press_btn,false);
	
	function press_btn(e){
		if(e.keyCode == 27){
			if(currentTool == "freehand"){
				freeHand[freeHand.length-1][2] = false;
			}
		penIsDown = false;
		centerSelected = false;
		curveStarted = false;
		c2.clearRect(0,0,canvas2.width,canvas2.height);
		loadTool();
		}
	}
		
	$('#clear_btn').click(function(){
		c2.clearRect(0,0,canvas2.width,canvas2.height);
		c1.clearRect(0,0,canvas1.width,canvas1.height);
		penIsDown = false;
	});
	
	function renderShapes(){
		//drawing lines
		for(var line=0;line<lines.length;line++){
			c1.beginPath();
			c1.moveTo(lines[line][0],lines[line][1]);
			c1.lineTo(lines[line][2],lines[line][3]);
			c1.stroke();
		}
		//drawing rectangles
		for(var rect= 0; rect<rectangles.length;rect++){
			c1.beginPath();
			c1.strokeRect(rectangles[rect][0],rectangles[rect][1],rectangles[rect][2]-rectangles[rect][0],rectangles[rect][3]-rectangles[rect][1]);
			if(rectangles[rect][4]==true){
			c1.fillRect(rectangles[rect][0],rectangles[rect][1],rectangles[rect][2]-rectangles[rect][0],rectangles[rect][3]-rectangles[rect][1]);
			}
		}
		//drawing circles and arcs
		for(var cir = 0; cir<circles.length; cir++){
			c1.beginPath();
			c1.arc(circles[cir][0],circles[cir][1],circles[cir][2],circles[cir][3],circles[cir][4]);
			c1.stroke();
		}
		//drawing free hand strokes
		//alert((freeHand.length*3)+" values recorded");
		for(var free = 0;free<freeHand.length-1;free++){
			if(freeHand[free][2]){
				c1.beginPath();
				c1.moveTo(freeHand[free][0],freeHand[free][1]);
				c1.lineTo(freeHand[free+1][0],freeHand[free+1][1]);
				c1.stroke();
			}
		}
		//drawing curves
		for(var cur = 0;cur<curves.length;cur++){
			c1.beginPath();
			c1.moveTo(curves[cur][0],curves[cur][1]);
			c1.quadraticCurveTo(curves[cur][2],curves[cur][3],curves[cur][4],curves[cur][5]);
			c1.stroke();
			//console.log(curves[cur][2]+" "+curves[cur][3]);
		}
		//lines.splice(0,lines.length);
		//rectangles.splice(0,rectangles.length);//these lines clear or delete all the elements from the arrays
		console.log(lines.length*2+rectangles.length*3+circles.length*5+freeHand.length*2+curves.length*6);
	}
	
	$('#render_btn').click(function(){renderShapes()});
	
	function loadTool(){
		currentTool = toolList.options[toolList.selectedIndex].value;
		if(currentTool=="line"){
		$('#chain_box').show();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#text_inputBox').hide();
		$('#imgUploadBox').hide();
		helpText.text('Pick starting point of the line');
		}
		else if(currentTool=="rectangle"){
		$('#chain_box').hide();
		$('#imgUploadBox').hide();
		$('#fill_box').show();
		$('#reverse_box').hide();
		$('#text_inputBox').hide();
		helpText.text('Pick first corner of the rectangle');
		}
		else if(currentTool=="circle"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#imgUploadBox').hide();
		$('#reverse_box').show();
		$('#text_inputBox').hide();
		helpText.text('Select the centre of the arc/circle');
		}
		else if(currentTool == "freehand"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUploadBox').hide();
		$('#text_inputBox').hide();
		helpText.text('Click to start drawing free hand');
		}
		else if(currentTool == "curve"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUploadBox').hide();
		$('#text_inputBox').hide();
		helpText.text('Pick the starting point of the curve');
		}
		else if(currentTool == "floodFill"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUploadBox').hide();
		$('#text_inputBox').hide();
		helpText.text('Pick an Internal point to fill');
		}
		else if(currentTool == "eraser"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUploadBox').hide();
		$('#text_inputBox').hide();
		helpText.text('Pick first corner of the area to be cleared');
		}
		else if(currentTool == "image"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUpload_box').show();
		$('#text_inputBox').hide();
		helpText.text('Choose an image file to upload and draw');
		}
		else if(currentTool == "text"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUpload_box').hide();
		$('#text_inputBox').show();
		helpText.text('Type the text in the field');
		}
	}
	
	function loadImage() {
		var input = document.getElementById('imgUpload');
		if (input.files && input.files[0]) {
			var reader = new FileReader();
            
			reader.onload = function (e) {
				//$('#imageUploaded').attr('src', e.target.result);
				$('#imageUploaded').remove();
				$('<img src="'+e.target.result+'" id="imageUploaded" height="100px" style="visibility:hidden"/>').appendTo('#tool_box');
				//imageUploaded.src = e.target.result;
			}
            
			reader.readAsDataURL(input.files[0]);
			imageIsLoaded = true;
			helpText.text('Click where you want to place the image\n on the canvas');
		}
	}
	
	function changeColor(){
		c1.fillStyle = $('#fillColor').val();
		c2.fillStyle = $('#fillColor').val();
	}
	
	function saveImage(){
		//window.location.href = canvas1.toDataURL('image/png')//.replace('image/png','image/octet-stream');
		//console.log(canvas1.toDataURL('image/png'));
		window.win = open(canvas1.toDataURL('image/png'));
		setTimeout('win.document.execCommand("SaveAs")', 0);
		//alert('yo');
		//console.log(dataURL);
	}
	$('#save_btn').click(function(){saveImage();});
