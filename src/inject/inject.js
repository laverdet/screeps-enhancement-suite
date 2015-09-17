"use strict";

// Inject into Screeps document to get crucial state variables
chrome.extension.sendMessage({}, function(response) {
	let readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);

			window.addEventListener('ses-audio', function(ev) {
				chrome.extension.sendMessage({
					audio: true,
					unit: ev.detail.creep,
					structure: ev.detail.structure,
					action: ev.detail.action,
				});
			});

			window.addEventListener('ses-actions', function(ev) {
				let actions = ev.detail;
				actions.forEach(function(action) {
					chrome.extension.sendMessage({
						audio: true,
						unit: action,
						action: 'action',
					});
				});
			});

			let script = document.createElement('script');
			script.textContent = 'new '+ inject;
			document.documentElement.appendChild(script);
			script.parentNode.removeChild(script);
		}
	}, 10);
});

// This code runs in the context of the screeps document
function inject() {
	"use strict";

	// Utility function to defer function call to next tick. Faster than setTimout(..., 0)
	let defer = function() {
		let queue = [], posted = false;

		window.addEventListener('message', function(event) {
			if (event.source === window && event.data === 'nextTick') {
				event.stopPropagation();
				let ticks = queue;
				queue = [];
				posted = false;
				for (var ii = 0; ii < ticks.length; ++ii) {
					ticks[ii]();
				}
			}
		}, true);

		return function(fn) {
			queue.push(fn);
			if (!posted) {
				posted = true;
				postMessage('nextTick', '*');
			}
		};
	}();

	// Send event to the extension
	function notify(eventType, data) {
		let ev = new CustomEvent(eventType, { detail: data });
		window.dispatchEvent(ev);
	}

	// Helper to call callback when children are added to this element
	function listenForChildren(el, fn) {
		let observer = new WebKitMutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				let nodes = mutation.addedNodes;
				for (let ii = 0; ii < nodes.length; ++ii) {
					fn(nodes[ii]);
				}
			});
		});
		observer.observe(el, {
			childList: true,
		});
		return observer;
	}

	// Return a generalized creep type from a body
	function getCreepType(body) {
		let parts = {}, length = 0;
		for (let ii in body) { // this is sometimes an Array, sometimes an Object??
			let part = body[ii];
			++length;
			parts[part.type] = (parts[part.type] || 0) + 1;
		}
		let most;
		['attack', 'ranged_attack', 'heal', 'work'].forEach(function(part) {
			if (parts[part] && (parts[most] || 0) < parts[part]) {
				most = part;
			}
		});
		if (most && most !== 'work') {
			return ((length - parts.move || 0) / parts.move > 1 ? 'slow_' : '') + most;
		} else {
			return 'work';
		}
	}

	// Listen for navigation events
	let destructor;
	let topContent = $('.top-content');
	listenForChildren(topContent[0], function(node) {
		if ($(node).hasClass('page-content')) {
			didNavigate(node);
		}
	});
	let content = topContent.find('.page-content')[0];
	//console.log('tc', topContent[0].innerHTML, window.tc = topContent[0]);
	if (content) {
		didNavigate(content);
	}

	// Called every time we navigate to a new page
	function didNavigate(content) {

		// Clean up hooks
		if (destructor) {
			destructor.callbacks.map(Function.prototype.call);
		}
		destructor = {
			callbacks: [],
			$on: function(ev, cb) {
				if (ev === '$destroy') {
					this.callbacks.push(cb);
				}
			},
			$applyAsync: function(fn) { fn(); },
		};

		//
		// Room page
		let el = $(content).find('.room')[0];
		//console.log('nav', content.innerHTML);
		if (el) {

			// Get current user
			let me;
			angular.element(document.body).injector().invoke(['Auth', function(a) {
				me = a.Me ? a.Me._id : '0'
			}]);

			// Listen for selected object change
			let Room = window.Room = angular.element(el).scope().Room;
			let selectedObject = Room.selectedObject;
			delete Room.selectedObject;
			Object.defineProperty(Room, 'selectedObject', {
				get: function() {
					return selectedObject;
				},
				set: function(val) {
					let stack = {};
					Error.captureStackTrace(stack);
					if (!/reloadRoom/.test(stack.stack) && selectedObject !== val && val && val.user === me) {
						if (val.body) {
							notify('ses-audio', { creep: getCreepType(val.body), action: 'what' });
						} else if (val.type) {
							notify('ses-audio', { structure: val.type, action: 'what' });
						}
					}
					selectedObject = val;
				},
			});

			// Listen for room updates
			let seenObjects;
			let Connection;
			angular.element(document.body).injector().invoke(['Connection', function(val) { Connection = val }]);
			Connection.onRoomUpdate(destructor, function() {
				if (!seenObjects) {
					seenObjects = {};
					Room.objects.forEach(function(object) {
						seenObjects[object._id] = true;
					});
				}
				let actions = [];
				Room.objects.forEach(function(object) {
					if (!seenObjects[object._id]) {
						seenObjects[object._id] = true;
						if (object.user === me && !object.body && object.progressTotal === undefined) {
							notify('ses-audio', { structure: object.type, action: 'ready' });
						}
					}
					if (object.user === me && object.body && object.ageTime === Room.gameTime + Room.Constants.CREEP_LIFE_TIME - 1) {
						notify('ses-audio', { creep: getCreepType(object.body), action: 'ready' });
					}

					if (object.actionLog) {
						let al = object.actionLog;
						let isSlow = /slow_/.test(getCreepType(object.body));
						if (al.build || al.harvest || al.repair || al.reserveController || al.upgradeController) {
							actions.push('work');
						}
						if (al.attack || al.rangedAttack || al.rangedMassAttack) {
							let type = getCreepType(object.body);
							if (/attack/.test(type)) {
								actions.push(type);
							} else {
								let isSlow = /slow_/.test(getCreepType(object.body));
								actions.push(isSlow+ (al.attack ? 'attack' : 'ranged_attack'));
							}
						}
						if (al.heal) {
							actions.push('heal');
						}
					}
				});
				notify('ses-actions', actions);
			});

			// Listen for clicks
			el.addEventListener('contextmenu', function(ev) {
				ev.preventDefault();

				if (Room.selectedObject && Room.selectedObject.user === me) {
					let targets = [];
					Room.objects.forEach(function(object) {
						if (
							object.x === Room.cursorPos.x && object.y === Room.cursorPos.y &&
							object.type !== 'wall' && object.type !== 'swamp'
						) {
							targets.push('Game.getObjectById("'+ object._id+ '")');
						}
					});
					if (targets.length === 0) {
						targets.push('new RoomPosition('+ Room.cursorPos.x+ ', '+ Room.cursorPos.y+ ', "'+ (Room.roomName || 'sim')+ '")');
					}
					notify('ses-audio', { creep: getCreepType(Room.selectedObject.body), action: 'yes' });

					// Send default right-click macro
					let Console = angular.element($('.console')).scope().Console;
					Console.command = 'require("ses").defaultAction(Game.getObjectById("'+ Room.selectedObject._id+ '"), ['+ targets.join(', ')+ '])';
					Console.sendCommand();
				}
				return false;
			}, true);
			return;
		}

		//
		// Game overview page
		el = $(content).find('.game-overview')[0];
		if (el) {
			angular.element(document.body).injector().invoke(['Connection', 'Socket', 'Auth', function(Connection, Socket, Auth) {
				function sendStats() {
					Connection.sendConsoleCommand('"ses-stats:"+ JSON.stringify(require("ses").roomStats())');
				}
				let interval = setInterval(sendStats, 5000);
				setTimeout(sendStats, 1000);
				destructor.$on('$destroy', function() {
					clearInterval(interval);
				});
				Socket.bindEventToScope(destructor, 'user:' + Auth.Me._id + '/console', function(log) {
					log.messages.results.forEach(function(str) {
						let stats = /^ses-stats:(.+)/.exec(str);
						if (stats) {
							stats = JSON.parse(stats[1]);
							for (let room in stats) {
								let roomElement = $(el).find('.room-title:contains('+ room+ ')').parents('.room-item')[0];
								if (roomElement) {
									let statsElement = roomElement.lastChild.className === 'ses-stats' ? roomElement.lastChild : undefined;
									if (!statsElement) {
										statsElement = $('<table class="ses-stats">');
										roomElement.appendChild(statsElement[0]);
									} else {
										statsElement = $(statsElement).empty();
									}
									let roomStats = stats[room];
									let count = 0;
									for (let stat in roomStats) {
										++count;
										statsElement.append(
											$('<tr>').append(
												$('<th>').text(stat),
												$('<td>').text(roomStats[stat])
											)
										);
									}
									statsElement.css('fontSize' , (14 - Math.max(0, count - 3) * 2)+ 'px');
								}
							}
						}
					});
				});
			}]);
			return;
		}

		//
		// Game type selection page (jumpstarts in Game page)
		el = $(content).find('.game-switch-container')[0];
		if (el) {
			//console.log('nav-sswitch', el.parentNode.innerHTML, window.na = el.parentNode);
			let observer = listenForChildren(el.parentNode, function(node) {
				if ($(node).hasClass('game-switch-container')) {
					observer.disconnect();
					observer2.disconnect();
					observer = listenForChildren(node, function(node) {
						observer.disconnect();
						didNavigate(content);
					});
				}
			});
			let observer2 = listenForChildren(el, function(node) {
				observer.disconnect();
				observer2.disconnect();
				didNavigate(content);
			});
			return;
		}
	}

	/*
	Connection.onConsoleUpdate(function(ev) {
		let results = ev.messages.results;
		results.forEach(function(str) {
			...
		});
	});
	*/
}
