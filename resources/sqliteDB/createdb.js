initiateDatabase();

function initiateDatabase() {
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
	var amount = 15;

	var mon1 = [5,8,14,20,22,20,17,14,12,9,5];
	var tue1 = [6,9,15,21,25,23,17,15,13,10,8];
	var wed1 = [4,6,8,12,18,20,17,13,9,6,4];
	var thu1 = [5,9,12,21,28,23,17,15,13,16,4];
	var fri1 = [5,9,15,27,25,32,17,14,6,0,0];

	var mon2 = [4,5,7,12,19,22,20,17,13,8,6];
	var tue2 = [7,8,16,20,26,22,19,12,12,10,6];
	var wed2 = [8,3,12,16,24,25,21,19,15,10,8];
	var thu2 = [2,8,13,26,32,31,27,22,17,16,9];
	var fri2 = [6,7,13,24,22,31,26,18,5,0,0];

	var mon3 = [9,11,12,16,19,19,18,18,14,8,6];
	var tue3 = [3,4,5,9,12,12,13,11,7,6,5];
	var wed3 = [6,7,8,9,12,18,17,16,15,11,9];
	var thu3 = [8,9,15,24,29,32,28,21,18,12,8];
	var fri3 = [0,2,5,6,4,8,11,9,7,5,2];

	var sqlite3 = require('sqlite3').verbose();
	let db = new sqlite3.Database('./studyCafes.db');

	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS room1 (dbDay TEXT, dbHour TEXT, dbMinute TEXT, dbAmount INT)");
		db.run("CREATE TABLE IF NOT EXISTS room2 (dbDay TEXT, dbHour TEXT, dbMinute TEXT, dbAmount INT)");
		db.run("CREATE TABLE IF NOT EXISTS room3 (dbDay TEXT, dbHour TEXT, dbMinute TEXT, dbAmount INT)");
		db.run("CREATE TABLE IF NOT EXISTS room1time (id INTEGER PRIMARY KEY, timeM INT)");
		db.run("CREATE TABLE IF NOT EXISTS room2time (id INTEGER PRIMARY KEY, timeM INT)");
		db.run("CREATE TABLE IF NOT EXISTS room3time (id INTEGER PRIMARY KEY, timeM INT)");

		console.log('database and tables created!');
		console.log('writing simulated data to database...');

		writeSimulation(db, 'room1', 'Monday', mon1);
		writeSimulation(db, 'room1', 'Tuesday', tue1);
		writeSimulation(db, 'room1', 'Wednesday', wed1);
		writeSimulation(db, 'room1', 'Thursday', thu1);
		writeSimulation(db, 'room1', 'Friday', fri1);

		writeSimulation(db, 'room2', 'Monday', mon2);
		writeSimulation(db, 'room2', 'Tuesday', tue2);
		writeSimulation(db, 'room2', 'Wednesday', wed2);
		writeSimulation(db, 'room2', 'Thursday', thu2);
		writeSimulation(db, 'room2', 'Friday', fri2);

		writeSimulation(db, 'room3', 'Monday', mon3);
		writeSimulation(db, 'room3', 'Tuesday', tue3);
		writeSimulation(db, 'room3', 'Wednesday', wed3);
		writeSimulation(db, 'room3', 'Thursday', thu3);
		writeSimulation(db, 'room3', 'Friday', fri3);

		db.run("INSERT INTO room1time(timeM) VALUES (55)");
		db.run("INSERT INTO room2time(timeM) VALUES (37)");
		db.run("INSERT INTO room3time(timeM) VALUES (68)");

/*
		var avg = 0;
		var avgTotal = 0;

		db.each("SELECT id, timeM FROM room1time", function(err, row) {
			avg += row.timeM;
			avgTotal = avg / row.id;
			console.log(avgTotal);
		});

		//db.run("UPDATE room1 SET dbAmount=? WHERE dbDay='Monday' AND dbHour='8' AND dbMinute='30'", 20);
		db.each("SELECT dbDay, dbHour, dbMinute, dbAmount FROM room1", function(err, row) {
			console.log(row.dbDay, row.dbHour, row.dbMinute, row.dbAmount);
		});

		var value = 0;
		var entries = 0;
		var avg = 0;
		db.each("SELECT id, timeM FROM " + room + "time", function(err, row) {
			value += row.timeM;
			entries = row.id;
			avg = value / entries;
			console.log(avg);
		});
*/
	});

	db.close((err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('database initialized!');
	});
}

function writeSimulation (db, room, weekDay, data) {
	for (var i = 0; i < 11; i++) {
		db.run("INSERT INTO " + room + " VALUES (?,?,?,?)", weekDay, i+8, '00', data[i]);
		db.run("INSERT INTO " + room + " VALUES (?,?,?,?)", weekDay, i+8, '15', data[i]);
		db.run("INSERT INTO " + room + " VALUES (?,?,?,?)", weekDay, i+8, '30', data[i]);
		db.run("INSERT INTO " + room + " VALUES (?,?,?,?)", weekDay, i+8, '45', data[i]);
	}
}
