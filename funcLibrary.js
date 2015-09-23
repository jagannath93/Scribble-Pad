//function Library - starts

function dist( x1, y1, x2, y2){// this is the distance function
		var distance = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
		return distance;
	}

function lineAngle(x0, y0, x1, y1){// This function calculates the inclination angle of any given line with positive x, placing the origin at (x0,y0)
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

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function HSLtoHex(h, s, l){
	var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
   // return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
   return "#" + componentToHex(Math.round(r * 255)) + componentToHex(Math.round(g * 255)) + componentToHex(Math.round(b * 255));
}

function hexToRgb(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}
		
function mod(vec){//gives the modulus of a vector
	var r = Math.sqrt((vec[0]*vec[0])+(vec[1]*vec[1]));
	return r;
}

function dot(vec1,vec2){//gives the dot product of two vectors
	var d = (vec1[0]*vec2[0])+(vec1[1]*vec2[1]);
	return d;
}

function cosAng(vec1,vec2){//returns the cos of angle between two vectors
	return dot(vec1,vec2)/(mod(vec1)*mod(vec2));
}

function vPrd(vec,sc){//returns the product of the vector vec with scalar quantity sc
	return [vec[0]*sc,vec[1]*sc];
}

function vSum(vec1,vec2){//returns the sum of two vectors
	var vSum = [];
	vSum[0] = vec1[0]+vec2[0];
	vSum[1] = vec1[1]+vec2[1];
	return vSum;
}

function vDiff(vec1,vec2){//returns vector1-vector2 in that order
	var vDiff = [];
	vDiff[0] = vec1[0] - vec2[0];
	vDiff[1] = vec1[1] - vec2[1];
	return vDiff;
}

function lineDist(vec1,vec2,vec){//gives the perpendicular distance vector from point vec to line joining vec1 and vec2
	var w = [vec2[0]-vec1[0],vec2[1]-vec1[1]];//console.log(w);//this is the vector along the lAnchor
	var p = [vec[0]-vec1[0],vec[1]-vec1[1]];
	var d = [vec1[0]+((dot(p,w)/Math.pow(mod(w),2))*w[0])-vec[0],vec1[1]+((dot(p,w)/Math.pow(mod(w),2))*w[1])-vec[1]]; //console.log(d);
	return d;
}

function sort(ar){//sorts array from largest to smallest
	var temp;
	for(var a = 0; a < ar.length-1; a++){
		for(var b = 0; b < ar.length-1-a; b++){
			if(ar[b] > ar[b+1]){
				temp = ar[b];
				ar[b] = ar[b+1];
				ar[b+1] = temp;
			}
		}
	};
}

function sort2D(ar,c){//sorts 2d array from largest to smallest based on the column index number - c
	var temp;
	for(var a = 0; a < ar.length-1; a++){
		for(var b = 0; b < ar.length-1-a; b++){
			if(ar[b][c] > ar[b+1][c]){
				temp = ar[b];
				ar[b] = ar[b+1];
				ar[b+1] = temp;
			}
		}
	};
}

function markPt(pos, ctx){//marks the point 'pos' on the context ctx with an 'x' symbol
	ctx.beginPath();
	ctx.moveTo(pos[0]-5, pos[1]-5);
	ctx.lineTo(pos[0]+5, pos[1]+5);
	ctx.moveTo(pos[0]+5, pos[1]-5);
	ctx.lineTo(pos[0]-5, pos[1]+5);
	ctx.closePath();
	ctx.stroke();
}

function unitV(vec){//returns a unit vector parallel to vec
	var uV = [];
	uV[0] = vec[0]/mod(vec);
	uV[1] = vec[1]/mod(vec);
	
	return uV;
}

function arr2dContains(ar, val){//checks if the array ar contains the element val. but works only for 2d arrays
//returns true if array ar contains val else false. This works only if ar is a 2d array
	var contains = false;
	for(var a = 0; a < ar.length; a++){
		if((ar[a].length == val.length) && ar[a].every(function(element,index){return element === val[index];})){
			contains= true;
			break;
		}
	}
	return contains;
}

function roundOff(vect,rndOff){
	var vec = vect;
	vec[0] = Math.round(vec[0]*Math.pow(10,rndOff))/Math.pow(10,rndOff);
	vec[1] = Math.round(vec[1]*Math.pow(10,rndOff))/Math.pow(10,rndOff);
	
	return vec;
};

function roundNum(num,dec){//rounds off number num to dec decimals
	var newNum = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return newNum;
}

function addColors(r1,g1,b1,a1,r2,g2,b2,a2){//adds these two colors and returs [r,g,b,a]
	var a = a1 + a2*(1-a1);
	var r = (r1*a1 + r2*a2*(1-a1))/a;
	var g = (g1*a1 + g2*a2*(1-a1))/a;
	var b = (b1*a1 + b2*a2*(1-a1))/a;
	
	return [r,g,b,a];
}