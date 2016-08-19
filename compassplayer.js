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
var sound_3 = "sounds/move.wav";
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

function mixer(audioCtx, source1, source2){
//works also to connect everything to context.destination

	if (source1.channelCount != source2.channelCount){
		console.log("The 2 sources have different number of channels");
		return (0);
	}
	
	nbCh = source1.channelCount;
	merger = audioCtx.createChannelMerger(nbCh);
	
	split1 = audioCtx.createChannelSplitter(nbCh);
	split2 = audioCtx.createChannelSplitter(nbCh);
	
	source1.connect(split1);
	source2.connect(split2);
	
	for (var ch=0 ; ch < nbCh ; ch++ ){
		split1.connect(merger, ch, ch);
		split2.connect(merger, ch, ch);		
	}
	return merger;	
}


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

//mix = mixer(context, gain1, gain2);
//mix.connect(decoder.in);
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