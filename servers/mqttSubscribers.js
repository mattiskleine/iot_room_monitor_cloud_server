var resources = require('./../resources/model'),
	mqtt = require('mqtt'),
	client  = mqtt.connect('mqtt://'+resources.mqttBrokerIP),
	events = require('events'),
	toWebsockets = new events.EventEmitter(),
	sqlite3 = require('sqlite3').verbose(),
	db = new sqlite3.Database('./resources/sqliteDB/studyCafes.db');

module.exports = toWebsockets;

client.on('connect', function () {
	client.subscribe('room1_channel');
	client.subscribe('room2_channel');
	client.subscribe('room3_channel');
	client.subscribe('led_channel');
	client.subscribe('room1_channel/livereceive');
	client.subscribe('room2_channel/livereceive');
	client.subscribe('room3_channel/livereceive');
	client.subscribe('room1_channel/ultrasonic');
	client.subscribe('room2_channel/ultrasonic');
	client.subscribe('room3_channel/ultrasonic');
	console.log("MQTT ready!");
})

client.on('message', function (topic, message) {
	if(topic == "room1_channel") {
		contextString = message.toString();
		context = parseInt(contextString, 10);
		toWebsockets.emit('room1', context);
		updateDb('room1', context);
	}
	if(topic == "room2_channel") {
		contextString = message.toString();
		context = parseInt(contextString, 10);
		toWebsockets.emit('room2', context);
		updateDb('room2', context);
	}
	if(topic == "room3_channel") {
		contextString = message.toString();
		context = parseInt(contextString, 10);
		toWebsockets.emit('room3', context);
		updateDb('room3', context);
	}
	if(topic == "led_channel") {
		context = message.toString();
		toWebsockets.emit('led', context);
	}
	if(topic == "room1_channel/livereceive") {
		context = message.toString();
		toWebsockets.emit('room_live', context);
	}
	if(topic == "room2_channel/livereceive") {
		context = message.toString();
		toWebsockets.emit('room_live', context);
	}
	if(topic == "room3_channel/livereceive") {
		context = message.toString();
		toWebsockets.emit('room_live', context);
	}
	if(topic == "room1_channel/ultrasonic") {
		contextString = message.toString();
		context = parseInt(contextString, 10);
		db.run("INSERT INTO room1time(timeM) VALUES (?)", context);
		console.log('received average sitting time');
	}
})

function updateDb(room, amount) {
	
	var date = new Date();
	Date.prototype.getWeekday = function() {
		var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		return weekday[this.getDay()];
	}
	var day = date.getWeekday();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	if (minutes < 15) {
		minutes = "00";
	} else if (minutes < 30) {
		minutes = "15";
	} else if (minutes < 45) {
		minutes = "30";
	} else if (minutes < 60) {
		minutes = "45";
	}

	db.run("UPDATE " + room + " SET dbAmount=? WHERE dbDay=? AND dbHour=? AND dbMinute=?", amount, day, hours, minutes);
}

function updateDbTime(room, amount) {
	db.run("INSERT INTO " + room + "time(timeM) VALUES (?)", amount);
	
	var avg = 0;
	var avgTotal = 0;
	db.each("SELECT id, timeM FROM " + room * "time", function(err, row) {
		avg += row.timeM;
		avgTotal = avg / row.id;
	});
}

// mqtt pub -t 'room1_channel' -h '192.168.8.103' -m '99'
// mosquitto_pub -h 192.168.8.103 -t "room1_channel" -m "99"
// mosquitto_pub -h test.mosquitto.org -t "room1_channel" -m "40"

