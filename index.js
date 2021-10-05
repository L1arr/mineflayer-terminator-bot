/* callum fisher - corbex11@gmail.com
last updated: 18/8/21 */

const editJsonFile = require("edit-json-file");
const fs = require("fs");

const module_prefix = "[LAUNCHER]";

console.log(`${module_prefix} Running.`);

const conKeys = {
	"configReady": false,
	"firstTimeRun": true,
	"quietLogging": true,
	"serverHost": "95.111.249.143",
	"serverPort": "10000",
	"username": "",
	"password": "",
	"inGamePassword": "",
	"total": 1,
	"version": "1.16.3",
	"language": "english",
	"knownItems": {
		helmet: [ // low priority to high priority
			"leather_helmet",
			"iron_helmet",
			"golden_helmet",
			"diamond_helmet",
			"netherite_helmet"
		],
		chestplate: [ // low priority to high priority
			"leather_chestplate",
			"iron_chestplate",
			"golden_chestplate",
			"diamond_chestplate",
			"netherite_chestplate"
		],
		leggings: [ // low priority to high priority
			"leather_leggings",
			"iron_leggings",
			"golden_leggings",
			"diamond_leggings",
			"netherite_leggings
		],
		boots: [ // low priority to high priority
			"leather_boots",
			"iron_boots",
			"golden_boots",
			"diamond_boots",
			"netherite_boots"
		],
		food: [ // low priority to high priority
			"sweet_berries",
			"bread",
			"baked_potato",
			"cooked_chicken",
			"golden_apple"
		],
		weapon: [ // low priority to high priority
			"wooden_axe",
			"wooden_sword",
			"stone_axe",
			"stone_sword",
			"iron_axe",
			"iron_sword",
			"golden_axe",
			"golden_sword",
			"diamond_sword",
			"diamond_axe",
			"netherite_sword",
			"netherite_axe"
		]
	}
}

const dirs = [
	"language",
	"log"
];

dirs.forEach(dir => { // Create missing directories:
    if (!fs.existsSync("./"+dir)) {
		fs.mkdirSync("./"+dir);
		console.log(`${module_prefix} Made missing directory: "${dir}"`);
	}
});

const config = editJsonFile("./config.json");

if (config.data.firstTimeRun == undefined) {
    config.set("firstTimeRun", true);
} else if (config.data.firstTimeRun) {
    config.set("firstTimeRun", false);
}

Object.keys(conKeys).forEach(key => { // Check the keys currently in the configuration file for missing keys and add those missing keys:
	if (!Object.keys(config.data).includes(key)) {
		if (!config.data.quietLogging) console.log(`${module_prefix} [configuration] > Adding missing key "${key}" with value: ${JSON.stringify(conKeys[key])}`);
		config.set(key, conKeys[key]);
	}
});

Object.keys(config.data).forEach(key => { // Check the keys currently in the configuration file for unknown keys and remove those unknown keys:
	if (!Object.keys(conKeys).includes(key)) {
		if (!config.data.quietLogging) console.log(`${module_prefix} [configuration] > Removing unknown key "${key}"`);
		delete config.data[key];
	}
});

if (!config.data.quietLogging) console.log(`${module_prefix} [configuration] >> Using the following options:`);

Object.keys(config.data).forEach(key => { // Print out the key values being used:
	if (!config.data.quietLogging) console.log(`${module_prefix} [configuration] - ${key}: ${JSON.stringify(config.data[key])}`);
});

config.save();

if (!config.data.configReady) {
	console.log(`${module_prefix} Please fill in your configuration file (config.json) and change "configReady" to "true".`);
	process.exit();
}

const log = require("./log.js");

if (!fs.existsSync("./language/"+config.data.language+".json")) {
	log.add(`${module_prefix} [localization] >> Language file "${config.data.language}.json" not found`);
	lang = {};
} else {
	log.add(`${module_prefix} [localization] >> Found localization file "${config.data.language}.json"`);
	lang = require("./language/"+config.data.language+".json");
}

log.add(`${module_prefix} ${config.data.firstTimeRun ? lang.newuser || "Welcome!" : lang.olduser || "Welcome back." }`);
log.add(`${module_prefix} ${lang.startapp || "Starting application.."}`);

require("./app.js");
