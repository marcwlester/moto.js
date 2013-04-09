/**
 * @date 	April 2013
 * @author	Marc Lester <marc.w.lester@gmail.com>
 * @licence	This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License. 
 *			To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/.
 */

var RaceScreen = Screen.extend({

	keyBindings: {
		65: 'lean-back',
		68: 'lean-forward',
		75: 'drive',
		76: 'over-drive',
		81: 'quit',
	},

	canvas: null,
	ctx: null,
	debugDraw: null,

	MAX_DRIVE: 28,
	MAX_OVERDRIVE: 36,
	torqueStep: 25,
	torqueValue: 0,
	minTorque: 600,
	maxTorque: 800,

	startTime: 0,
	finishTime: 0,
	endPos: 0,


	rotationDirection: 0,
	lastRotation: 0,
	numFlips: 0,
	startRotation: null,


	boostCount: 0, //how many ticks you can boost for
	boostLength: 60,  //60 ticks a second
	maxBoostCount: 5 * 60,

	motorSoundOn: false,
	menuOpen: false,
	menuCooldown: 0,



	init: function(id) {
		//console.log(this.parent);
		this.parent(id);

		this.canvas = document.getElementById('game_canvas');
		this.ctx = this.canvas.getContext('2d');
		this.debugDraw = new b2DebugDraw();
		this.debugDraw.SetSprite(this.ctx);
		this.debugDraw.SetDrawScale(gPhysicsEngine.scale);
		this.debugDraw.SetFillAlpha(0.3);
		this.debugDraw.SetLineThickness(1.0);
		this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		//this.resize();
	},

	render: function(dt) {
		//if (this.startTime == 0) this.torqueStep = 10;
		//else this.torqueStep = 2;
		if (gInputEngine.action('quit') && this.menuCooldown <= 0) {
			if (!this.menuOpen) {
				jQuery('#race-menu').show();
				this.menuOpen = true;
			} else {
				jQuery('#race-menu').hide();
				this.menuOpen = false;
			}
			this.menuCooldown = 30;
		}
		this.menuCooldown = Math.max(this.menuCooldown - 1, 0);
		if (this.menuOpen) return;

		var inAir = gPhysicsEngine.bodies.bike.rwheel.GetFixtureList().GetUserData().inAir;
		var moving = false;
		gPhysicsEngine.bodies.bike.rjoint.SetMotorSpeed(0);
		if (gInputEngine.action('drive')) {
			// if (!this.motorSoundOn) {
			// 	gSM.playPlayerSound('assets/audio/motor2.wav', {looping: true, volumn: 0.5});
			// 	this.motorSoundOn = true;
			// }
			moving = true;
			this.torqueValue = Math.min(this.torqueValue + this.torqueStep, this.minTorque);
			gPhysicsEngine.bodies.bike.rjoint.SetMotorSpeed(-this.MAX_DRIVE);

		} else if (gInputEngine.action('over-drive')) {
			if (this.boostCount > 0) {
				// if (!this.motorSoundOn) {
				// 	gSM.playPlayerSound('assets/audio/motor2.wav', {looping: true, volumn: 0.5});
				// 	this.motorSoundOn = true;
				// }
				this.torqueValue = Math.min(this.torqueValue + this.torqueStep, this.maxTorque);
				gPhysicsEngine.bodies.bike.rjoint.SetMotorSpeed(-this.MAX_OVERDRIVE);
				this.boostCount -= 1;
				moving = true;
			}
		}
		if (!moving) {
			// if (this.motorSoundOn) {
			// 	this.motorSoundOn = false;
			// 	gSM.stopPlayer();
			// }
		}

		if (gInputEngine.action('lean-back')) {
			
			var angle_speed = 1;
			gPhysicsEngine.bodies.bike.base.ApplyImpulse(new b2Vec2(0,-10 * angle_speed), new b2Vec2(gPhysicsEngine.bodies.bike.base.GetWorldCenter().x + 1.5, gPhysicsEngine.bodies.bike.base.GetWorldCenter().y));
			gPhysicsEngine.bodies.bike.base.ApplyImpulse(new b2Vec2(0,10 * angle_speed), new b2Vec2(gPhysicsEngine.bodies.bike.base.GetWorldCenter().x - 1.5, gPhysicsEngine.bodies.bike.base.GetWorldCenter().y));
		} else if (gInputEngine.action('lean-forward')) {
			var angle_speed = 0.5;
			gPhysicsEngine.bodies.bike.base.ApplyImpulse(new b2Vec2(0,10 * angle_speed), new b2Vec2(gPhysicsEngine.bodies.bike.base.GetWorldCenter().x + 1.5, gPhysicsEngine.bodies.bike.base.GetWorldCenter().y));
		}

		if (inAir) {
			var thisRotation = gPhysicsEngine.bodies.bike.base.GetAngle();
			var thisRotationDirection = this.lastRotation - thisRotation > 0 ? 1 : -1;

			if (this.startRotation == null) {
				//start it as if they left from 0
				this.startRotation = thisRotation;// - ((thisRotation % (Math.PI * 2)));
				//console.log(":" + this.startRotation);
			}
			if (this.rotationDirection != 0 && (this.rotationDirection != thisRotationDirection)) {
				this.startRotation = null;
			}

			this.rotationDirection = thisRotationDirection;
			//this.lastRotation = thisRotation;
		} else {
			if (this.startRotation != null) {
				var rotations = Math.abs(gPhysicsEngine.bodies.bike.base.GetAngle() - (this.startRotation));
				var flips = Math.round(rotations / (Math.PI * 2));

				this.numFlips += flips
				var boostInc = flips * this.boostLength;
				this.boostCount = Math.min(this.boostCount + boostInc, this.maxBoostCount);
			}
			this.rotationCount = 0;
			this.rotationDirection = 0;
			this.lastRotation = 0;
			this.startRotation = null;
		}
		
		gPhysicsEngine.bodies.bike.rjoint.SetMaxMotorTorque(this.torqueValue);


		this.clearScreen();

		jQuery('#torque').html(this.torqueValue);
		jQuery('#speed').html(gPhysicsEngine.bodies.bike.base.GetLinearVelocity().x);
		jQuery('#rotation').html(this.numFlips);
		
		//jQuery('#debug').html(this.endPos + ': ' + gPhysicsEngine.bodies.bike.base.GetPosition().x);
		if (gPhysicsEngine.bodies.bike.base.GetPosition().x >= this.endPos && this.finishTime == 0) {
			this.finishTime = new Date().getTime();
			var raceTime = this.finishTime - this.startTime;
			jQuery('#finish-time').html((raceTime / 1000) + "s");
			jQuery('#finish').show();
			//jQuery('#debug').html(gPhysicsEngine.bodies.bike.base.GetPosition().x);
		} else {
			if (this.finishTime == 0) {
				gPhysicsEngine.world.Step(1/60, 10, 10);		
			}
			
		}



		//jQuery('#rotation').html(gPhysicsEngine.bodies.bike.base.GetAngle() % (Math.PI * 2) + " : " + this.rotationCount);

		gPhysicsEngine.world.DrawDebugData();
		gRenderEngine.render(this.ctx, (this.canvas.width / 3), 100);
		gPhysicsEngine.world.ClearForces();
		
		
		this.torqueValue = Math.max(this.torqueValue - (this.torqueStep/5), 100);

		var head_injury = gPhysicsEngine.bodies.bike.base.GetFixtureList().GetUserData().headInjury;
		if (head_injury) {
			gPhysicsEngine.bodies.bike.base.SetLinearVelocity(new b2Vec2(0,0));
			gPhysicsEngine.bodies.bike.base.SetAngularVelocity(0);
			gPhysicsEngine.bodies.bike.fwheel.SetLinearVelocity(new b2Vec2(0,0));
			gPhysicsEngine.bodies.bike.rwheel.SetLinearVelocity(new b2Vec2(0,0));
			gPhysicsEngine.bodies.bike.fwheel.SetAngularVelocity(0);
			gPhysicsEngine.bodies.bike.rwheel.SetAngularVelocity(0);
			gPhysicsEngine.bodies.bike.base.SetPositionAndAngle(new b2Vec2(gPhysicsEngine.bodies.bike.base.GetPosition().x,0), 0);
			gPhysicsEngine.bodies.bike.fwheel.SetPosition(new b2Vec2(gPhysicsEngine.bodies.bike.fwheel.GetPosition().x,0));
			gPhysicsEngine.bodies.bike.rwheel.SetPosition(new b2Vec2(gPhysicsEngine.bodies.bike.rwheel.GetPosition().x,0));
			gPhysicsEngine.bodies.bike.base.GetFixtureList().GetUserData().headInjury = false;
			this.startRotation = null;
		}

		var elapsedTime = new Date().getTime() - this.startTime;
		jQuery('#elapsed-time').html(elapsedTime / 1000);
	},

	resize: function() {
		this.canvas.width = this.canvas.style.width = jQuery(window).width();
		this.canvas.height = this.canvas.style.height = 800;
		jQuery('#starter').css('left', this.canvas.width / 2 - jQuery('#starter').width() / 2);
	},

	clearScreen: function()
	{
		this.ctx.save();
		this.ctx.setTransform(1,0,0,1,0,0);
		this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
		this.ctx.restore();
	},

	loadTrack: function(track, callback) {
		var self = this;
		xhrGet('assets/tracks/' + track + '.json', function(revent) {
			var data = this.response;
			var tdata = JSON.parse(data);
			gBikeGame.screens['race'].rotationCount = 0;
			gBikeGame.screens['race'].rotationDirection = 0;
			gBikeGame.screens['race'].lastRotation = 0;
			gBikeGame.screens['race'].startRotation = null;
			gBikeGame.screens['race'].finishTime = 0;
			gBikeGame.screens['race'].boostCount = 0
			gRenderEngine.resetRenderer();
			gPhysicsEngine.init();
			gPhysicsEngine.clearBodies();
			gPhysicsEngine.makeTrack(tdata.end * 2, 1);
			gPhysicsEngine.makeBike(5, 1);
			gBikeGame.screens['race'].endPos = tdata.end;
			for (var i = 0; i < tdata.track.length; i++) {
				var pos = tdata.track[i].pos;
				switch(tdata.track[i].type) {
					case "ramp1":
					gPhysicsEngine.makeRamp1(pos, 1);
					break;
					case "ramp2":
					gPhysicsEngine.makeRamp2(pos, 1);
					break;
					case "ramp3":
					gPhysicsEngine.makeRamp3(pos, 1);
					break;
					case "ramp4":
					gPhysicsEngine.makeRamp4(pos, 1);
					break;
					case "ramp5":
					gPhysicsEngine.makeRamp5(pos, 1);
					break;
					case "ramp6":
					gPhysicsEngine.makeRamp6(pos, 1);
					break;
				}
			}
			gPhysicsEngine.makeStarter(8, 1);
			// if (self.debugDraw !== null) {
			// 	//console.log(self.debugDraw);
			// 	gPhysicsEngine.world.SetDebugDraw(self.debugDraw);
			// }
			//console.log(gPhysicsEngine.world);
			
			jQuery('#starter').html('3');
			jQuery('#starter').show();
			setTimeout(function() { jQuery('#starter').html('2'); }, 1000);
			setTimeout(function() { jQuery('#starter').html('1'); }, 2000);
			setTimeout(function() { jQuery('#starter').html('GO!'); }, 3000);
			setTimeout(function() { jQuery('#starter').html(''); jQuery('#starter').hide(); }, 4000);

			setTimeout(function() { 
				gPhysicsEngine.destroyStarter(); 
				gBikeGame.screens['race'].startTime = new Date().getTime(); 
				jQuery('#start-time').html(gBikeGame.screens['race'].startTime);
				gRenderEngine.drawGateUp = false;
			}, 3000);

			callback();
		});
	},

	show: function() {
		this.parent();
		gSM.playSound('assets/audio/track.mp3', {looping: true, volume: 0.0});
		this.menuOpen = false;
		this.menuCooldown = 0;
		jQuery('#race-menu').hide();
	},

	hide: function() {
		this.parent();
		gSM.stopAll();
	}
});

gBikeGame.screens['race'] = new RaceScreen('screen-race');