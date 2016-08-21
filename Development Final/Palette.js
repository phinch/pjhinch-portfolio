var firsttime = 0;

var chosenbox = document.getElementById('chosenbox');
var mycolor = document.getElementById('mycolor');
var centerx = 117;
var centery = 110;

var tribox = document.getElementById('tribox');
var tritop = document.getElementById('tritop');
var trileft = document.getElementById('trileft');
var triright = document.getElementById('triright');

var squbox = document.getElementById('squbox');
var squtl = document.getElementById('squtl');
var squtr = document.getElementById('squtr');
var squbl = document.getElementById('squbl');
var squbr = document.getElementById('squbr');

var arcbox = document.getElementById('arcbox');
var arcleft = document.getElementById('arcleft');
var arcmid = document.getElementById('arcmid');
var arcright = document.getElementById('arcright');

function gethex(red, green, blue){
	var hash = "#";
    
    var first = red.toString(16);
    var second = green.toString(16);
    var third = blue.toString(16);
    
    var total = hash + "" + first + second + third;
    return total;
}

function distance(cx, cy, mx, my){
	var dx = Math.pow((cx - mx), 2);
    var dy = Math.pow((cy - my), 2);
    return Math.sqrt(dx + dy);
}

function radiize(myx, myy, degrees){
    var radius = distance(centerx, centery, myx, myy);
    var theta = Math.atan2(centery - myy, myx - centerx);
    if(theta < 0){
    	theta += 2*Math.PI;
    }
    
    var radians = degrees * Math.PI / 180;
    
    theta += radians //theta of new point
    
    var newx = radius * Math.cos(theta);
    var newy = radius * Math.sin(theta);
    
    newx += centerx;
    newy = centery - newy;
    
    return [newx, newy];
}



var image = new Image();
image.crossOrigin = '';
image.src = "http://i.imgur.com/kVNz4Sv.jpg";

var canva = document.getElementById('canvas');
var canvassed = canva.getContext('2d');

image.onload = function(){
    canvassed.drawImage(image, 0, 0);
    image.style.display = 'none';
}

function getpalette(x, y, degrees){
    coords = radiize(x, y, degrees);
    thisx = coords[0];
    thisy = coords[1];
    
    var pixel = canvassed.getImageData(thisx, thisy, 1, 1);
    var data = pixel.data;
    return gethex(data[0], data[1], data[2]);
}

function afterfade(event){
 
	var clickx = event.layerX;
    var clicky = event.layerY; 
    
    var radius = distance(centerx, centery, clickx, clicky);
    if(radius > 92){ //Clicked outside of color wheel
        return; //Do nothing
    }
    
    var pixel = canvassed.getImageData(clickx, clicky, 1, 1);
    var data = pixel.data;
    
    //var squbox = document.getElementById('squbox');
    //Time for maths
    
    //Chosen box
    var chosen = gethex(data[0], data[1], data[2]);
    chosenbox.innerHTML = chosen;
    mycolor.style.background = chosen;
    
    //Triangle palette
    tritop.style.background = chosen;
    
    var tlcolor = getpalette(clickx, clicky, 120);
    trileft.style.background = tlcolor;
   
    var trcolor = getpalette(clickx, clicky, 240);
    triright.style.background = trcolor;
    
    tribox.innerHTML = chosen + "\n" + tlcolor + "\n" + trcolor;
    
    //Square palette
    squtl.style.background = chosen;
    
    var sblcolor = getpalette(clickx, clicky, 90);
    squbl.style.background = sblcolor;
    
    var sbrcolor = getpalette(clickx, clicky, 180);
    squbr.style.background = sbrcolor;
    
    var strcolor = getpalette(clickx, clicky, 270);
    squtr.style.background = strcolor;
    
    squbox.innerHTML = chosen + "\n" + strcolor + "\n" + sblcolor + "\n" + sbrcolor;
    
    //Arc palette
    arcmid.style.background = chosen;
    
    var alcolor = getpalette(clickx, clicky, 40);
    arcleft.style.background = alcolor;
    
    var arcolor = getpalette(clickx, clicky, 320);
    arcright.style.background = arcolor;
    
    arcbox.innerHTML = alcolor + "\n" + chosen + "\n" + arcolor;
    
    $('#mycolor').fadeIn(1000);
    $('#chosenbox').fadeIn(1000);
    $('#tribox').fadeIn(1000);
    $('#tritop').fadeIn(1000);
    $('#trileft').fadeIn(1000);
    $('#triright').fadeIn(1000);
    $('#squbox').fadeIn(1000);
    $('#squtl').fadeIn(1000);
    $('#squtr').fadeIn(1000);
    $('#squbl').fadeIn(1000);
    $('#squbr').fadeIn(1000);
    $('#arcbox').fadeIn(1000);
    $('#arcleft').fadeIn(1000);
    $('#arcmid').fadeIn(1000);
    $('#arcright').fadeIn(1000);
}

function clicked(event) {
  	var clickx = event.layerX;
    var clicky = event.layerY; 
    
    var radius = distance(centerx, centery, clickx, clicky);
    if(radius > 92){ //Clicked outside of color wheel
        return; //Do nothing
    }
    
    var speed = 750;
    if(firsttime == 0){
        firsttime++;
        speed = 1;
    }
    
    $('#mycolor').fadeOut(speed);
    $('#chosenbox').fadeOut(speed);
    $('#tribox').fadeOut(speed);
    $('#tritop').fadeOut(speed);
    $('#trileft').fadeOut(speed);
    $('#triright').fadeOut(speed);
    $('#squbox').fadeOut(speed);
    $('#squtl').fadeOut(speed);
    $('#squtr').fadeOut(speed);
    $('#squbl').fadeOut(speed);
    $('#squbr').fadeOut(speed);
    $('#arcbox').fadeOut(speed);
    $('#arcleft').fadeOut(speed);
    $('#arcmid').fadeOut(speed);
    $('#arcright').fadeOut(speed);
    
    setTimeout(afterfade, 1.5*speed, event);
};

canvas.addEventListener('click', clicked);

