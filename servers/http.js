var resources = require('./../resources/model'),
	mqttSubscribers = require('./mqttSubscribers'),
	events1 = require('events'),
	juggleData = new events1.EventEmitter()
	mqtt = require('mqtt'),
	client  = mqtt.connect('mqtt://'+resources.mqttBrokerIP);

var mon = [];
var tue = [];
var wed = [];
var thu = [];
var fri = [];

// start http server
var http = require('http').createServer(handler);
var fs = require('fs');
http.listen(resources.port);
function handler (req, res) {
	fs.readFile(__dirname + '/public/index.html', function(err, data) {
		if (err) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			return res.end("404 Not Found");
		} 
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(data);
		return res.end();
	});
}

// set up LEDs for testing
const Gpio = require('pigpio').Gpio;
const led_green = new Gpio(resources.leds.green.gpio, {mode: Gpio.OUTPUT});
const led_red = new Gpio(resources.leds.red.gpio, {mode: Gpio.OUTPUT});

// handle sockets
var io = require('socket.io')(http);

io.sockets.on('connection', function (socket) {
	// Initialize the LEDs (just for testing)
	socket.emit('led_green', resources.leds.green.value);
	socket.emit('led_red', resources.leds.red.value);
	var lightvalue = 0;
	socket.on('led_green', function(data) {
		lightvalue = data;
		if (lightvalue != led_green.digitalRead()) {
			led_green.digitalWrite(lightvalue);
			resources.leds.green.value = lightvalue;
			juggleData.emit('checkLED', 'green', lightvalue);
		}
	});
	socket.on('led_red', function(data) {
		lightvalue = data;
		if (lightvalue != led_red.digitalRead()) {
			led_red.digitalWrite(lightvalue);
			resources.leds.red.value = lightvalue;
			juggleData.emit('checkLED', 'red', lightvalue);
		}
	});

	socket.on('getPicture', function(room) {
		client.publish('room'+room+'_channel/live', 'anything')
	});

	socket.on('getImage', function(data) {
		juggleData.emit('sendImage', data);
	});

	socket.on('getProg', function(room) {
		juggleData.emit('sendProg', room);
	});

	juggleData.on('sendProg', function (room) {

		var sqlite3 = require('sqlite3').verbose();
		let db = new sqlite3.Database('./resources/sqliteDB/studyCafes.db');
		for (var i = 0; i < 12; i++) {
			getFromDb(db, i, 'Monday', room);
		}
		for (var i = 0; i < 12; i++) {
			getFromDb(db, i, 'Tuesday', room);
		}
		for (var i = 0; i < 12; i++) {
			getFromDb(db, i, 'Wednesday', room);
		}
		for (var i = 0; i < 12; i++) {
			getFromDb(db, i, 'Thursday', room);
		}
		for (var i = 0; i < 12; i++) {
			getFromDb(db, i, 'Friday', room);
		}
		var avg = 0;
		var avgTotal = 0;

		db.each("SELECT id, timeM FROM room" + room + "time", function(err, row) {
			avg += row.timeM;
			avgTotal = avg / row.id;
		});

		db.close((err) => {
			if (err) {
				console.error(err.message);
			}
			socket.emit('sendProg', mon, tue, wed, thu, fri, avgTotal);
		});
	});

	juggleData.on('sendImage', function (data) {
		fs.readFile(__dirname + '/public/images/plot_base.png', function(err, buf){
			socket.emit('image', { image: true, buffer: buf.toString('base64') })
		});
	});

	juggleData.on('checkLED', function (led, status) {
		if(led == "green") {
			socket.emit('led_green', status);
		} else {
			socket.emit('led_red', status);
		}
	});

	// sent from mqtt channels
	socket.emit('room1', resources.auStudyspaces.abogadeStudycafeUpstairs);
	socket.emit('room2', resources.auStudyspaces.abogadeStudycafeDownstairs);
	socket.emit('room3', resources.auStudyspaces.katrinebergLibrary);
	mqttSubscribers.on('room1', function (data) {
		socket.emit('room1', data);
	});
	mqttSubscribers.on('room2', function (data) {
		socket.emit('room2', data);
	});
	mqttSubscribers.on('room3', function (data) {
		socket.emit('room3', data);
	});
	mqttSubscribers.on('led', function (data) {
		if(data == "green_on") {
			socket.emit('led_green', 1);
		} else if(data == "green_off") {
			socket.emit('led_green', 0);
		} else if(data == "red_on") {
			socket.emit('led_red', 1);
		} else if(data == "red_off") {
			socket.emit('led_red', 0);
		}
	});
	mqttSubscribers.on('room_live', function (data) {
		socket.emit('sendPicture', { image: true, buffer: data.toString('base64') })
	});
});

function getFromDb(db, i, weekDay, room) {
	var x = 0;
	db.each("SELECT dbDay, dbHour, dbMinute, dbAmount FROM room" + room + " WHERE dbDay = ? AND dbHour = ?", weekDay, i+8, function(err, row) {
		x += row.dbAmount;
		if(weekDay == 'Monday') {
			mon[i] = Math.round(x/4);
		} else if (weekDay == 'Tuesday') {
			tue[i] = Math.round(x/4);
		} else if (weekDay == 'Wednesday') {
			wed[i] = Math.round(x/4);
		} else if (weekDay == 'Thursday') {
			thu[i] = Math.round(x/4);
		} else if (weekDay == 'Friday') {
			fri[i] = Math.round(x/4);
		}
	});
}



