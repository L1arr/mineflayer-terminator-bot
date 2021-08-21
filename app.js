/* callum fisher - corbex11@gmail.com
last updated: 20/8/21 */

const log = require("./log.js");
const mineflayer = require("mineflayer");
const mfNavigate = require("mineflayer-navigate")(mineflayer);
const mfBloodhound = require("mineflayer-bloodhound")(mineflayer);
const vec3 = require("vec3");
const config = require("./config.json");

const modulePrefix = "[APP]";

log.add(`${modulePrefix} Running.`);

var terminator = {
    bots: {},
    newBot: function(username, password, host, port, version) {
        var id = Object.keys(terminator.bots).length;
        terminator.bots[id] = {
            mf: mineflayer.createBot({
                host: host || config.serverHost,
                port: port || config.serverPort || undefined,
                username: username || config.username || raName().toString(),
                password: password || undefined,
                version: version || config.version,
                verbose: true,
                checkTimeoutInterval: 0
            })
        }
        terminator.bots[id].temp = {
            isReady: false,
            watch: true,
            eatFood: true,
            attackStatus: {
                targeting: false,
                target: "n/a"
            },
            knownItems: config.knownItems,
            isEating: false,
            inventoryBusy: false,
            equipped: {
                weapon: "n/a",
                helmet: "n/a",
                chestplate: "n/a",
                leggings: "n/a",
                boots: "n/a"
            }
        }
        terminator.bots[id].temp.mcData = require('minecraft-data')(terminator.bots[id].mf.version);
        terminator.bots[id].mf.on('spawn', function() {
            log.add(`${modulePrefix} Bot #${id} (${terminator.bots[id].mf.username}) spawned.`);
            if (!terminator.bots[id].temp.isReady) {
                log.add(`${modulePrefix} Connected bot #${id} (${terminator.bots[id].mf.username}) to ${terminator.bots[id].mf.host}${terminator.bots[id].mf.port ? ":" + terminator.bots[id].mf.port : ""}`);
                terminator.bots[id].temp.isReady = true;
                terminator.bots[id].mf.chat(`/register ${config.inGamePassword} ${config.inGamePassword}`);
                terminator.bots[id].mf.chat(`/login ${config.inGamePassword}`);
                terminator.bots[id].mf.chat("test")
            }
        });
    }
}

function getNearestEntity (type, bot) {
    let id
    let entity
    let dist
    let best = null
    let bestDistance = null
    for (id in terminator.bots[bot].mf.entities) {
        entity = terminator.bots[bot].mf.entities[id]
        if (type && entity.type !== type) continue
        if (entity === terminator.bots[bot].mf.entity) continue
        dist = terminator.bots[bot].mf.entity.position.distanceTo(entity.position);
        if (!best || dist < bestDistance) {
            best = entity
            bestDistance = dist
        }
    }
    return best;
}

function getNearestEntityOnSameY (type, bot) {
    let id
    let entity
    let dist
    let best = null
    let bestDistance = null
    for (id in terminator.bots[bot].mf.entities) {
        entity = terminator.bots[bot].mf.entities[id]
        if (type && entity.type !== type) continue
        if (entity === terminator.bots[bot].mf.entity) continue
        if (entity.position.y < terminator.bots[bot].mf.entity.position.y) continue // if entity is lower than bot Y + 1, ignore
        dist = terminator.bots[id].mf.entity.position.distanceTo(entity.position);
        if (!best || dist < bestDistance) {
            best = entity
            bestDistance = dist
        }
    }
    return best;
}

function equipItem (type, id) {
    return new Promise(function(resolve, reject) { // 1 - equipped successfully, 0 - error occurred / doesn't have item
        var interval = setInterval(function() {
            if (!terminator.bots[bot].temp.inventoryBusy) {
                clearInterval(interval);
                terminator.bots[id].temp.inventoryBusy = true;
                var best = "";
                for (var i = 0; i < Object.keys(terminator.bots[id].mf.inventory.slots).length; i++) {
                    if (terminator.bots[id].mf.inventory.slots[i] !== null) {
                        if (terminator.bots[id].temp.knownItems[type].includes(terminator.bots[id].mf.inventory.slots[i].name)) { // if this item is indexed:
                            if (best !== "") { // if another best item was previously found:
                                if (terminator.bots[id].temp.knownItems[type].indexOf(terminator.bots[id].mf.inventory.slots[i].name) > terminator.bots[id].temp.knownItems[type].indexOf(best)) { // if it's of higher priority than the last item checked:
                                    best = terminator.bots[id].mf.inventory.slots[i].name; // set new best item
                                }
                            } else { // otherwise if no best item has been set:
                                best = terminator.bots[id].mf.inventory.slots[i].name; // set this item as the current best item
                            }
                        }
                    }
                }
                if (best) {
                    if (terminator.bots[id].temp.equipped[type] !== best) {
                        terminator.bots[id].temp.equipped[type] = best;
                        log.add(`${modulePrefix} User #${id} (${terminators.bots[id].mf.username}) is equipping ${type} ${best}`);
                        terminator.bots[id].mf.equip(terminator.bots[id].temp.mcData.itemsByName[best].id, type == "helmet" ? "head" : type == "chestplate" ? "torso" : type == "leggings" ? "legs" : type == "feet" ? "feet" : "hand", (err) => { // correlate the item's type to a body part and equip the chosen best item
                            if (err) {
                                resolve(0);
                                terminator.bots[id].temp.inventoryBusy = false;
                                return console.log(err.message);
                            } else {
                                resolve(1);
                                terminator.bots[id].temp.inventoryBusy = false;
                            }
                        });
                    } else {
                        resolve(1);
                        terminator.bots[id].temp.inventoryBusy = false;
                    }
                } else {
                    resolve(0);
                    terminator.bots[id].temp.inventoryBusy = false;
                }
            }
        }, 800);
    });
}

function equipArmor(bot) {
    terminator.bots[bot].temp.functions.equip("helmet");
    terminator.bots[bot].temp.functions.equip("chestplate");
    terminator.bots[bot].temp.functions.equip("leggings");
    terminator.bots[bot].temp.functions.equip("boots");
}

const adjectives = [
    'unique',    'unkempt',      'unknown',    'unnatural', 'unruly',
    'unsightly', 'unsuitable',   'untidy',     'unused',    'unusual',
    'unwieldy',  'unwritten',    'upbeat',     'uppity',    'upset',
    'uptight',   'used',         'useful',     'useless',   'utopian',
    'utter',     'uttermost',    'vacuous',    'vagabond',  'vague',
    'valuable',  'various',      'vast',       'vengeful',  'venomous',
    'verdant',   'versed',       'victorious', 'vigorous',  'violent',
    'violet',    'vivacious',    'voiceless',  'volatile',  'voracious',
    'vulgar',    'wacky',        'waggish',    'waiting',   'heavy',
    'wakeful',   'wandering',    'wanting',    'warlike',   'warm',
    'wary',      'wasteful',     'watery',     'weak',      'wealthy',
    'weary',     'groomed',      'broken',     'ludicrous', 'poor',
    'wet',       'whimsical',    'whispering', 'white',     'whole',
    'wholesale', 'wicked',       'wide',       'wide',      'wiggly',
    'wild',      'willing',      'windy',      'wiry',      'wise',
    'wistful',   'witty',        'woebegone',  'womanly',   'wonderful',
    'wooden',    'woozy',        'workable',   'worried',   'worthless',
    'wrathful',  'wretched',     'wrong',      'wry',       'xenophobic',
    'yellow',    'yielding',     'young',      'youthful',  'yummy',
    'zany',      'zealous',      'zesty',      'zippy',     'zonked'
];

const nouns = [
    'half-sister', 'halibut',      'hall',         'hallway',   'hamburger',
    'hammer',      'hamster',      'hand',         'handball',  'handicap',
    'handle',      'handsaw',      'harbor',       'hardboard', 'hardcover',
    'hardhat',     'hardware',     'harmonica',    'harmony',   'harp',
    'hat',         'hate',         'hawk',         'head',      'headlight',
    'headline',    'health',       'hearing',      'heart',     'heat',
    'heaven',      'hedge',        'height',       'helen',     'helicopter',
    'helium',      'hell',         'helmet',       'help',      'hemp',
    'hen',         'heron',        'herring',      'hexagon',   'hill',
    'himalayan',   'hip',          'hippopotamus', 'history',   'hobbies',
    'hockey',      'hoe',          'hole',         'holiday',   'home',
    'honey',       'hood',         'hook',         'hope',      'horn',
    'horse',       'hose',         'hospital',     'hot',       'hour',
    'hourglass',   'house',        'hovercraft',   'hub',       'hubcap',
    'humidity',    'humor',        'hurricane',    'hyacinth',  'hydrant',
    'hydrofoil',   'hydrogen',     'hyena',        'hygienic',  'ice',
    'icebreaker',  'icicle',       'icon',         'idea',      'ikebana',
    'illegal',     'imprisonment', 'improvement',  'impulse',   'inch',
    'income',      'increase',     'index',        'india',     'indonesia',
    'industry',    'ink',          'innocent',     'input',     'insect'
];

function raName() {
    return adjectives[Math.random() * adjectives.length | 0] + nouns[Math.random() * nouns.length | 0] + Math.floor(Math.random() * 99)
}

function sleep(ms) { // https://stackoverflow.com/questions/14249506/
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
} 

async function init() {
    for (var i = 0; i < config.total; i++) {
        terminator.newBot(config.username, config.password, config.serverHost, config.serverPort, config.version);
        await sleep(6000); // delay between connections prevents some servers from kicking the client
    }
}

init();