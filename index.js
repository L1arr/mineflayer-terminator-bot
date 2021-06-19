/* callum fisher - corbex11@gmail.com
last updated: 12/06/2020 */

// Dependencies ++
const mineflayer = require('mineflayer');
const mfnavigate = require('mineflayer-navigate')(mineflayer);
const bloodhoundPlugin = require('mineflayer-bloodhound')(mineflayer);
const vec3 = require('vec3');
// Dependencies --

minecraft = {
	serveraddress: "myserver.com",
	ingamedefaultpass: "myingamepassword",
	users: {},
	clearuserdata: function(_id) {
		if (typeof minecraft.users[_id] !== "undefined") {
			console.log(`Clearing data for user #${_id}.`);
			clearInterval(minecraft.users[_id].temp.lookatint);
			clearInterval(minecraft.users[_id].temp.managefoodint);
			clearInterval(minecraft.users[_id].temp.updatenearestentint);
			if (minecraft.users[_id].temp.attackuserdata.targeting) {
				minecraft.users[_id].temp.attackuserdata.targeting = false;
				minecraft.users[_id].temp.attackuserdata.target = "n/a";
				clearInterval(minecraft.users[_id].temp.attackint);
				clearInterval(minecraft.users[_id].temp.navigationint);
				clearInterval(minecraft.users[_id].temp.navigationint2);
				clearInterval(minecraft.users[_id].temp.checkcompleteint);
			}
			delete minecraft.users[_id];
		}
	},
	adduser: function(username, registerandlogin) {
		return new Promise(function(resolve, reject) { // resolve 1 = successfully joined game, resolve 0 = timed out joining game
			var _id = Object.keys(minecraft.users).length;
			setTimeout(function() {
				if (!minecraft.users[_id].temp.concomplete) {
					resolve({
						"res": 0,
						"_id": _id,
						"username": username
					});
					console.log(`Failed to add user #${_id} (${username}) to ${minecraft.serveraddress}`);
					minecraft.users[_id].mf.quit();
					clearuserdata(_id);
				}
			}, 60000);
			// create user data ++
			minecraft.users[_id] = {
				mf: mineflayer.createBot({
					host: minecraft.serveraddress,
					username: username,
					version: "1.15.2",
					verbose: true,
					checkTimeoutInterval: 0
				}),
				temp: {
					concomplete: false,
					watch: true,
					eatfoodautomatically: true,
					attackuserdata: {
						targeting: false,
						target: "n/a"
					},
					acceptable_armor: {
						helmets: [ // low priority to high priority
							"leather_helmet",
							"iron_helmet",
							"golden_helmet",
							"diamond_helmet"
						],
						chestplates: [ // low priority to high priority
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
						]
					},
					acceptable_food: [ // low priority to high priority
						"sweet_berries",
						"bread",
						"baked_potato",
						"cooked_chicken",
						"golden_apple"
					],
					acceptable_weapons: [ // low priority to high priority
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
					],
					iseating: false,
					isequippingweapon: false,
					isequippingarmor: false,
					currentweapon: "n/a",
					currentarmor: {
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
							for (id in minecraft.users[_id].mf.entities) {
								entity = minecraft.users[_id].mf.entities[id]
								if (type && entity.type !== type) continue
								if (entity === minecraft.users[_id].mf.entity) continue
								// if (entity.position.y < bots[${bots_id}].entity.position.y+1) continue
								dist = minecraft.users[_id].mf.entity.position.distanceTo(entity.position);
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
							for (id in minecraft.users[_id].mf.entities) {
								entity = minecraft.users[_id].mf.entities[id]
								if (type && entity.type !== type) continue
								if (entity === minecraft.users[_id].mf.entity) continue
								if (entity.position.y < minecraft.users[_id].mf.entity.position.y) continue // if entity is lower than bot Y + 1, ignore
								dist = minecraft.users[_id].mf.entity.position.distanceTo(entity.position);
								if (!best || dist < bestDistance) {
									best = entity
									bestDistance = dist
								}
							}
							return best;
						},
						equipHelmet: function() {
							return new Promise(function(resolve, reject) {
								var interval = setInterval(function() {
									if (!minecraft.users[_id].temp.iseating && !minecraft.users[_id].temp.isequippingweapon && !minecraft.users[_id].temp.isequippingarmor) {
										clearInterval(interval);
										minecraft.users[_id].temp.isequippingarmor = true;
										var best = "";
										var i = -1;
										var int = setInterval(function() {
											i++;
											if (minecraft.users[_id].mf.inventory.slots[i] !== null) { // choose best helmet:
												if (minecraft.users[_id].temp.acceptable_armor.helmets.includes(minecraft.users[_id].mf.inventory.slots[i].name)) { // if this item is an acceptable helmet
													// if (minecraft.users[_id].temp.currentweapon !== minecraft.users[_id].mf.inventory.slots[i].name) { // if the currently equipped helmet isn't this weapon:
													if (best !== "") { // if another best helmet was found before:
														if (minecraft.users[_id].temp.acceptable_armor.helmets.indexOf(minecraft.users[_id].mf.inventory.slots[i].name) > minecraft.users[_id].temp.acceptable_armor.helmets.indexOf(best)) { // if it's better than the last helmet checked
															best = minecraft.users[_id].mf.inventory.slots[i].name; // set new best helmet
														}
													} else { // otherwise if no best helmet has been set:
														best = minecraft.users[_id].mf.inventory.slots[i].name; // set this weapon as the current best helmet
													}
													// }
												}
											}
											if (i >= Object.keys(minecraft.users[_id].mf.inventory.slots).length - 1) { // done checking all inventory slots:
												clearInterval(int);
												if (best) {
													if (minecraft.users[_id].temp.currentarmor.helmet !== best) {
														minecraft.users[_id].temp.currentarmor.helmet = best;
														console.log(`User #${_id} (${username}) is equipping helmet ${best}`);
														minecraft.users[_id].mf.equip(minecraft.users[_id].temp.mcData.itemsByName[best].id, 'head', (err) => { // equip the best helmet
															if (err) {
																resolve(0);
																minecraft.users[_id].temp.isequippingarmor = false;
																return console.log(err.message);
															} else {
																resolve(1);
																minecraft.users[_id].temp.isequippingarmor = false;
															}
														});
													} else {
														resolve(1);
														minecraft.users[_id].temp.isequippingarmor = false;
													}
												} else {
													resolve(0);
													minecraft.users[_id].temp.isequippingarmor = false;
												}
											}
										}, 0);
									}
								}, 800);
							});
						},
						equipChestplate: function() {
							return new Promise(function(resolve, reject) {
								var interval = setInterval(function() {
									if (!minecraft.users[_id].temp.iseating && !minecraft.users[_id].temp.isequippingweapon && !minecraft.users[_id].temp.isequippingarmor) {
										clearInterval(interval);
										minecraft.users[_id].temp.isequippingarmor = true;
										var best = "";
										var i = -1;
										var int = setInterval(function() {
											i++;
											if (minecraft.users[_id].mf.inventory.slots[i] !== null) { // choose best chestplate:
												if (minecraft.users[_id].temp.acceptable_armor.chestplates.includes(minecraft.users[_id].mf.inventory.slots[i].name)) { // if this item is an acceptable chestplate:
													// if (minecraft.users[_id].temp.currentweapon !== minecraft.users[_id].mf.inventory.slots[i].name) { // if the currently equipped chestplate isn't this weapon:
													if (best !== "") { // if another best chestplate was found before:
														if (minecraft.users[_id].temp.acceptable_armor.chestplates.indexOf(minecraft.users[_id].mf.inventory.slots[i].name) > minecraft.users[_id].temp.acceptable_armor.chestplates.indexOf(best)) { // if it's better than the last chestplate checked
															best = minecraft.users[_id].mf.inventory.slots[i].name; // set new best chestplate
														}
													} else { // otherwise if no best chestplate has been set:
														best = minecraft.users[_id].mf.inventory.slots[i].name; // set this weapon as the current best chestplate
													}
													// }
												}
											}
											if (i >= Object.keys(minecraft.users[_id].mf.inventory.slots).length - 1) { // done checking all inventory slots:
												clearInterval(int);
												if (best) {
													if (minecraft.users[_id].temp.currentarmor.chestplate !== best) {
														minecraft.users[_id].temp.currentarmor.chestplate = best;
														console.log(`User #${_id} (${username}) is equipping chestplate ${best}`);
														minecraft.users[_id].mf.equip(minecraft.users[_id].temp.mcData.itemsByName[best].id, 'torso', (err) => { // equip the best chestplate
															if (err) {
																resolve(0);
																minecraft.users[_id].temp.isequippingarmor = false;
																return console.log(err.message);
															} else {
																resolve(1);
																minecraft.users[_id].temp.isequippingarmor = false;
															}
														});
													} else {
														resolve(1);
														minecraft.users[_id].temp.isequippingarmor = false;
													}
												} else {
													resolve(0);
													minecraft.users[_id].temp.isequippingarmor = false;
												}
											}
										}, 0);
									}
								}, 800);
							});
						},
						equipLeggings: function() {
							return new Promise(function(resolve, reject) {
								var interval = setInterval(function() {
									if (!minecraft.users[_id].temp.iseating && !minecraft.users[_id].temp.isequippingweapon && !minecraft.users[_id].temp.isequippingarmor) {
										clearInterval(interval);
										minecraft.users[_id].temp.isequippingarmor = true;
										var best = "";
										var i = -1;
										var int = setInterval(function() {
											i++;
											if (minecraft.users[_id].mf.inventory.slots[i] !== null) { // choose best leggings:
												if (minecraft.users[_id].temp.acceptable_armor.leggings.includes(minecraft.users[_id].mf.inventory.slots[i].name)) { // if this item is an acceptable leggings:
													// if (minecraft.users[_id].temp.currentweapon !== minecraft.users[_id].mf.inventory.slots[i].name) { // if the currently equipped leggings isn't this weapon:
													if (best !== "") { // if another best leggings was found before:
														if (minecraft.users[_id].temp.acceptable_armor.leggings.indexOf(minecraft.users[_id].mf.inventory.slots[i].name) > minecraft.users[_id].temp.acceptable_armor.leggings.indexOf(best)) { // if it's better than the last leggings checked
															best = minecraft.users[_id].mf.inventory.slots[i].name; // set new best leggings
														}
													} else { // otherwise if no best leggings has been set:
														best = minecraft.users[_id].mf.inventory.slots[i].name; // set this weapon as the current best leggings
													}
													// }
												}
											}
											if (i >= Object.keys(minecraft.users[_id].mf.inventory.slots).length - 1) { // done checking all inventory slots:
												clearInterval(int);
												if (best) {
													if (minecraft.users[_id].temp.currentarmor.leggings !== best) {
														minecraft.users[_id].temp.currentarmor.leggings = best;
														console.log(`User #${_id} (${username}) is equipping leggings ${best}`);
														minecraft.users[_id].mf.equip(minecraft.users[_id].temp.mcData.itemsByName[best].id, 'legs', (err) => { // equip the best leggings
															if (err) {
																resolve(0);
																minecraft.users[_id].temp.isequippingarmor = false;
																return console.log(err.message);
															} else {
																resolve(1);
																minecraft.users[_id].temp.isequippingarmor = false;
															}
														});
													} else {
														resolve(1);
														minecraft.users[_id].temp.isequippingarmor = false;
													}
												} else {
													resolve(0);
													minecraft.users[_id].temp.isequippingarmor = false;
												}
											}
										}, 0);
									}
								}, 800);
							});
						},
						equipBoots: function() {
							return new Promise(function(resolve, reject) {
								var interval = setInterval(function() {
									if (!minecraft.users[_id].temp.iseating && !minecraft.users[_id].temp.isequippingweapon && !minecraft.users[_id].temp.isequippingarmor) {
										clearInterval(interval);
										minecraft.users[_id].temp.isequippingarmor = true;
										var best = "";
										var i = -1;
										var int = setInterval(function() {
											i++;
											if (minecraft.users[_id].mf.inventory.slots[i] !== null) { // choose best boots:
												if (minecraft.users[_id].temp.acceptable_armor.boots.includes(minecraft.users[_id].mf.inventory.slots[i].name)) { // if this item is an acceptable boots:
													// if (minecraft.users[_id].temp.currentweapon !== minecraft.users[_id].mf.inventory.slots[i].name) { // if the currently equipped boots isn't this weapon:
													if (best !== "") { // if another best boots was found before:
														if (minecraft.users[_id].temp.acceptable_armor.boots.indexOf(minecraft.users[_id].mf.inventory.slots[i].name) > minecraft.users[_id].temp.acceptable_armor.boots.indexOf(best)) { // if it's better than the last boots checked
															best = minecraft.users[_id].mf.inventory.slots[i].name; // set new best boots
														}
													} else { // otherwise if no best boots has been set:
														best = minecraft.users[_id].mf.inventory.slots[i].name; // set this weapon as the current best boots
													}
													// }
												}
											}
											if (i >= Object.keys(minecraft.users[_id].mf.inventory.slots).length - 1) { // done checking all inventory slots:
												clearInterval(int);
												if (best) {
													if (minecraft.users[_id].temp.currentarmor.boots !== best) {
														minecraft.users[_id].temp.currentarmor.boots = best;
														console.log(`User #${_id} (${username}) is equipping boots ${best}`);
														minecraft.users[_id].mf.equip(minecraft.users[_id].temp.mcData.itemsByName[best].id, 'feet', (err) => { // equip the best boots
															if (err) {
																resolve(0);
																minecraft.users[_id].temp.isequippingarmor = false;
																return console.log(err.message);
															} else {
																resolve(1);
																minecraft.users[_id].temp.isequippingarmor = false;
															}
														});
													} else {
														resolve(1);
														minecraft.users[_id].temp.isequippingarmor = false;
													}
												} else {
													resolve(0);
													minecraft.users[_id].temp.isequippingarmor = false;
												}
											}
										}, 0);
									}
								}, 800);
							});
						},
						equipArmor: function() {
							minecraft.users[_id].temp.functions.equipHelmet();
							minecraft.users[_id].temp.functions.equipChestplate();
							minecraft.users[_id].temp.functions.equipLeggings();
							minecraft.users[_id].temp.functions.equipBoots();
						},
						equipWeapon: function() {
							return new Promise(function(resolve, reject) {
								var interval = setInterval(function() {
									if (!minecraft.users[_id].temp.iseating && !minecraft.users[_id].temp.isequippingweapon && !minecraft.users[_id].temp.isequippingarmor) {
										clearInterval(interval);
										minecraft.users[_id].temp.isequippingweapon = true;
										var best = "";
										var i = -1;
										var int = setInterval(function() {
											i++;
											if (minecraft.users[_id].mf.inventory.slots[i] !== null) { // choose best weapon:
												if (minecraft.users[_id].temp.acceptable_weapons.includes(minecraft.users[_id].mf.inventory.slots[i].name)) { // if this item is an acceptable weapon:
													// if (minecraft.users[_id].temp.currentweapon !== minecraft.users[_id].mf.inventory.slots[i].name) { // if the currently equipped weapon isn't this weapon:
													if (best !== "") { // if another best weapon was found before:
														if (minecraft.users[_id].temp.acceptable_weapons.indexOf(minecraft.users[_id].mf.inventory.slots[i].name) > minecraft.users[_id].temp.acceptable_weapons.indexOf(best)) { // if it's better than the last weapon checked
															best = minecraft.users[_id].mf.inventory.slots[i].name; // set new best weapon
														}
													} else { // otherwise if no best weapon has been set:
														best = minecraft.users[_id].mf.inventory.slots[i].name; // set this weapon as the current best weapon
													}
													// }
												}
											}
											if (i >= Object.keys(minecraft.users[_id].mf.inventory.slots).length - 1) { // done checking all inventory slots:
												clearInterval(int);
												if (best) {
													if (minecraft.users[_id].temp.currentweapon !== best) {
														minecraft.users[_id].temp.currentweapon = best;
														console.log(`User #${_id} (${username}) is equipping weapon ${best}`);
														minecraft.users[_id].mf.equip(minecraft.users[_id].temp.mcData.itemsByName[best].id, 'hand', (err) => { // equip the best weapon
															if (err) {
																resolve(0);
																minecraft.users[_id].temp.isequippingweapon = false;
																return console.log(err.message);
															} else {
																resolve(1);
																minecraft.users[_id].temp.isequippingweapon = false;
															}
														});
													} else {
														resolve(1);
														minecraft.users[_id].temp.isequippingarmor = false;
													}
												} else {
													resolve(0);
													minecraft.users[_id].temp.isequippingweapon = false;
												}
											}
										}, 0);
									}
								}, 800);
							});
						},
						eatFood: function() {
							return new Promise(function(resolve, reject) {
								var interval = setInterval(function() {
									// for testing:
									// console.log(`${minecraft.users[_id].temp.iseating} ${minecraft.users[_id].temp.isequippingweapon} ${minecraft.users[_id].temp.isequippingarmor}`);
									// console.log(`current equipment: ${minecraft.users[_id].temp.currentweapon} ${JSON.stringify(minecraft.users[_id].temp.currentarmor)}`);
									// console.log(`current health: ${minecraft.users[_id].mf.health}/20, current food: ${JSON.stringify(minecraft.users[_id].mf.food)}/20`);
									if (!minecraft.users[_id].temp.iseating && !minecraft.users[_id].temp.isequippingweapon && !minecraft.users[_id].temp.isequippingarmor) {
										clearInterval(interval);
										minecraft.users[_id].temp.iseating = true;
										var best = "";
										var i = -1;
										var int = setInterval(function() {
											i++;
											if (minecraft.users[_id].mf.inventory.slots[i] !== null) { // choose best food:
												if (minecraft.users[_id].temp.acceptable_food.includes(minecraft.users[_id].mf.inventory.slots[i].name)) { // if this item is acceptable food:
													if (best !== "") { // if another best food was found before:
														if (minecraft.users[_id].temp.acceptable_food.indexOf(minecraft.users[_id].mf.inventory.slots[i].name) > minecraft.users[_id].temp.acceptable_food.indexOf(best)) { // if it's better than the last food checked
															best = minecraft.users[_id].mf.inventory.slots[i].name; // set new best food
														}
													} else { // otherwise if no best food has been set:
														best = minecraft.users[_id].mf.inventory.slots[i].name; // set this food as the current best food
													}
												}
											}
											if (i >= Object.keys(minecraft.users[_id].mf.inventory.slots).length - 1) { // done checking all inventory slots:
												clearInterval(int);
												if (best) {
													console.log(`User #${_id} (${username}) is eating ${best}`);
													minecraft.users[_id].mf.equip(minecraft.users[_id].temp.mcData.itemsByName[best].id, 'hand', (err) => { // equip the best food
														if (err) {
															resolve(0);
															minecraft.users[_id].temp.iseating = false;
															return console.log(err.message);
														} else {
															minecraft.users[_id].temp.currentweapon = "n/a";
															minecraft.users[_id].mf.consume((err) => {
																if (err) {
																	resolve(0);
																	minecraft.users[_id].temp.iseating = false;
																	return console.log(err.message);
																} else {
																	resolve(1);
																	setTimeout(function() {
																		minecraft.users[_id].temp.iseating = false;
																	}, 4000);
																}
															});
														}
													});
												} else {
													resolve(0);
													minecraft.users[_id].temp.iseating = false;
												}
											}
										}, 0);
									}
								}, 800);
							});
						},
						terminateNPC: function(target) {
							return new Promise(function(resolve, reject) {
								var execute = function() {
									if (target) {
										console.log(`User #${_id} (${username}) has been tasked with killing the NPC "${target.name}"`);
										// preparation ++
										minecraft.users[_id].temp.functions.equipArmor();
										var usenavigationplugin = true;
										minecraft.users[_id].temp.attackuserdata.targeting = true;
										minecraft.users[_id].temp.attackuserdata.target = target;
										var end = function() { // function to end intervals and reset intervals when done killing NPC:
											minecraft.users[_id].temp.attackuserdata.targeting = false;
											minecraft.users[_id].temp.attackuserdata.target = "n/a";
											clearInterval(minecraft.users[_id].temp.attackint);
											clearInterval(minecraft.users[_id].temp.checkcompleteint);
											clearInterval(minecraft.users[_id].temp.navigationint);
											clearInterval(minecraft.users[_id].temp.navigationint2);
											minecraft.users[_id].mf.setControlState("forward", false);
											minecraft.users[_id].mf.setControlState("jump", false);
											minecraft.users[_id].temp.watch = true;
											minecraft.users[_id].temp.watchentity = minecraft.users[_id].temp.functions.getNearestEntityOnSameY("player");
											if (minecraft.users[_id].temp.updatenearestentint._destroyed) {
												minecraft.users[_id].temp.updatenearestentint = setInterval(function() {
													minecraft.users[_id].temp.watchentity = minecraft.users[_id].temp.functions.getNearestEntityOnSameY("player");
												}, 5000);
											}
										}
										var gototarget = function() { // use mineflayer-navigate to reach the target:
											try {
												minecraft.users[_id].mf.navigate.to(target.position);
											} catch (err) {
												console.log(`User #${_id} (${username}) navigation result is an error:\n${err}\nTarget likely too far away.`);
												minecraft.users[_id].mf.navigate.currentlybusy = false;
											}
										}
										gototarget();
										// preparation --
										// interval to operate the gototarget function while killing the NPC ++
										minecraft.users[_id].temp.navigationint = setInterval(function() {
											if (usenavigationplugin) {
												if (!minecraft.users[_id].mf.navigate.currentlybusy) {
													gototarget();
												}
											}
										}, 5000);
										// interval to operate the gototarget function while killing the NPC -- 
										// interval to operate the change of navigation mode from mineflayer-navigate to a simple run and jump function ++
										minecraft.users[_id].temp.navigationint2 = setInterval(function() {
												if (minecraft.users[_id].mf.players[username].entity) { // if bot not dead
													if (target) { // if target entity exists: (they're not dead/out of range)
														if ((Math.abs(Math.floor(target.position.x) - Math.floor(minecraft.users[_id].mf.players[username].entity.position.x)) >= 6) == false && (Math.abs(Math.floor(target.position.z) - Math.floor(minecraft.users[_id].mf.players[username].entity.position.z)) >= 6) == false) {
															if (usenavigationplugin) {
																console.log(`User #${_id} (${username}) navigation switching to dummy mode.`);
																usenavigationplugin = false;
																if (!minecraft.users[_id].mf.navigate.currentlybusy) {
																	minecraft.users[_id].mf.setControlState("forward", true);
																	minecraft.users[_id].mf.setControlState("jump", true);
																}
																clearInterval(minecraft.users[_id].temp.updatenearestentint);
																minecraft.users[_id].temp.watchentity = target;
																minecraft.users[_id].temp.watch = true;
															} else {
																if (!minecraft.users[_id].mf.navigate.currentlybusy) {
																	minecraft.users[_id].mf.setControlState("forward", true);
																	minecraft.users[_id].mf.setControlState("jump", true);
																}
																clearInterval(minecraft.users[_id].temp.updatenearestentint);
																minecraft.users[_id].temp.watchentity = target;
																minecraft.users[_id].temp.watch = true;
															}
														} else {
															if (!usenavigationplugin) {
																console.log(`User #${_id} (${username}) navigation switching to pathfinding mode.`);
																usenavigationplugin = true;
																minecraft.users[_id].mf.setControlState("forward", false);
																minecraft.users[_id].mf.setControlState("jump", false);
																if (minecraft.users[_id].temp.updatenearestentint._destroyed) {
																	minecraft.users[_id].temp.updatenearestentint = setInterval(function() {
																		minecraft.users[_id].temp.watchentity = minecraft.users[_id].temp.functions.getNearestEntityOnSameY("player");
																	}, 5000);
																}
															} else {
																if (minecraft.users[_id].temp.updatenearestentint._destroyed) {
																	minecraft.users[_id].temp.updatenearestentint = setInterval(function() {
																		minecraft.users[_id].temp.watchentity = minecraft.users[_id].temp.functions.getNearestEntityOnSameY("player");
																	}, 5000);
																}
															}
														}
													}
												}
										}, 1000);
										// interval to operate the change of navigation mode from mineflayer-navigate to a simple run and jump function --
										// interval to manage weapons and attacking the target ++
										minecraft.users[_id].temp.attackint = setInterval(function() {
												if (target) {
													minecraft.users[_id].mf.attack(target);
													minecraft.users[_id].temp.functions.equipWeapon();
												}
										}, 800);
										// interval to manage weapons and attacking the target --
										// interval to manage checking whether or not the bot is done with the current target ++
										minecraft.users[_id].temp.checkcompleteint = setInterval(function() {
													if (!target) {
															resolve(1); // target out of range/location unknown
															end();
													}
										}, 0);
										// interval to manage checking whether or not the bot is done with the current target --
									}
								}

								// note target ++
								if (minecraft.users[_id].temp.attackuserdata.targeting) {
									console.log(`User #${_id} (${username}) has queued the task of killing an NPC.`);
									var int = setInterval(function() {
										if (!minecraft.users[_id].temp.attackuserdata.targeting) {
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
						terminatePlayer: function(target, persistent) {
							/* if persistent = true then:
							   - the bot won't retreat if the bot's health is below ten
							   - bot will wait for player's entity to appear again (be in range) if they go out of range
							*/
							return new Promise(function(resolve, reject) {
								var execute = function() {
									// initial checks:
									if (!minecraft.users[_id].mf.players[target]) {
										resolve(2); // no such player
									} else if (target == username) {
										resolve(3); // cannot attack self
									} else if (!minecraft.users[_id].mf.players[target].entity) {
										resolve(5); // out of range
									} else {
										console.log(`User #${_id} (${username}) has been tasked with killing the player "${target}"`);
										// preparation ++
										minecraft.users[_id].temp.functions.equipArmor();
										var usenavigationplugin = true;
										minecraft.users[_id].temp.attackuserdata.targeting = true;
										minecraft.users[_id].temp.attackuserdata.target = target;
										var end = function() { // function to end intervals and reset intervals when done killing player:
											minecraft.users[_id].temp.attackuserdata.targeting = false;
											minecraft.users[_id].temp.attackuserdata.target = "n/a";
											clearInterval(minecraft.users[_id].temp.attackint);
											clearInterval(minecraft.users[_id].temp.checkcompleteint);
											clearInterval(minecraft.users[_id].temp.navigationint);
											clearInterval(minecraft.users[_id].temp.navigationint2);
											minecraft.users[_id].mf.setControlState("forward", false);
											minecraft.users[_id].mf.setControlState("jump", false);
											minecraft.users[_id].temp.watch = true;
											minecraft.users[_id].temp.watchentity = minecraft.users[_id].temp.functions.getNearestEntityOnSameY("player");
											if (minecraft.users[_id].temp.updatenearestentint._destroyed) {
												minecraft.users[_id].temp.updatenearestentint = setInterval(function() {
													minecraft.users[_id].temp.watchentity = minecraft.users[_id].temp.functions.getNearestEntityOnSameY("player");
												}, 5000);
											}
										}
										var gototarget = function() { // use mineflayer-navigate to reach the target:
											try {
												minecraft.users[_id].mf.navigate.to(minecraft.users[_id].mf.players[target].entity.position);
											} catch (err) {
												console.log(`User #${_id} (${username}) navigation result is an error:\n${err}\nTarget likely too far away.`);
												minecraft.users[_id].mf.navigate.currentlybusy = false;
											}
										}
										gototarget();
										// preparation --
										// interval to operate the gototarget function while killing the player ++
										minecraft.users[_id].temp.navigationint = setInterval(function() {
											if (usenavigationplugin) {
												if (!minecraft.users[_id].mf.navigate.currentlybusy) {
													gototarget();
												}
											}
											if (minecraft.users[_id].mf.health < 11 && persistent == false) { // retreat:
												resolve(0);
												end();
												setTimeout(function() {
													minecraft.users[_id].mf.setControlState("back", true);
													setTimeout(function() {
														minecraft.users[_id].mf.setControlState("back", false);
													}, 5000);
												}, 2000);
											}
										}, 5000);
										// interval to operate the gototarget function while killing the player -- 
										// interval to operate the change the navigation mode from mineflayer-navigate to a simple run and jump function ++
										minecraft.users[_id].temp.navigationint2 = setInterval(function() {
											if (minecraft.users[_id].mf.players[target]) { // if target in server:
												if (minecraft.users[_id].mf.players[username].entity) {
													if (minecraft.users[_id].mf.players[target].entity) { // if target entity exists: (they're not dead/out of range)
														if ((Math.abs(Math.floor(minecraft.users[_id].mf.players[target].entity.position.x) - Math.floor(minecraft.users[_id].mf.players[username].entity.position.x)) >= 6) == false && (Math.abs(Math.floor(minecraft.users[_id].mf.players[target].entity.position.z) - Math.floor(minecraft.users[_id].mf.players[username].entity.position.z)) >= 6) == false) {
															if (usenavigationplugin) {
																console.log(`User #${_id} (${username}) navigation switching to dummy mode.`);
																usenavigationplugin = false;
																if (!minecraft.users[_id].mf.navigate.currentlybusy) {
																	minecraft.users[_id].mf.setControlState("forward", true);
																	minecraft.users[_id].mf.setControlState("jump", true);
																}
																clearInterval(minecraft.users[_id].temp.updatenearestentint);
																minecraft.users[_id].temp.watchentity = minecraft.users[_id].mf.players[target].entity;
																minecraft.users[_id].temp.watch = true;
															} else {
																if (!minecraft.users[_id].mf.navigate.currentlybusy) {
																	minecraft.users[_id].mf.setControlState("forward", true);
																	minecraft.users[_id].mf.setControlState("jump", true);
																}
																clearInterval(minecraft.users[_id].temp.updatenearestentint);
																minecraft.users[_id].temp.watchentity = minecraft.users[_id].mf.players[target].entity;
																minecraft.users[_id].temp.watch = true;
															}
														} else {
															if (!usenavigationplugin) {
																console.log(`User #${_id} (${username}) navigation switching to pathfinding mode.`);
																usenavigationplugin = true;
																minecraft.users[_id].mf.setControlState("forward", false);
																minecraft.users[_id].mf.setControlState("jump", false);
																if (minecraft.users[_id].temp.updatenearestentint._destroyed) {
																	minecraft.users[_id].temp.updatenearestentint = setInterval(function() {
																		minecraft.users[_id].temp.watchentity = minecraft.users[_id].temp.functions.getNearestEntityOnSameY("player");
																	}, 5000);
																}
															} else {
																if (minecraft.users[_id].temp.updatenearestentint._destroyed) {
																	minecraft.users[_id].temp.updatenearestentint = setInterval(function() {
																		minecraft.users[_id].temp.watchentity = minecraft.users[_id].temp.functions.getNearestEntityOnSameY("player");
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
										minecraft.users[_id].temp.attackint = setInterval(function() {
											if (minecraft.users[_id].mf.players[target]) {
												if (minecraft.users[_id].mf.players[target].entity) {
													minecraft.users[_id].mf.attack(minecraft.users[_id].mf.players[target].entity);
													minecraft.users[_id].temp.functions.equipWeapon();
												}
											}
										}, 800);
										// interval to manage weapons and attacking the target --
										// interval to manage checking whether or not the bot is done with the current target ++
										minecraft.users[_id].temp.checkcompleteint = setInterval(function() {
											if (minecraft.users[_id].mf.players[target]) {
												if (minecraft.users[_id].mf.players[username].entity) {
													if (minecraft.users[_id].mf.players[target].entity) {
														if (0 >= minecraft.users[_id].mf.players[target].entity.metadata[8]) {
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
								}

								// note target ++
								if (minecraft.users[_id].temp.attackuserdata.targeting) {
									console.log(`User #${_id} (${username}) has queued the task of killing the player "${target}"`);
									var int = setInterval(function() {
										if (!minecraft.users[_id].temp.attackuserdata.targeting) {
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
							minecraft.users[_id].mf.unequip(destination, (err) => {
								if (err) {
									minecraft.users[_id].mf.chat(`cannot unequip: ${err.message}`)
								} else {
									minecraft.users[_id].mf.chat('unequipped')
								}
							})
						},
						tossItem: function(name, amount) {
							var amount = parseInt(amount, 10)
							var item = minecraft.users[_id].mf.inventory.items().filter(item => item.name === name)[0];
							if (!item) {
								minecraft.users[_id].mf.chat(`I have no ${name}`)
							} else if (amount) {
								minecraft.users[_id].mf.toss(item.type, null, amount, checkIfTossed)
							} else {
								minecraft.users[_id].mf.tossStack(item, checkIfTossed)
							}
							function checkIfTossed(err) {
								if (err) {
									minecraft.users[_id].mf.chat(`unable to toss: ${err.message}`)
								} else if (amount) {
									minecraft.users[_id].mf.chat(`tossed ${amount} x ${name}`)
								} else {
									minecraft.users[_id].mf.chat(`tossed ${name}`)
								}
							}
						}
					},
					updatenearestentint: setInterval(function() {
						minecraft.users[_id].temp.watchentity = minecraft.users[_id].temp.functions.getNearestEntityOnSameY("player");
					}, 5000),
					lookatint: setInterval(function() {
						if (minecraft.users[_id].temp.watchentity && minecraft.users[_id].temp.watch) {
							minecraft.users[_id].mf.lookAt(minecraft.users[_id].temp.watchentity.position.offset(0, minecraft.users[_id].temp.watchentity.height, 0));
						}
					}, 400),
					managefoodint: setInterval(function() {
						if (20 > minecraft.users[_id].mf.food && minecraft.users[_id].temp.eatfoodautomatically) {
							minecraft.users[_id].temp.functions.eatFood();
						}
					}, 4000)
				}
			}
			// create user data --
			// manage bloodhound plugin ++
			bloodhoundPlugin(minecraft.users[_id].mf);
			minecraft.users[_id].mf.bloodhound.yaw_correlation_enabled = false;
			minecraft.users[_id].mf.on('onCorrelateAttack', function (attacker, victim, weapon) {
				if (victim == minecraft.users[_id].mf.entity) { // if bot was attacked:
					if (attacker.username) { // if attacker is player:
						minecraft.users[_id].temp.functions.terminatePlayer(attacker.username, true);
					} else { // otherwise if attacker is NPC:
						minecraft.users[_id].temp.functions.terminateNPC(attacker);
					}
				}
				// if (weapon) {
					// minecraft.users[_id].mf.chat("Entity: "+ (victim.displayName || victim.username ) + " attacked by: " + (attacker.displayName|| attacker.username) + " with: " + weapon.displayName);
				// } else {
					// minecraft.users[_id].mf.chat("Entity: "+ (victim.displayName || victim.username ) + " attacked by: " + (attacker.displayName|| attacker.username) );
				// }
			});
			// manage bloodhound plugin --
			// manage navigation plugin ++
			mfnavigate(minecraft.users[_id].mf);
			minecraft.users[_id].mf.navigate.blocksToAvoid[132] = true; // avoid tripwire
			minecraft.users[_id].mf.navigate.blocksToAvoid[59] = true; // avoid crops
			minecraft.users[_id].mf.navigate.on('pathPartFound', function(path) {
				if (typeof minecraft.users[_id] !== "undefined") {
					console.log(`User #${_id} (${username}) will go ${path.length} blocks in the general direction of the target for now.`);
					minecraft.users[_id].mf.navigate.currentlybusy = true;
					minecraft.users[_id].temp.watch = false;
				}
			});
			minecraft.users[_id].mf.navigate.on('pathFound', function(path) {
				if (typeof minecraft.users[_id] !== "undefined") {
					console.log(`User #${_id} (${username}) found a path to the target and can get to it in ${path.length} moves.`);
					minecraft.users[_id].mf.navigate.currentlybusy = true;
					minecraft.users[_id].temp.watch = false;
				}
			});
			minecraft.users[_id].mf.navigate.on('cannotFind', function(closestPath) {
				if (typeof minecraft.users[_id] !== "undefined") {
					console.log(`User #${_id} (${username}) was unable to find a path and will get as close to the target as possible.`);
					minecraft.users[_id].mf.navigate.walk(closestPath);
					minecraft.users[_id].mf.navigate.currentlybusy = true;
					minecraft.users[_id].temp.watch = false;
					setTimeout(function() {
						minecraft.users[_id].mf.navigate.currentlybusy = false;
						minecraft.users[_id].temp.watch = true;
					}, 10000);
				}
			});
			minecraft.users[_id].mf.navigate.on('arrived', function() {
				if (typeof minecraft.users[_id] !== "undefined") {
					console.log(`User #${_id} (${username}) has arrived at the target.`);
					minecraft.users[_id].mf.navigate.currentlybusy = false;
					minecraft.users[_id].temp.watch = true;
				}
			});
			minecraft.users[_id].mf.navigate.on('interrupted', function() {
				if (typeof minecraft.users[_id] !== "undefined") {
					console.log(`User #${_id} (${username}) was interrupted while following a path and has stopped.`);
					minecraft.users[_id].mf.navigate.currentlybusy = false;
					minecraft.users[_id].temp.watch = true;
				}
			});
			// manage navigation plugin --
			// process events ++
			minecraft.users[_id].mf.on('login', function() { // when bot joins game:
				minecraft.users[_id].temp.mcData = require('minecraft-data')(minecraft.users[_id].mf.version);
			});
			minecraft.users[_id].mf.on('spawn', function() { // when bot spawns
				console.log(`User #${_id} (${username}) spawned.`);
				if (!minecraft.users[_id].temp.concomplete) {
					resolve({
						"res": 1,
						"_id": _id,
						"username": username
					});
					console.log(`Added user #${_id} (${username}) to ${minecraft.serveraddress}`);
					minecraft.users[_id].temp.concomplete = true;
					if (registerandlogin) {
						minecraft.users[_id].mf.chat(`/register ${minecraft.ingamedefaultpass} ${minecraft.ingamedefaultpass}`);
						minecraft.users[_id].mf.chat(`/login ${minecraft.ingamedefaultpass}`);
					}
				}
			});
			minecraft.users[_id].mf.on('end', function() { // when bot loses connection to game:
				console.log(`User #${_id} (${username}) lost connection.`);
				minecraft.clearuserdata(_id);
			});
			minecraft.users[_id].mf.on('kicked', function(reason) { // when bot is kicked from game:
				console.log(`User #${_id} (${username}) was kicked from server for:\n"${reason}"`);
				minecraft.clearuserdata(_id);
			});
			minecraft.users[_id].mf.on('rain', function() { // rain update
				if (minecraft.users[_id].mf.isRaining) {
					console.log(`User #${_id} (${username}) weather update: Rain`);
				} else {
					console.log(`User #${_id} (${username}) weather update: No rain`);
				}
			});
			// minecraft.users[_id].mf.on('entitySpawn', function (entity) { // handle entity spawns:
			// if (entity.type == "mob" && entity.mobType == "Creeper" && entity.position.y == minecraft.users[_id].mf.players[username].entity.position.y) {
			// minecraft.users[_id].mf.chat("creeper aw man");
			// }
			// });
			minecraft.users[_id].mf.on("health", function() { // health update:
				console.log(`User #${_id} (${username}) health update: ${minecraft.users[_id].mf.health}/20 health, ${minecraft.users[_id].mf.food}/20 food.`);
			});
			minecraft.users[_id].mf.on("death", function() { // when bot dies:
				console.log(`User #${_id} (${username}) health update: dead.`);
				minecraft.users[_id].temp.currentweapon = "n/a";
				minecraft.users[_id].temp.currentarmor = {
					helmet: "n/a",
					chestplate: "n/a",
					leggings: "n/a",
					boots: "n/a"
				}
			});
			// process events --
		});
	}
}

minecraft.adduser("MrTerminator", true).then(function(data) {
	minecraft.users[data._id].mf.on("chat", function(username, message) {
		if (message.toLowerCase().startsWith("kill ")) {
			var target = message.split("kill ")[1].trim();
			if (target == "MrsTerminator") {
				minecraft.users[data._id].mf.chat("No.");
			} else {
				minecraft.users[data._id].temp.functions.terminatePlayer(target, true).then(function(res) {
					if (res == 1) {
						minecraft.users[data._id].mf.chat(`Termination Result: Target ${target} was terminated`);
					} else if (res == 0) {
						minecraft.users[data._id].mf.chat("Termination Result: Retreated due to low health");
					} else if (res == 2) {
						minecraft.users[data._id].mf.chat("Termination Result: No such player");
					} else if (res == 3) {
						minecraft.users[data._id].mf.chat("Termination Result: Invalid Target");
					} else if (res == 4) {
						minecraft.users[data._id].mf.chat(`Termination Result: Target ${target} left the server`);
					} else if (res == 5) {
						minecraft.users[data._id].mf.chat(`Termination Result: Location of target ${target} is unknown`);
					} else if (res == 6) {
						minecraft.users[data._id].mf.chat(`Termination Result: Terminator was terminated`);
					}
				});
			}
		}
	});
});

// minecraft.adduser("DavidOrSomething", true).then(function(data) {
// minecraft.users[data._id].mf.chat("joined");
// minecraft.users[data._id].temp.functions.eatFood().then(function(res) {
// if (res == 1) {
// minecraft.users[data._id].mf.chat("ate food");
// } else if (res == 0) {
// minecraft.users[data._id].mf.chat("couldn't eat food");
// }
// minecraft.users[data._id].temp.functions.equipWeapon().then(function(res) {
// if (res == 1) {
// minecraft.users[data._id].mf.chat("equipped weapon");
// } else if (res == 0) {
// minecraft.users[data._id].mf.chat("couldn't equip weapon");
// }
// });
// });
// });