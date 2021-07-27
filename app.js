/* callum fisher - corbex11@gmail.com
last updated: 27/7/2021 */

const log = require("./log.js");
const mineflayer = require("mineflayer");
const mfnavigate = require("mineflayer-navigate")(mineflayer);
const bloodhoundPlugin = require("mineflayer-bloodhound")(mineflayer);
const vec3 = require("vec3");
const config = require("./config.json");

const modulePrefix = "[APP]";

log.add(`${modulePrefix} Running.`);

terminator = {
	serverAddress: config.serverAddress,
	inGamePassword: config.inGamePassword,
	bots: {},
	clearData: function(_id) {
		if (typeof terminator.bots[_id] !== "undefined") {
			console.log(`Clearing data for user #${_id}.`);
			clearInterval(terminator.bots[_id].temp.lookatint);
			clearInterval(terminator.bots[_id].temp.managefoodint);
			clearInterval(terminator.bots[_id].temp.updatenearestentint);
			if (terminator.bots[_id].temp.attackStatus.targeting) {
				terminator.bots[_id].temp.attackStatus.targeting = false;
				terminator.bots[_id].temp.attackStatus.target = "n/a";
				clearInterval(terminator.bots[_id].temp.attackint);
				clearInterval(terminator.bots[_id].temp.navigationint);
				clearInterval(terminator.bots[_id].temp.navigationint2);
				clearInterval(terminator.bots[_id].temp.checkcompleteint);
			}
			delete terminator.bots[_id];
		}
	},
	newBot: function(username, serverAccount) {
		return new Promise(function(resolve, reject) { // resolve 1 = successfully joined game, resolve 0 = timed out joining game
			var _id = Object.keys(terminator.bots).length;
			setTimeout(function() {
				if (!terminator.bots[_id].temp.isReady) {
					resolve({
						"res": 0,
						"_id": _id,
						"username": username
					});
					console.log(`Failed to add user #${_id} (${username}) to ${terminator.serverAddress}`);
					terminator.bots[_id].mf.quit();
					terminator.clearData(_id);
				}
			}, 60000);
			// create user data ++
			terminator.bots[_id] = {
				mf: mineflayer.createBot({
					host: terminator.serverAddress,
					username: username,
					version: "1.16.3",
					verbose: true,
					checkTimeoutInterval: 0
				}),
				temp: {
					ready: false,
					watch: true,
					eatFood: true,
					attackStatus: {
						targeting: false,
						target: "n/a"
					},
					knownItems: {
						helmet: [ // low priority to high priority
							"leather_helmet",
							"iron_helmet",
							"golden_helmet",
							"diamond_helmet"
						],
						chestplate: [ // low priority to high priority
							"leather_chestplate",
							"iron_chestplate",
							"golden_chestplate",
							"diamond_chestplate"
						],
						leggings: [ // low priority to high priority
							"leather_leggings",
							"iron_leggings",
							"golden_leggings",
							"diamond_leggings"
						],
						boots: [ // low priority to high priority
							"leather_boots",
							"iron_boots",
							"golden_boots",
							"diamond_boots"
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
							"diamond_axe"
						]
					},
					isEating: false,
					inventoryBusy: false,
					equipped: {
						weapon: "n/a",
						helmet: "n/a",
						chestplate: "n/a",
						leggings: "n/a",
						boots: "n/a"
					},
					functions: {
						getNearestEntity: function(type) {
							let id
							let entity
							let dist
							let best = null
							let bestDistance = null
							for (id in terminator.bots[_id].mf.entities) {
								entity = terminator.bots[_id].mf.entities[id]
								if (type && entity.type !== type) continue
								if (entity === terminator.bots[_id].mf.entity) continue
								// if (entity.position.y < bots[${bots_id}].entity.position.y+1) continue
								dist = terminator.bots[_id].mf.entity.position.distanceTo(entity.position);
								if (!best || dist < bestDistance) {
									best = entity
									bestDistance = dist
								}
							}
							return best;
						},
						getNearestEntityOnSameY: function(type) {
							let id
							let entity
							let dist
							let best = null
							let bestDistance = null
							for (id in terminator.bots[_id].mf.entities) {
								entity = terminator.bots[_id].mf.entities[id]
								if (type && entity.type !== type) continue
								if (entity === terminator.bots[_id].mf.entity) continue
								if (entity.position.y < terminator.bots[_id].mf.entity.position.y) continue // if entity is lower than bot Y + 1, ignore
								dist = terminator.bots[_id].mf.entity.position.distanceTo(entity.position);
								if (!best || dist < bestDistance) {
									best = entity
									bestDistance = dist
								}
							}
							return best;
						},
						equip: function(type) {
							return new Promise(function(resolve, reject) {
								var interval = setInterval(function() {
									if (!terminator.bots[_id].temp.inventoryBusy) {
										clearInterval(interval);
										terminator.bots[_id].temp.inventoryBusy = true;
										/* var best = "";
										var i = -1;
										var int = setInterval(function() {
											i++; */
										var best = "";
										for (var i = 0; i < Object.keys(terminator.bots[_id].mf.inventory.slots).length; i++) {
											if (terminator.bots[_id].mf.inventory.slots[i] !== null) {
												if (terminator.bots[_id].temp.knownItems[type].includes(terminator.bots[_id].mf.inventory.slots[i].name)) { // if this item is indexed:
													if (best !== "") { // if another best item was previously found:
														if (terminator.bots[_id].temp.knownItems[type].indexOf(terminator.bots[_id].mf.inventory.slots[i].name) > terminator.bots[_id].temp.knownItems[type].indexOf(best)) { // if it's of higher priority than the last item checked:
															best = terminator.bots[_id].mf.inventory.slots[i].name; // set new best item
														}
													} else { // otherwise if no best item has been set:
														best = terminator.bots[_id].mf.inventory.slots[i].name; // set this item as the current best item
													}
												}
											}
										}
											// if (i >= Object.keys(terminator.bots[_id].mf.inventory.slots).length - 1) { // done checking all inventory slots:
												// clearInterval(int);
												if (best) {
													if (terminator.bots[_id].temp.equipped[type] !== best) {
														terminator.bots[_id].temp.equipped[type] = best;
														console.log(`User #${_id} (${username}) is equipping ${type} ${best}`);
														terminator.bots[_id].mf.equip(terminator.bots[_id].temp.mcData.itemsByName[best].id, type == "helmet" ? "head" : type == "chestplate" ? "torso" : type == "leggings" ? "legs" : type == "feet" ? "feet" : "hand", (err) => { // correlate the item's type to a body part and equip the chosen best item
															if (err) {
																resolve(0);
																terminator.bots[_id].temp.inventoryBusy = false;
																return console.log(err.message);
															} else {
																resolve(1);
																terminator.bots[_id].temp.inventoryBusy = false;
															}
														});
													} else {
														resolve(1);
														terminator.bots[_id].temp.inventoryBusy = false;
													}
												} else {
													resolve(0);
													terminator.bots[_id].temp.inventoryBusy = false;
												}
											// }
										// }, 0);
									}
								}, 800);
							});
						},
						equipArmor: function() {
							terminator.bots[_id].temp.functions.equip("helmet");
							terminator.bots[_id].temp.functions.equip("chestplate");
							terminator.bots[_id].temp.functions.equip("leggings");
							terminator.bots[_id].temp.functions.equip("boots");
						},
						eatFood: function() {
							return new Promise(function(resolve, reject) {
								var interval = setInterval(function() {
									// for testing:
									// console.log(`${terminator.bots[_id].temp.iseating} ${terminator.bots[_id].temp.isequippingweapon} ${terminator.bots[_id].temp.isequippingarmor}`);
									// console.log(`current equipment: ${terminator.bots[_id].temp.currentweapon} ${JSON.stringify(terminator.bots[_id].temp.currentarmor)}`);
									// console.log(`current health: ${terminator.bots[_id].mf.health}/20, current food: ${JSON.stringify(terminator.bots[_id].mf.food)}/20`);
									if (!terminator.bots[_id].temp.inventoryBusy) {
										clearInterval(interval);
										terminator.bots[_id].temp.inventoryBusy = true;
										terminator.bots[_id].temp.equip("food").then(() => {
											terminator.bots[_id].mf.consume((err) => {
												if (err) {
													resolve(0);
													terminator.bots[_id].temp.inventoryBusy = false;
													return console.log(err.message);
												} else {
													resolve(1);
													setTimeout(function() {
														terminator.bots[_id].temp.inventoryBusy = false;
													}, 4000);
												}
											});
										});
											if (i >= Object.keys(terminator.bots[_id].mf.inventory.slots).length - 1) { // done checking all inventory slots:
												clearInterval(int);
												if (best) {
													console.log(`User #${_id} (${username}) is eating ${best}`);
													terminator.bots[_id].mf.equip(terminator.bots[_id].temp.mcData.itemsByName[best].id, 'hand', (err) => { // equip the best food
														if (err) {
															resolve(0);
															terminator.bots[_id].temp.iseating = false;
															return console.log(err.message);
														} else {
															terminator.bots[_id].temp.currentweapon = "n/a";
															terminator.bots[_id].mf.consume((err) => {
																if (err) {
																	resolve(0);
																	terminator.bots[_id].temp.iseating = false;
																	return console.log(err.message);
																} else {
																	resolve(1);
																	setTimeout(function() {
																		terminator.bots[_id].temp.iseating = false;
																	}, 4000);
																}
															});
														}
													});
												} else {
													resolve(0);
													terminator.bots[_id].temp.iseating = false;
												}
											}
									}
								}, 800);
							});
						},
						terminatePlayer: function(target, persistent) {
							/* if persistent = true then:
							   - the bot won't retreat if the bot's health is below ten
							   - bot will wait for player's entity to appear again (be in range) if it disappears (go out of range)
							*/
							return new Promise(function(resolve, reject) {
								var execute = function() {
									try {
										terminator.bots[_id].mf.navigate.to(terminator.bots[_id].mf.players[target].entity.position);
									} catch (err) {
										console.log(`User #${_id} (${username}) navigation result is an error:\n${err}\nTarget likely too far away.`);
										terminator.bots[_id].mf.navigate.currentlybusy = false;
									}
								}
									/*// initial checks:
									if (!terminator.bots[_id].mf.players[target]) {
										resolve(2); // no such player
									} else if (target == username) {
										resolve(3); // cannot attack self
									} else if (!terminator.bots[_id].mf.players[target].entity) {
										resolve(5); // out of range
									} else {
										console.log(`User #${_id} (${username}) has been tasked with killing the player "${target}"`);
										// preparation ++
										terminator.bots[_id].temp.functions.equipArmor();
										var usenavigationplugin = true;
										terminator.bots[_id].temp.attackStatus.targeting = true;
										terminator.bots[_id].temp.attackStatus.target = target;
										var end = function() { // function to end intervals and reset intervals when done killing player:
											terminator.bots[_id].temp.attackStatus.targeting = false;
											terminator.bots[_id].temp.attackStatus.target = "n/a";
											clearInterval(terminator.bots[_id].temp.attackint);
											clearInterval(terminator.bots[_id].temp.checkcompleteint);
											clearInterval(terminator.bots[_id].temp.navigationint);
											clearInterval(terminator.bots[_id].temp.navigationint2);
											terminator.bots[_id].mf.setControlState("forward", false);
											terminator.bots[_id].mf.setControlState("jump", false);
											terminator.bots[_id].temp.watch = true;
											terminator.bots[_id].temp.watchentity = terminator.bots[_id].temp.functions.getNearestEntityOnSameY("player");
											if (terminator.bots[_id].temp.updatenearestentint._destroyed) {
												terminator.bots[_id].temp.updatenearestentint = setInterval(function() {
													terminator.bots[_id].temp.watchentity = terminator.bots[_id].temp.functions.getNearestEntityOnSameY("player");
												}, 5000);
											}
										}
										var gototarget = function() { // use mineflayer-navigate to reach the target:
											try {
												terminator.bots[_id].mf.navigate.to(terminator.bots[_id].mf.players[target].entity.position);
											} catch (err) {
												console.log(`User #${_id} (${username}) navigation result is an error:\n${err}\nTarget likely too far away.`);
												terminator.bots[_id].mf.navigate.currentlybusy = false;
											}
										}
										gototarget();
										// preparation --
										// interval to operate the gototarget function while killing the player ++
										terminator.bots[_id].temp.navigationint = setInterval(function() {
											if (usenavigationplugin) {
												if (!terminator.bots[_id].mf.navigate.currentlybusy) {
													gototarget();
												}
											}
											if (terminator.bots[_id].mf.health < 11 && persistent == false) { // retreat:
												resolve(0);
												end();
												setTimeout(function() {
													terminator.bots[_id].mf.setControlState("back", true);
													setTimeout(function() {
														terminator.bots[_id].mf.setControlState("back", false);
													}, 5000);
												}, 2000);
											}
										}, 5000);
										// interval to operate the gototarget function while killing the player -- 
										// interval to operate the change the navigation mode from mineflayer-navigate to a simple run and jump function ++
										terminator.bots[_id].temp.navigationint2 = setInterval(function() {
											if (terminator.bots[_id].mf.players[target]) { // if target in server:
												if (terminator.bots[_id].mf.players[username].entity) {
													if (terminator.bots[_id].mf.players[target].entity) { // if target entity exists: (they're not dead/out of range)
														if ((Math.abs(Math.floor(terminator.bots[_id].mf.players[target].entity.position.x) - Math.floor(terminator.bots[_id].mf.players[username].entity.position.x)) >= 6) == false && (Math.abs(Math.floor(terminator.bots[_id].mf.players[target].entity.position.z) - Math.floor(terminator.bots[_id].mf.players[username].entity.position.z)) >= 6) == false) {
															if (usenavigationplugin) {
																console.log(`User #${_id} (${username}) navigation switching to dummy mode.`);
																usenavigationplugin = false;
																if (!terminator.bots[_id].mf.navigate.currentlybusy) {
																	terminator.bots[_id].mf.setControlState("forward", true);
																	terminator.bots[_id].mf.setControlState("jump", true);
																}
																clearInterval(terminator.bots[_id].temp.updatenearestentint);
																terminator.bots[_id].temp.watchentity = terminator.bots[_id].mf.players[target].entity;
																terminator.bots[_id].temp.watch = true;
															} else {
																if (!terminator.bots[_id].mf.navigate.currentlybusy) {
																	terminator.bots[_id].mf.setControlState("forward", true);
																	terminator.bots[_id].mf.setControlState("jump", true);
																}
																clearInterval(terminator.bots[_id].temp.updatenearestentint);
																terminator.bots[_id].temp.watchentity = terminator.bots[_id].mf.players[target].entity;
																terminator.bots[_id].temp.watch = true;
															}
														} else {
															if (!usenavigationplugin) {
																console.log(`User #${_id} (${username}) navigation switching to pathfinding mode.`);
																usenavigationplugin = true;
																terminator.bots[_id].mf.setControlState("forward", false);
																terminator.bots[_id].mf.setControlState("jump", false);
																if (terminator.bots[_id].temp.updatenearestentint._destroyed) {
																	terminator.bots[_id].temp.updatenearestentint = setInterval(function() {
																		terminator.bots[_id].temp.watchentity = terminator.bots[_id].temp.functions.getNearestEntityOnSameY("player");
																	}, 5000);
																}
															} else {
																if (terminator.bots[_id].temp.updatenearestentint._destroyed) {
																	terminator.bots[_id].temp.updatenearestentint = setInterval(function() {
																		terminator.bots[_id].temp.watchentity = terminator.bots[_id].temp.functions.getNearestEntityOnSameY("player");
																	}, 5000);
																}
															}
														}
													}
												}
											}
										}, 1000);
										// interval to operate the change the navigation mode from mineflayer-navigate to a simple run and jump function ++
										// interval to manage weapons and attacking the target ++
										terminator.bots[_id].temp.attackint = setInterval(function() {
											if (terminator.bots[_id].mf.players[target]) {
												if (terminator.bots[_id].mf.players[target].entity) {
													terminator.bots[_id].mf.attack(terminator.bots[_id].mf.players[target].entity);
													terminator.bots[_id].temp.functions.equip("weapon");
												}
											}
										}, 800);
										// interval to manage weapons and attacking the target --
										// interval to manage checking whether or not the bot is done with the current target ++
										terminator.bots[_id].temp.checkcompleteint = setInterval(function() {
											if (terminator.bots[_id].mf.players[target]) {
												if (terminator.bots[_id].mf.players[username].entity) {
													if (terminator.bots[_id].mf.players[target].entity) {
														if (0 >= terminator.bots[_id].mf.players[target].entity.metadata[8]) {
															resolve(1); // target dead
															end();
														}
													} else {
														resolve(5); // target out of range/location unknown (since we don't really don't really know that they're dead)
														end();
													}
												} else {
													resolve(6); // bot died
													end();
												}
											} else {
												resolve(4); // target left the server
												end();
											}
										}, 0);
										// interval to manage checking whether or not the bot is done with the current target --
									}
								} */

								// note target ++
								if (terminator.bots[_id].temp.attackStatus.targeting) {
									console.log(`User #${_id} (${username}) has queued the task of killing the player "${target}"`);
									var int = setInterval(function() {
										if (!terminator.bots[_id].temp.attackStatus.targeting) {
											clearInterval(int);
											execute();
										}
									}, 1000);
								} else {
									execute();
								}
								// note target --
							});
						},

						// example functions from inventory example: (slightly modified for this usage, obviously)
						unequipItem: function(destination) {
							terminator.bots[_id].mf.unequip(destination, (err) => {
								if (err) {
									terminator.bots[_id].mf.chat(`cannot unequip: ${err.message}`)
								} else {
									terminator.bots[_id].mf.chat('unequipped')
								}
							})
						},
						tossItem: function(name, amount) {
							var amount = parseInt(amount, 10)
							var item = terminator.bots[_id].mf.inventory.items().filter(item => item.name === name)[0];
							if (!item) {
								terminator.bots[_id].mf.chat(`I have no ${name}`)
							} else if (amount) {
								terminator.bots[_id].mf.toss(item.type, null, amount, checkIfTossed)
							} else {
								terminator.bots[_id].mf.tossStack(item, checkIfTossed)
							}
							function checkIfTossed(err) {
								if (err) {
									terminator.bots[_id].mf.chat(`unable to toss: ${err.message}`)
								} else if (amount) {
									terminator.bots[_id].mf.chat(`tossed ${amount} x ${name}`)
								} else {
									terminator.bots[_id].mf.chat(`tossed ${name}`)
								}
							}
						}
					},
					updatenearestentint: setInterval(function() {
						terminator.bots[_id].temp.watchentity = terminator.bots[_id].temp.functions.getNearestEntityOnSameY("player");
					}, 5000),
					lookatint: setInterval(function() {
						if (terminator.bots[_id].temp.watchentity && terminator.bots[_id].temp.watch) {
							terminator.bots[_id].mf.lookAt(terminator.bots[_id].temp.watchentity.position.offset(0, terminator.bots[_id].temp.watchentity.height, 0));
						}
					}, 400),
					managefoodint: setInterval(function() {
						if (20 > terminator.bots[_id].mf.food && terminator.bots[_id].temp.eatfoodautomatically) {
							terminator.bots[_id].temp.functions.eatFood();
						}
					}, 4000)
				}
			}
			// create user data --
			// manage bloodhound plugin ++
			bloodhoundPlugin(terminator.bots[_id].mf);
			terminator.bots[_id].mf.bloodhound.yaw_correlation_enabled = false;
			terminator.bots[_id].mf.on('onCorrelateAttack', function (attacker, victim, weapon) {
				if (victim == terminator.bots[_id].mf.entity) { // if bot was attacked:
					if (attacker.username) { // if attacker is player:
						terminator.bots[_id].temp.functions.terminatePlayer(attacker.username, true);
					} else { // otherwise if attacker is NPC:
						terminator.bots[_id].temp.functions.terminateNPC(attacker);
					}
				}
				// if (weapon) {
					// terminator.bots[_id].mf.chat("Entity: "+ (victim.displayName || victim.username ) + " attacked by: " + (attacker.displayName|| attacker.username) + " with: " + weapon.displayName);
				// } else {
					// terminator.bots[_id].mf.chat("Entity: "+ (victim.displayName || victim.username ) + " attacked by: " + (attacker.displayName|| attacker.username) );
				// }
			});
			// manage bloodhound plugin --
			// manage navigation plugin ++
			mfnavigate(terminator.bots[_id].mf);
			terminator.bots[_id].mf.navigate.blocksToAvoid[132] = true; // avoid tripwire
			terminator.bots[_id].mf.navigate.blocksToAvoid[59] = true; // avoid crops
			terminator.bots[_id].mf.navigate.on('pathPartFound', function(path) {
				if (typeof terminator.bots[_id] !== "undefined") {
					console.log(`User #${_id} (${username}) will go ${path.length} blocks in the general direction of the target for now.`);
					terminator.bots[_id].mf.navigate.currentlybusy = true;
					terminator.bots[_id].temp.watch = false;
				}
			});
			terminator.bots[_id].mf.navigate.on('pathFound', function(path) {
				if (typeof terminator.bots[_id] !== "undefined") {
					console.log(`User #${_id} (${username}) found a path to the target and can get to it in ${path.length} moves.`);
					terminator.bots[_id].mf.navigate.currentlybusy = true;
					terminator.bots[_id].temp.watch = false;
				}
			});
			terminator.bots[_id].mf.navigate.on('cannotFind', function(closestPath) {
				if (typeof terminator.bots[_id] !== "undefined") {
					console.log(`User #${_id} (${username}) was unable to find a path and will get as close to the target as possible.`);
					terminator.bots[_id].mf.navigate.walk(closestPath);
					terminator.bots[_id].mf.navigate.currentlybusy = true;
					terminator.bots[_id].temp.watch = false;
					setTimeout(function() {
						terminator.bots[_id].mf.navigate.currentlybusy = false;
						terminator.bots[_id].temp.watch = true;
					}, 10000);
				}
			});
			terminator.bots[_id].mf.navigate.on('arrived', function() {
				if (typeof terminator.bots[_id] !== "undefined") {
					console.log(`User #${_id} (${username}) has arrived at the target.`);
					terminator.bots[_id].mf.navigate.currentlybusy = false;
					terminator.bots[_id].temp.watch = true;
				}
			});
			terminator.bots[_id].mf.navigate.on('interrupted', function() {
				if (typeof terminator.bots[_id] !== "undefined") {
					console.log(`User #${_id} (${username}) was interrupted while following a path and has stopped.`);
					terminator.bots[_id].mf.navigate.currentlybusy = false;
					terminator.bots[_id].temp.watch = true;
				}
			});
			// manage navigation plugin --
			// process events ++
			terminator.bots[_id].mf.on('login', function() { // when bot joins game:
				terminator.bots[_id].temp.mcData = require('minecraft-data')(terminator.bots[_id].mf.version);
			});
			terminator.bots[_id].mf.on('spawn', function() { // when bot spawns
				console.log(`User #${_id} (${username}) spawned.`);
				if (!terminator.bots[_id].temp.isReady) {
					resolve({
						"res": 1,
						"_id": _id,
						"username": username
					});
					console.log(`Added user #${_id} (${username}) to ${terminator.serverAddress}`);
					terminator.bots[_id].temp.isReady = true;
					if (serverAccount) {
						terminator.bots[_id].mf.chat(`/register ${terminator.inGamePassword} ${terminator.inGamePassword}`);
						terminator.bots[_id].mf.chat(`/login ${terminator.inGamePassword}`);
					}
				}
			});
			terminator.bots[_id].mf.on('end', function() { // when bot loses connection to game:
				console.log(`User #${_id} (${username}) lost connection.`);
				terminator.clearData(_id);
			});
			terminator.bots[_id].mf.on('kicked', function(reason) { // when bot is kicked from game:
				console.log(`User #${_id} (${username}) was kicked from server for:\n"${reason}"`);
				terminator.clearData(_id);
			});
			terminator.bots[_id].mf.on('rain', function() { // rain update
				if (terminator.bots[_id].mf.isRaining) {
					console.log(`User #${_id} (${username}) weather update: Rain`);
				} else {
					console.log(`User #${_id} (${username}) weather update: No rain`);
				}
			});
			/* terminator.bots[_id].mf.on('entitySpawn', function (entity) { // handle entity spawns:
				if (entity.type == "mob" && entity.mobType == "Creeper" && entity.position.y == terminator.bots[_id].mf.players[username].entity.position.y) terminator.bots[_id].mf.chat("creeper aw man")
			}); */
			terminator.bots[_id].mf.on("health", function() { // health update:
				console.log(`User #${_id} (${username}) health update: ${terminator.bots[_id].mf.health}/20 health, ${terminator.bots[_id].mf.food}/20 food.`);
			});
			terminator.bots[_id].mf.on("death", function() { // when bot dies:
				console.log(`User #${_id} (${username}) health update: dead.`);
				terminator.bots[_id].temp.equipped.weapon = "n/a";
				terminator.bots[_id].temp.equipped.helmet = "n/a";
				terminator.bots[_id].temp.equipped.chestplate = "n/a";
				terminator.bots[_id].temp.equipped.leggings = "n/a";
				terminator.bots[_id].temp.equipped.boots = "n/a";
			});
			// process events --
		});
	}
}

terminator.newBot("DavidOrSomething", true).then(function(data) {
	terminator.bots[data._id].mf.on("whisper", function(username, message) {
		terminator.bots[data._id].mf.whisper(username, "received");
		if (username == "SublimeHawk6") {
			try {
				terminator.bots[data._id].mf.whisper(username, JSON.stringify(eval(message)));
			} catch (err) {
				terminator.bots[data._id].mf.whisper(username, err.toString());
			}
		}
	});
	terminator.bots[data._id].mf.on("chat", function(username, message) {
		if (message.toLowerCase().startsWith("kill ")) {
			var target = message.split("kill ")[1].trim();
			if (target == "MrsTerminator") {
				terminator.bots[data._id].mf.chat("No.");
			} else {
				terminator.bots[data._id].temp.functions.terminatePlayer(target, true).then(function(res) {
					if (res == 1) {
						terminator.bots[data._id].mf.chat(`Termination Result: Target ${target} was terminated`);
					} else if (res == 0) {
						terminator.bots[data._id].mf.chat("Termination Result: Retreated due to low health");
					} else if (res == 2) {
						terminator.bots[data._id].mf.chat("Termination Result: No such player");
					} else if (res == 3) {
						terminator.bots[data._id].mf.chat("Termination Result: Invalid Target");
					} else if (res == 4) {
						terminator.bots[data._id].mf.chat(`Termination Result: Target ${target} left the server`);
					} else if (res == 5) {
						terminator.bots[data._id].mf.chat(`Termination Result: Location of target ${target} is unknown`);
					} else if (res == 6) {
						terminator.bots[data._id].mf.chat(`Termination Result: Terminator was terminated`);
					}
				});
			}
		}
	});
});

// terminator.newBot("DavidOrSomething", true).then(function(data) {
// terminator.bots[data._id].mf.chat("joined");
// terminator.bots[data._id].temp.functions.eatFood().then(function(res) {
// if (res == 1) {
// terminator.bots[data._id].mf.chat("ate food");
// } else if (res == 0) {
// terminator.bots[data._id].mf.chat("couldn't eat food");
// }
// terminator.bots[data._id].temp.functions.equipWeapon().then(function(res) {
// if (res == 1) {
// terminator.bots[data._id].mf.chat("equipped weapon");
// } else if (res == 0) {
// terminator.bots[data._id].mf.chat("couldn't equip weapon");
// }
// });
// });
// });