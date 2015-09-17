"use strict";
function serialize(obj) {
	if (obj instanceof RoomPosition) {
		return obj;
	} else {
		return obj.id;
	}
}

function deserialize(json) {
	if (json.roomName) {
		return new RoomPosition(json.x, json.y, json.roomName);
	} else {
		return Game.getObjectById(json);
	}
}

function pretty(number) {
	let mag = Math.floor(Math.log10(number) / 3);
	return Math.floor(number / Math.pow(10, mag * 3) * 100) / 100 + ['', 'K', 'M', 'B'][mag];
}

let ses = module.exports = {

	// Extra stats for overview page
	roomStats: function() {
		let stats = {};
		_.forEach(Game.rooms, function(room) {
			if (room.controller && room.controller.my) {
				let ramparts = room.find(FIND_MY_STRUCTURES).filter(function(structure) {
					return structure.structureType === STRUCTURE_RAMPART;
				});
				let rampartHits = Math.floor(ramparts.reduce(function(val, structure) {
					return val + structure.hits;
				}, 0) / ramparts.length);
				stats[room.name] = {
					Controller: room.controller.level === 8 ? 'Max' : pretty(room.controller.progress)+ ' / '+ pretty(room.controller.progressTotal)+ ' ('+ room.controller.level+ ')',
					Energy: pretty(room.energyAvailable)+ ' / '+ pretty(room.energyCapacityAvailable),
					Ramparts: ramparts.length && pretty(rampartHits)+ ' ('+ ramparts.length+ ')',
					Storage: room.storage && pretty(room.storage.store.energy),
				};
			}
		});
		return stats;
	},

	// Call this every tick to continue executing actions
	execute: function() {
		if (!Memory.ses || !Memory.ses.actions) {
			return;
		}
		let actions = Memory.ses.actions;
		delete Memory.ses.actions;
		for (let id in actions) {
			let actor = Game.getObjectById(id);
			if (actor) {
				let args = [ actor ];
				actions[id].args.forEach(function(arg) {
					if (Array.isArray(arg)) {
						args.push(arg.map(deserialize));
					} else {
						args.push(deserialize(arg));
					}
				});
				ses[actions[id].fn].apply(null, args);
			}
		}
	},

	// Continue an action on next tick
	continueAction: function(fn, actor) {
		let args = [];
		for (let ii = 2; ii < arguments.length; ++ii) {
			if (Array.isArray(arguments[ii])) {
				args.push(arguments[ii].map(serialize));
			} else {
				args.push(arguments[ii].id);
			}
		}
		if (!Memory.ses) {
			Memory.ses = {};
		}
		if (!Memory.ses.actions) {
			Memory.ses.actions = {};
		}
		Memory.ses.actions[actor.id] = { fn, args };
	},

	// Called on right click
	defaultAction: function(actor, targets) {
		let range, targetIndex;
		[
		    // Attack
		    function(target) {
						let controlledRoom = target.room && target.room.controller && target.room.controller.my;
		        if (
							(target.my === false && target.hits && (actor.getActiveBodyparts(ATTACK) || actor.getActiveBodyparts(RANGED_ATTACK))) ||
							(controlledRoom === false && (target.structureType === STRUCTURE_ROAD || target.structureType === STRUCTURE_WALL))
						) {
		            range = actor.getActiveBodyparts(ATTACK) ? 1 : 3;
		            actor.attack(target);
		            actor.rangedAttack(target);
		            return true;
		        }
		    },
			// Work
			function(target) {
				if (actor.getActiveBodyparts(WORK)) {
					if (actor.carry.energy && (target.my || (target.structureType === STRUCTURE_CONTROLLER && target.owner === undefined))) {
						if (target instanceof ConstructionSite) {
							range = 1;
							actor.build(target);
							return true;
						} else if (target.structureType === STRUCTURE_CONTROLLER) {
						    range = 1;
						    actor.claimController(target);
						    actor.upgradeController(target);
						    return true;
						} else if (target instanceof Structure && target.hits < target.hitsMax) {
							range = 1;
							actor.repair(target);
							return true;
						}
					}
					if (target instanceof Source && target.energy) {
						range = 1;
						actor.harvest(target);
						return true;
					}
				}
			},
			// Pickup energy
			function(target) {
				if (target instanceof Energy && actor.carryCapacity && actor.carry.energy < actor.carryCapacity) {
					range = 1;
					actor.pickup(target);
					return true;
				}
			},
			// Give energy to target
			function(target) {
				if (target.my && actor.carry.energy &&
				    (
				        ((target.structureType === STRUCTURE_SPAWN || target.structureType === STRUCTURE_EXTENSION || target.structureType === STRUCTURE_LINK) &&
				            target.energy < target.energyCapacity) ||
				        (target.structureType === STRUCTURE_STORAGE && target.store.energy < target.storeCapacity) ||
				        (target instanceof Creep && target.carry.energy < target.carryCapacity)
				    )
				) {
				    range = 1;
				    actor.transferEnergy(target);
				    return true;
				}
			},
			// Move
			function(target) {
				if (target instanceof RoomPosition || target.structureType === STRUCTURE_ROAD || (target.structureType === STRUCTURE_RAMPART && target.my)) {
					range = 0;
				} else {
					range = 1;
				}
				if (actor.pos.getRangeTo(target) > range) {
					return true;
				}
			}
		].some(function(fn) {
			targetIndex = _.findIndex(targets.filter(function(t) { return t; }), fn);
			if (targetIndex !== -1) {
				let target = targets[targetIndex];
				if (actor.pos.getRangeTo(target) > range) {
					let ret = actor.moveTo(target);
					if (ret === ERR_NO_BODYPART || ret === ERR_NO_PATH) {
						return;
					}
				} else {
					actor.cancelOrder('move');
				}
				ses.continueAction('defaultAction', actor, [ target ]);
				return true;
			}
		});
	},
};
