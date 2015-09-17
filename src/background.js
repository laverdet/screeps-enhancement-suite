"use strict";

let PlayerSounds = function(files) {
	let root = '/audio/terran/';
	function audio(path) {
		let audio = new Audio;
		audio.src = root + path;
		return audio;
	}
	function unitSounds(unit) {
		return {
			action: unit.action.map(audio),
			ready: unit.ready.map(audio),
			death: unit.death.map(audio),
			what: unit.what.map(audio),
			yes: unit.yes.map(audio),
			pissed: unit.pissed.map(audio),
		};
	}
	return {
		sounds: {
			link: files.sounds.link.map(audio),
			built: files.sounds.built.map(audio),
		},
		structures: {
			extension: files.structures.extension.map(audio),
			wall: files.structures.wall.map(audio),
			rampart: files.structures.rampart.map(audio),
			road: files.structures.road.map(audio),
			storage: files.structures.storage.map(audio),
			spawn: files.structures.spawn.map(audio),
			link: files.structures.link.map(audio),
		},
		work: unitSounds(files.work),
		attack: unitSounds(files.attack),
		slow_attack: unitSounds(files.slow_attack),
		ranged_attack: unitSounds(files.ranged_attack),
		slow_ranged_attack: unitSounds(files.slow_ranged_attack),
		heal: unitSounds(files.heal),
		slow_heal: unitSounds(files.slow_heal),
	};
}({
	sounds: {
		link: [ 'structures/tcssca00.mp3' ],
		built: [ 'scv/tscupd00.mp3' ],
	},
	structures: {
		extension: [ 'structures/trewht00.mp3' ],
		wall: [ 'structures/button.mp3' ],
		rampart: [ 'structures/button.mp3' ],
		road: [ 'structures/button.mp3' ],
		storage: [ 'structures/tnswht00.mp3' ],
		spawn: [ 'structures/button.mp3' ],
		link: [ 'structures/tddwht00.mp3' ],
	},
	work: {
		action: ['scv/edrrep00.mp3', 'scv/edrrep01.mp3', 'scv/edrrep02.mp3', 'scv/edrrep03.mp3', 'scv/edrrep04.mp3'],
		ready: ['scv/tscrdy00.mp3'],
		death: ['scv/tscdth00.mp3'],
		what: ['scv/tscwht00.mp3', 'scv/tscwht01.mp3', 'scv/tscwht02.mp3', 'scv/tscwht03.mp3'],
		yes: ['scv/tscyes00.mp3', 'scv/tscyes01.mp3', 'scv/tscyes02.mp3', 'scv/tscyes03.mp3'],
		pissed: ['scv/tscpss00.mp3', 'scv/tscpss01.mp3', 'scv/tscpss02.mp3', 'scv/tscpss03.mp3', 'scv/tscpss04.mp3', 'scv/tscpss05.mp3', 'scv/tscpss06.mp3'],
	},
	attack: {
		action: ['firebat/tfbfir00.mp3', 'firebat/tfbfir01.mp3'],
		ready: ['firebat/tfbrdy00.mp3'],
		death: ['firebat/tfbdth00.mp3', 'firebat/tfbdth01.mp3', 'firebat/tfbdth02.mp3'],
		what: ['firebat/tfbwht00.mp3', 'firebat/tfbwht01.mp3', 'firebat/tfbwht02.mp3', 'firebat/tfbwht03.mp3'],
		yes: ['firebat/tfbyes00.mp3', 'firebat/tfbyes01.mp3', 'firebat/tfbyes02.mp3', 'firebat/tfbyes03.mp3'],
		pissed: ['firebat/tfbpss00.mp3', 'firebat/tfbpss01.mp3', 'firebat/tfbpss02.mp3', 'firebat/tfbpss03.mp3', 'firebat/tfbpss04.mp3', 'firebat/tfbpss05.mp3', 'firebat/tfbpss06.mp3'],
	},
	slow_attack: {
		action: ['goliath/tgofir00.mp3'],
		ready: ['goliath/tgordy00.mp3'],
		death: ['goliath/tgodth00.mp3'],
		what: ['goliath/tgowht00.mp3', 'goliath/tgowht01.mp3', 'goliath/tgowht02.mp3', 'goliath/tgowht03.mp3'],
		yes: ['goliath/tgoyes00.mp3', 'goliath/tgoyes01.mp3', 'goliath/tgoyes02.mp3', 'goliath/tgoyes03.mp3'],
		pissed: ['goliath/tgopss00.mp3', 'goliath/tgopss01.mp3', 'goliath/tgopss02.mp3', 'goliath/tgopss03.mp3', 'goliath/tgopss04.mp3', 'goliath/tgopss05.mp3'],
	},
	ranged_attack: {
		action: ['marine/tmafir00.mp3'],
		ready: ['marine/tmardy00.mp3'],
		death: ['marine/tmadth00.mp3', 'marine/tmadth01.mp3'],
		what: ['marine/tmawht00.mp3', 'marine/tmawht01.mp3', 'marine/tmawht02.mp3', 'marine/tmawht03.mp3'],
		yes: ['marine/tmayes00.mp3', 'marine/tmayes01.mp3', 'marine/tmayes02.mp3', 'marine/tmayes03.mp3'],
		pissed: ['marine/tmapss00.mp3', 'marine/tmapss01.mp3', 'marine/tmapss02.mp3', 'marine/tmapss03.mp3', 'marine/tmapss04.mp3', 'marine/tmapss05.mp3', 'marine/tmapss06.mp3'],
	},
	slow_ranged_attack: {
		action: ['tank/ttafi200.mp3'],
		ready: ['tank/ttardy00.mp3'],
		death: ['tank/ttadth00.mp3'],
		what: ['tank/ttawht00.mp3', 'tank/ttawht01.mp3', 'tank/ttawht02.mp3', 'tank/ttawht03.mp3'],
		yes: ['tank/ttayes00.mp3', 'tank/ttayes01.mp3', 'tank/ttayes02.mp3', 'tank/ttayes03.mp3'],
		pissed: ['tank/ttapss00.mp3', 'tank/ttapss01.mp3', 'tank/ttapss02.mp3', 'tank/ttapss03.mp3'],
	},
	heal: {
		action: ['medic/tmedheal.mp3'],
		ready: ['medic/tmdrdy00.mp3'],
		death: ['medic/tmddth00.mp3'],
		what: ['medic/tmdwht00.mp3', 'medic/tmdwht01.mp3', 'medic/tmdwht02.mp3', 'medic/tmdwht03.mp3'],
		yes: ['medic/tmdyes00.mp3', 'medic/tmdyes01.mp3', 'medic/tmdyes02.mp3', 'medic/tmdyes03.mp3'],
		pissed: ['medic/tmdpss00.mp3', 'medic/tmdpss01.mp3', 'medic/tmdpss02.mp3', 'medic/tmdpss03.mp3', 'medic/tmdpss04.mp3', 'medic/tmdpss05.mp3', 'medic/tmdpss06.mp3'],
	},
	slow_heal: {
		action: ['medic/tmedheal.mp3'],
		ready: ['medic/tmdrdy00.mp3'],
		death: ['medic/tmddth00.mp3'],
		what: ['medic/tmdwht00.mp3', 'medic/tmdwht01.mp3', 'medic/tmdwht02.mp3', 'medic/tmdwht03.mp3'],
		yes: ['medic/tmdyes00.mp3', 'medic/tmdyes01.mp3', 'medic/tmdyes02.mp3', 'medic/tmdyes03.mp3'],
		pissed: ['medic/tmdpss00.mp3', 'medic/tmdpss01.mp3', 'medic/tmdpss02.mp3', 'medic/tmdpss03.mp3', 'medic/tmdpss04.mp3', 'medic/tmdpss05.mp3', 'medic/tmdpss06.mp3'],
	},
});

// Listen for sound requests
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.audio) {
		let sounds;
		console.log(request);
		if (request.unit) {
			sounds = PlayerSounds[request.unit][request.action];
		} else if (request.structure) {
			if (request.action === 'ready') {
				sounds = PlayerSounds.sounds.built;
			} else {
				sounds = PlayerSounds.structures[request.structure];
			}
		}
		sounds[Math.floor(Math.random() * sounds.length)].play();
	}
	sendResponse();
});
