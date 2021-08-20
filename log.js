/* callum fisher - corbex11@gmail.com
last updated: 21/6/21 */

const fs = require("fs");

const modulePrefix = "[LOGGER]";

console.log(`${modulePrefix} Running.`);

module.exports = {
	initDate: new Date(),
	log: fetchDate()+" - "+fetchTime(),
	add: function(txt) {
		console.log(fetchTime()+" - "+txt);
		this.log += "\n"+fetchTime()+" - "+txt;
	}
}

writing = false;

function exitHandler(options, err) {
	if (!writing) { // sometimes several exit events are fired, this stops the following code from being triggered twice
		writing = true;
		module.exports.log += `\n! Process is Exiting !`;
		fs.writeFileSync(`./log/${fetchDate()} ${fetchTime().replace(/:/g, '-')}.txt`, module.exports.log);
		console.log(`${fetchTime()} - ${modulePrefix} Recorded log file.`);
		process.exit();
	}
}

function fetchTime() {
	var date = new Date();
	return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function fetchDate() {
	var date = new Date();
	return `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`;
}


/* process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true})); */