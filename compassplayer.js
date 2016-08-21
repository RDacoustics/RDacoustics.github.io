console.log(webAudioAmbisonic);

// Setup audio context and variables
var AudioContext = window.AudioContext // Default
    || window.webkitAudioContext; // Safari and old versions of Chrome
var context = new AudioContext; // Create and Initialize the Audio Context

// added resume context to handle Firefox suspension of it when new IR loaded
// see: http://stackoverflow.com/questions/32955594/web-audio-scriptnode-not-called-after-button-onclick
context.onstatechange = function() {
    if (context.state === "suspended") { context.resume(); }
}

var sound_1 = "sounds/clicks.wav";
var sound_2 = "sounds/paper.wav";
var sound_3 = "sounds/attacks.wav";
var irUrl_0 = "node_modules/web-audio-ambisonic/examples/IRs/HOA4_filters_virtual.wav";
var irUrl_1 = "node_modules/web-audio-ambisonic/examples/IRs/HOA4_filters_direct.wav";
var irUrl_2 = "node_modules/web-audio-ambisonic/examples/IRs/room-medium-1-furnished-src-20-Set1.wav";

var maxOrder = 3;
var orderOut = 3;
var soundBuffer, sound;
var soundBuffer2, soundBuffer3;
var alpha2;

// define HOA order limiter (to show the effect of order)
var limiter = new webAudioAmbisonic.orderLimiter(context, maxOrder, orderOut);
console.log(limiter);

var limiter2 = new webAudioAmbisonic.orderLimiter(context, maxOrder, orderOut);
console.log(limiter2);

var limiter3 = new webAudioAmbisonic.orderLimiter(context, maxOrder, orderOut);
console.log(limiter3);

// define HOA rotator
var rotator = new webAudioAmbisonic.sceneRotator(context, maxOrder);
rotator.init();
console.log(rotator);

var rotator2 = new webAudioAmbisonic.sceneRotator(context, maxOrder);
rotator2.init();
console.log(rotator2);

var rotator3 = new webAudioAmbisonic.sceneRotator(context, maxOrder);
rotator3.init();
console.log(rotator3);

// binaural HOA decoder
var decoder = new webAudioAmbisonic.binDecoder(context, maxOrder);
console.log(decoder);

// output gain
var masterGain = context.createGain();
var gain1 = context.createGain();
var gain2 = context.createGain();
var gain3 = context.createGain();

// connect HOA blocks
limiter.out.connect(rotator.in);
limiter2.out.connect(rotator2.in);
limiter3.out.connect(rotator3.in);

rotator.out.connect(gain1);
gain1.connect(decoder.in);

rotator2.out.connect(gain2);
gain2.connect(decoder.in);

rotator3.out.connect(gain3);
gain3.connect(decoder.in);

decoder.out.connect(masterGain);
masterGain.connect(context.destination);


// function to assign sample to the sound buffer for playback (and enable playbutton)
var assignSample2SoundBuffer = function(decodedBuffer) {
    soundBuffer = decodedBuffer;
    document.getElementById('play').disabled = false;
}

// load samples and assign to buffers
var assignSoundBufferOnLoad = function(buffer) {
    soundBuffer = buffer;
    document.getElementById('play').disabled = false;
}
var assignSoundBufferOnLoad2 = function(buffer) {
    soundBuffer2 = buffer;
   }
var assignSoundBufferOnLoad3 = function(buffer) {
    soundBuffer3 = buffer;
   }


var loader_sound_1 = new webAudioAmbisonic.HOAloader(context, maxOrder, sound_1,assignSoundBufferOnLoad);
loader_sound_1.load();
var loader_sound_2 = new webAudioAmbisonic.HOAloader(context, maxOrder, sound_2, assignSoundBufferOnLoad2);
loader_sound_2.load();
var loader_sound_3 = new webAudioAmbisonic.HOAloader(context, maxOrder, sound_3, assignSoundBufferOnLoad3);
loader_sound_3.load();

// load filters and assign to buffers
var assignFiltersOnLoad = function(buffer) {
    decoder.updateFilters(buffer);
}

var loader_filters = new webAudioAmbisonic.HOAloader(context, maxOrder, irUrl_1, assignFiltersOnLoad);
loader_filters.load();

// lookup table for the compass data -> rotator
var lookup = new Array(361) ;
for (var i = 0 ; i < 360 ; i++) {
	if (i < 180){ lookup[i] = i; }
	if (i >= 180){ lookup[i] = (i-360); }};
	lookup[360] = 0;


$(document).ready(function() {
   // Init event listeners
    document.getElementById('play').addEventListener('click', function() {
        sound = context.createBufferSource();
        sound.buffer = soundBuffer;
        sound.loop = true;
        sound.connect(limiter.in);
        sound.start(0);
        
        sound2 = context.createBufferSource();
        sound2.buffer = soundBuffer2;
        sound2.loop = true;
        sound2.connect(limiter2.in);
        sound2.start(0);
        sound2.isPlaying = true;
        
        sound3 = context.createBufferSource();
        sound3.buffer = soundBuffer3;
        sound3.loop = true;
        sound3.connect(limiter3.in);
        sound3.start(0);
        sound3.isPlaying = true;
        
        document.getElementById('play').disabled = true;
        document.getElementById('stop').disabled = false;
    });
    document.getElementById('stop').addEventListener('click', function() {
        sound.stop(0);
        sound2.stop(0);
        sound3.stop(0)
        sound.isPlaying = false;
        document.getElementById('play').disabled = false;
        document.getElementById('stop').disabled = true;
    });

    document.getElementById('N1').addEventListener('click', function() {
        orderOut = 1;
        orderValue.innerHTML = orderOut;
        limiter.updateOrder(orderOut);
        limiter.out.connect(rotator.in);
    });
    document.getElementById('N2').addEventListener('click', function() {
        orderOut = 2;
        orderValue.innerHTML = orderOut;
        limiter.updateOrder(orderOut);
        limiter.out.connect(rotator.in);
    });
    document.getElementById('N3').addEventListener('click', function() {
        orderOut = 3;
        orderValue.innerHTML = orderOut;
        limiter.updateOrder(orderOut);
        limiter.out.connect(rotator.in);
    });
    

});

	window.addEventListener('deviceorientation', function(evenement) {
		document.getElementById("alpha").innerHTML = Math.round( evenement.alpha );
		document.getElementById("beta").innerHTML = Math.round( evenement.beta );
		updateRotator(Math.round(evenement.alpha), Math.round(evenement.beta));
	}),false;

	var updateRotator = function(alpha, beta) {
		rotator.yaw = lookup[alpha];
		alpha2 = ((alpha+110) % 360);
		rotator2.yaw = lookup[alpha2];
		alpha3 = ((alpha+220) % 360);
		rotator3.yaw = lookup[alpha3];		
		document.getElementById("YAW").innerHTML = rotator.yaw;
		rotator.beta = beta;
		rotator.updateRotMtx();
		rotator2.updateRotMtx();	
	    rotator3.updateRotMtx();		
	};
	
// When the user clicks their mouse on our canvas run this code
function mouseAction(mouse) {
    // Get current mouse coords
    var rect = canvas.getBoundingClientRect();
    var mouseXPos = (mouse.clientX - rect.left);
    var mouseYPos = (mouse.clientY - rect.top);

    // update html values
    document.getElementById("azim-value").innerHTML = mouseXPos;
    document.getElementById("azim-value").innerHTML = mouseXPos;
}



Number.prototype.toRadians = function() {
   return this * Math.PI / 180;
}

function calcDistanceGPS(lat1, lat2, lon1, lon2) {
	var R = 6371e3;
    var y1 = lat1.toRadians();
    var y2 = lat2.toRadians();
    var deltaLat = (lat2-lat1).toRadians();
    var deltaLon = (lon2-lon1).toRadians();

    var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(y1) * Math.cos(y2) *
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return(R * c) ;
}

function calcPosition(coord1, coord2){
	x = calcDistanceGPS(coord1[0], coord1[0], coord1[1], coord2[1]);
	y = calcDistanceGPS(coord1[0], coord2[0], coord1[1], coord1[1]);
	
	if (coord1[1]-coord2[1] > 0 ) { x = -x ;}
	if (coord2[0]-coord1[0] > 0) {y = -y ;}

	return [y,x]; // latitude, longitude
}
function calcDistanceReceiverBordSource(recx,recy,sx,sy,rayon) {
	//coordonnées de l'intersection entre ligne "source receiver" et coverage circle de source
	// y=mx+c
	// données en mètres
    m= (recy-sy)/(recx-sx);
	c=sy-(m*sx);
	A= ((m*m)+1);
	B=2*((m*c)-(m*sy)-sx);
	C=((sy*sy)-(rayon*rayon)+(sx*sx)-(2*(c*sy))+(c*c));
	
	x1=((-B)+Math.sqrt((B*B)-(4*A*C)))/(2*A);
	x2=((-B)-Math.sqrt((B*B)-(4*A*C)))/(2*A);
	y1=(m*x1)+c;
	y2=(m*x2)+c;
	
	//check which of the 2 intersection points is the closer to the receiver
	d1= Math.abs(Math.sqrt(((recx-x1)*(recx-x1))+((recy-y1)*(recy-y1))));
	d2= Math.abs(Math.sqrt(((recx-x2)*(recx-x2))+((recy-y2)*(recy-y2))));
	d= Math.min(d1, d2);
return [x1,y1,x2,y2,d];
}

