//some music http://ozzed.net/music/


console.log(jQuery(window).width());
console.log(jQuery(document).width());
jQuery('#screen-race').show();
Math.TWOPI = Math.PI * 2;
var canvas = document.getElementById('game_canvas');
var ctx = canvas.getContext('2d');
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint;
var b2PrismaticJoint = Box2D.Dynamics.Joints.b2PrismaticJoint;
var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

var update_frequecy = 1/60;

var gravity = new b2Vec2(0,12.7);
var world = new b2World(gravity,true);
var input = new THREEx.KeyboardState();

var debugDraw = new b2DebugDraw();

var MAX_SPEED = 20;
var MAX_TURBO = 36;

var MIN_ANGLE = -0.8;
var MAX_ANGLE = 0.8;

var logging = false;
function clog(message) {
	if (logging) {
		console.log(message);
	}
}

function onResize() {
	canvas.width = canvas.style.width = jQuery(window).width();
	canvas.height = canvas.style.height = 800;
}

function makeBody(world, options) {
	options = options || {};
	var def = new b2BodyDef();
	def.position.x = options.x;
	def.position.y = options.y;
	def.position = new b2Vec2(options.x, options.y);
	def.type = options.type == 'static' ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
	var body = world.CreateBody(def);
	body.SetUserData(options.userdata || {});

	var fixture = new b2FixtureDef();
	fixture.density = options.density || 0;
	fixture.friction = options.friction || 1;
	fixture.restitution = options.restitution || 0;
	fixture.filter.categoryBits = options.categoryBits || 0x0001;
    fixture.filter.maskBits = options.maskBits || 0xFFFF;
    fixture.filter.groupIndex = options.groupIndex || 0;
	switch(options.shape) {
		case "circle":
		fixture.shape = new b2CircleShape(options.radius || 1);
		break;
		case "polygon":
		fixture.shape = new b2PolygonShape();
		fixture.shape.SetAsArray(options.points, options.points.length);
		break;
		case "block":
		fixture.shape = new b2PolygonShape();
		if (options.orientation) {
			fixture.shape.SetAsOrientedBox(options.width / 2, options.height / 2, options.orientation.position, options.orientation.angle)
		} else {
			fixture.shape.SetAsBox(options.width / 2, options.height / 2);
		}
		break;
	}

	var fxtr = body.CreateFixture(fixture);
	fxtr.SetUserData(options.userdata);

	return body;
}

function makeBodyEx(world, options) {
	options = options || {};
	
	var def = new b2BodyDef();
	def.position = new b2Vec2(options.pos.x, options.pos.y);
	def.type = options.type == 'static' ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
	var body = world.CreateBody(def);
	body.SetUserData(options.userdata || {});
	//body.m_userData = options.userdata || {};

	options.fixtures = options.fixtures || [];
	for (var i = 0; i < options.fixtures.length; i++) {
		var fOptions = options.fixtures[i];
		var fixture = new b2FixtureDef();
		fixture.density = fOptions.density || 1;
		fixture.friction = fOptions.friction || 1;
		fixture.restitution = fOptions.restitution || 0;
		fixture.filter.categoryBits = fOptions.categoryBits || 0x0001;
		fixture.filter.maskBits = fOptions.maskBits || 0xFFFF;
		fixture.filter.groupIndex = fOptions.groupIndex || 0;
		//fixture.SetUserData(fOptions.userdata);
		//fOptions.x = typeof fOptions.pos.x === 'undefined' || options.pos.x;
		//fOptions.y = fOptions.pos.y || options.pos.y;
		//console.log(fOptions.x + " : " + options.x);
		//console.log(fOptions.x || options.x);
		//console.log(fOptions.y + " : " + options.y);
		//console.log(fOptions.y || options.y);

		switch (fOptions.shape) {
			case "circle":
			fOptions.radius = fOptions.radius || 1;
			fixture.shape = new b2CircleShape(fOptions.radius);
			fixture.shape.m_p.Set(fOptions.pos.x, fOptions.pos.y);
			//fixture.shape.SetLocalPosition(new b2Vec2(fOptions.x, fOptions.y));
			break;
			case "polygon":
			fixture.shape = new b2PolygonShape();
			fixture.shape.SetAsArray(fOptions.points, fOptions.points.length);
			break;
			case "block":
			fOptions.width = fOptions.width || 1;
			fOptions.height = fOptions.height || 1;
			fixture.shape = new b2PolygonShape();
			
			fOptions.rotation = fOptions.rotation || 0;
			fixture.shape.SetAsOrientedBox(fOptions.width / 2, fOptions.height / 2, new b2Vec2(fOptions.pos.x, fOptions.pos.y), fOptions.rotation);			
			break;
		}

		//console.log(fOptions);

		var fxtr = body.CreateFixture(fixture);
		fxtr.SetUserData(fOptions.userdata);
	}

	return body;
}

var bike_in_air = true;
var head_injury = false;

var listener = new Box2D.Dynamics.b2ContactListener;
listener.BeginContact = function(contact) {
	clog('start');
	//clog(contact.GetFixtureA().GetBody().GetUserData());
	//clog(contact.GetFixtureB().GetBody().GetUserData());
	clog(contact.GetFixtureA().GetFilterData().groupIndex);
	//clog(contact.GetFixtureB().GetFilterData().groupIndex);
	if (contact.GetFixtureA().GetFilterData().groupIndex == 2) {
		//bike_in_air = false;
	}
	if (contact.GetFixtureB().GetFilterData().groupIndex == 4) {
		head_injury = true;
	}
	if (contact.GetFixtureA().GetFilterData().groupIndex == 7) {
		//console.log('rear begin A');
	}
	if (contact.GetFixtureB().GetFilterData().groupIndex == 7) {
		//console.log('rear begin B');
		var contactId = contact.GetFixtureA().GetUserData().id;
		if (!contact.GetFixtureB().GetUserData().contacts) contact.GetFixtureB().GetUserData().contacts = [];
		var index = contact.GetFixtureB().GetUserData().contacts.indexOf(contactId);
		//console.log(index);
		if (index == -1) {
			contact.GetFixtureB().GetUserData().contacts.push(contactId);
			bike_in_air = false;
		}

		//contact.GetFixtureB().userdata.contacts.push(contact.GetFixtureA());
		
		//console.log(contact.GetFixtureA().GetUserData());
	}
	//console.log(contact.GetFixtureA());
}
listener.EndContact = function(contact) {
	clog('end');
	//clog(contact.GetFixtureA().GetBody().GetUserData());
	//clog(contact.GetFixtureB().GetBody().GetUserData());
	clog(contact.GetFixtureA().GetFilterData().groupIndex);
	//clog(contact.GetFixtureB().GetFilterData().groupIndex);
	if (contact.GetFixtureA().GetFilterData().groupIndex == 2) {
		//bike_in_air = true;
	}

	if (contact.GetFixtureA().GetFilterData().groupIndex == 7) {
		//console.log('rear end A');
	}
	if (contact.GetFixtureB().GetFilterData().groupIndex == 7) {
		//console.log('rear end B');
		var contactId = contact.GetFixtureA().GetUserData().id;
		if (!contact.GetFixtureB().GetUserData().contacts) contact.GetFixtureB().GetUserData().contacts = [];
		var index = contact.GetFixtureB().GetUserData().contacts.indexOf(contactId);
		if (index >= 0) {
			//console.log(contactId);
			contact.GetFixtureB().GetUserData().contacts.splice(index, 1);
			if (contact.GetFixtureB().GetUserData().contacts.length == 0) {
				bike_in_air = true;
			}
		}
		//console.log(index);
		//console.log(contact.GetFixtureB().GetUserData().contacts);
	}
}
listener.PostSolve = function(contact, impulse) {

}
listener.PreSolve = function(contact, oldManifold) {

}
world.SetContactListener(listener);



var floor = makeBody(world, {
	shape: 'block',
	type: 'static',
	x: 480,
	y: 20,
	height: 0.5,
	width: 1000,
	groupIndex: 2,
	friction: 1,
	density: 0,
	userdata: {
		name: 'floor',
		id: 1
	}
});
/*
var ramp1a = makeBody(world, {
	shape: 'block',
	type: 'static',
	x: 30,
	y: 19,
	height: 1,
	width: 5,
	groupIndex: 2,
	orientation: {
		position: new b2Vec2(0, 0),
		angle: -0.5,
	},
	friction: 1,
	density: 0,
	userdata: {
		name: 'ramp 1'
	}
});

var ramp1b = makeBody(world, {
	shape: 'block',
	type: 'static',
	x: 35,
	y: 19,
	height: 1,
	width: 5,
	groupIndex: 2,
	orientation: {
		position: new b2Vec2(0, 0),
		angle: 0.5,
	},
	friction: 1,
	density: 0,
	userdata: {
		name: 'ramp 1'
	}
});

var ramp1c = makeBody(world, {
	shape: 'block',
	type: 'static',
	x: 32.5,
	y: 19,
	height: 3.3,
	width: 1,
	groupIndex: 2,
	friction: 1,
	density: 0,
	userdata: {
		name: 'ramp 1'
	}
});*/
/*
var ramp2a = makeBody(world, {
	shape: 'block',
	type: 'static',
	x: 30 + 20,
	y: 18.5,
	height: 1,
	width: 5.7,
	groupIndex: 2,
	orientation: {
		position: new b2Vec2(0, 0),
		angle: -0.7,
	},
	friction: 1,
	density: 0
});

var ramp2b = makeBody(world, {
	shape: 'block',
	type: 'static',
	x: 35 + 20,
	y: 18.5,
	height: 1,
	width: 5.7,
	groupIndex: 2,
	orientation: {
		position: new b2Vec2(0, 0),
		angle: 0.7,
	},
	friction: 1,
	density: 0
});

var ramp2c = makeBody(world, {
	shape: 'block',
	type: 'static',
	x: 32.5 + 20,
	y: 18.5,
	height: 4.5,
	width: 1.2,
	groupIndex: 2,
	friction: 1,
	density: 0
});*/

var ramp3 = makeBodyEx(world, {
	type: 'static',
	pos: {x: 31.2+120, y: 19.6},
	fixtures: [{
		shape: 'block',
		groupIndex: 2,
		friction: 1,
		density: 0,
		pos: {x: 0.2, y: -0.4},
		width: 0.6,
		height: 2,
		userdata: {
			id: 2
		}
	},{
		shape: 'block',
		groupIndex: 2,
		friction: 1,
		density: 0,
		pos: {x: -1.2, y: -0.3},
		width: 0.7,
		height: 2.9,
		rotation: 1,
		userdata: {
			id: 3
		}
	}],
});

// var ramp5 = makeBodyEx(world, {
// 	type: 'static',
// 	pos: { x: 60, y: 19.3 },
// 	fixtures: [{
// 		shape: 'block',
// 		pos: { x: 0, y: -1 },
// 		width: 6,
// 		height: 0.6,
// 		rotation: -Math.PI / 4,
// 		userdata: { id: 99 }
// 	},{
// 		shape: 'block',
// 		pos: {x: 3.4, y: -3.0},
// 		width: 3,
// 		height: 0.6,
// 		userdata: {id: 98}
// 	},{
// 		shape: 'block',
// 		pos: {x: 6.5, y: -4.9},
// 		width: 6,
// 		height: 0.6,
// 		rotation: -Math.PI / 4,
// 		userdata: { id: 97 }
// 	}, {
// 		shape: 'block',
// 		pos: {x: 10.4, y: -6.9},
// 		width: 4,
// 		height: 0.6,
// 		userdata: {id: 96}
// 	}, {
// 		shape: 'block',
// 		pos: {x: 14.8, y: -5.4},
// 		width: 6,
// 		height: 0.6,
// 		rotation: Math.PI / 6,
// 		userdata: {id: 95}
// 	},{
// 		shape: 'block',
// 		pos: {x: 19.5, y: -3.9},
// 		width: 4,
// 		height: 0.6,
// 		userdata: {id: 94}
// 	},{
// 		shape: 'block',
// 		pos: {x: 25.4, y: -1.6},
// 		width: 9.2,
// 		height: 0.6,
// 		rotation: Math.PI / 6,
// 		userdata: {id: 93}
// 	}
// 	]
// });

var ramp6 = makeBodyEx(world, {
	type: 'static',
	pos: { x: 5, y: 19.3 },
	fixtures: [{
		shape: 'block',
		pos: {x: 0, y: -0.8},
		width: 5,
		height: 0.6,
		rotation: -Math.PI / 6,
		groupIndex: 2,
		friction: 1,
		density: 0,
		userdata: {
			id: 1400
		}
	},{
		shape: 'block',
		pos: {x: 4, y: -0.8},
		width: 5,
		height: 0.6,
		rotation: Math.PI / 6,
		groupIndex: 2,
		friction: 1,
		density: 0,
		userdata: {
			id: 1401
		}
	}],
});

var ramp7 = makeBodyEx(world, {
	type: 'static',
	pos: { x: 10, y: 19.3 },
	fixtures: [{
		shape: 'block',
		pos: { x: 2.6, y: 0 },
		width: 5,
		height: 0.6,
		rotation: Math.PI / 6,
		userdata: { id: 99 }
	},{
		shape: 'block',
		pos: {x: 0, y: 0},
		width: 3,
		height: 0.6,
		rotation: -Math.PI / 3,
		userdata: {id: 98 }
	}]
});

/*
var ramp3a = makeBody(world, {
	shape: 'block'
	type: 'static',
	x: 30 + 40,
	y: 19.2,
	height: 1,
	width: 3,
	groupIndex: 2,
	orientation: {
		position: new b2Vec2(0, 0),
		angle: -0.7,
	},
	friction: 1,
	density: 0
});
var ramp3c = makeBody(world, {
	shape: 'block',
	type: 'static',
	x: 31.2 + 40,
	y: 19.2,
	height: 2.6,
	width: 0.7,
	groupIndex: 2,
	friction: 1,
	density: 0
});
*/
var ramp4a = makeBody(world, {
	shape: 'block',
	type: 'static',
	x: 500,
	y: 20,
	height: 1,
	width: 1,
	groupIndex: 2,
	orientation: {
		position: new b2Vec2(0, 0),
		angle: -Math.PI/4,
	},
	friction: 10,
	density: 0,
	userdata: {
		id: 4
	}
});


//var base = null, rwheel = null, fwheel = null, raxle = null, faxle = null;
/*var base = makeBody(world, {
	shape: 'block',
	type: 'dynamic',
	x: 5,
	y: 13,
	width: 3,
	height: 0.9,
	
	density: 10,
	groupIndex: 1,
	userdata: {
		name: 'base'
	}
});*/

var base = makeBodyEx(world, {
	type: 'dynamic',
	pos: {x: 0, y: 0},
	fixtures: [{
		shape: 'block',
		pos: {x: 0, y: 0},
		width: 3,
		height: 1,
		density: 10,
		groupIndex: 1,
		userdata: {
			name: 'base',
			id: 5,
		}
	},{
		shape: 'circle',
		pos: {x: 0.5, y: -3},
		radius: 0.75,
		density: 1,
		groupIndex: 4,
		userdata: {
			name: 'head',
			id: 6,
		}
	}]
});


var rwheel = makeBodyEx(world, {
	type: 'dynamic',
	pos: {x: 0, y: 0},
	fixtures: [{
		shape: 'circle',
		pos: {x: 0, y: 0},
		radius: 1,
		density: 2,
		friction: 30,
		restitution: 0.4,
		groupIndex: 7,
		userdata: {
			name: 'rear wheel',
			id: 7,
		}
	}]
	
});
var fwheel = makeBodyEx(world, {
	type: 'dynamic',
	pos: {x: 0, y: 0},
	fixtures: [{
		shape: 'circle',
		pos: {x: 0, y: 0},
		radius: 1,
		density: 1,
		friction: 30,
		restitution: 0.3,
		groupIndex: 8,
		userdata: {
			name: 'front wheel',
			id: 8,
		}
	}]
	
});


var fwheelJointDef = new b2RevoluteJointDef();
fwheelJointDef.bodyA = fwheel;
fwheelJointDef.bodyB = base;
fwheelJointDef.collideConnected = false;
fwheelJointDef.localAnchorA.Set(0,0);
fwheelJointDef.localAnchorB.Set(1.5,0);
fwheelJointDef.enableMotor = true;
//fwheelJointDef.maxMotorTorque = 5;
//fwheelJointDef.motorSpeed = 0;
var fwheelJoint = world.CreateJoint(fwheelJointDef);

var rwheelJointDef = new b2RevoluteJointDef();
rwheelJointDef.bodyA = rwheel;
rwheelJointDef.bodyB = base;
rwheelJointDef.collideConnected = false;
fwheelJointDef.localAnchorA.Set(0,0);
rwheelJointDef.localAnchorB.Set(-1.5,0);
rwheelJointDef.enableMotor = true;
//rwheelJointDef.maxMotorTorque = 5;
//rwheelJointDef.motorSpeed = 0;
var rwheelJoint = world.CreateJoint(rwheelJointDef);

var bike_images = {};
var bike_red = document.getElementById('bike-red');
bike_images['red'] = {
	img: bike_red,
	width: bike_red.width,
	height: bike_red.height,
	half_width: bike_red.width / 2,
	half_height: bike_red.height / 2,
	x_offset: 0,
	y_offset: -10
};
bike_images['body-red'] = {
	img: document.getElementById('bike-body-red'),
	width: document.getElementById('bike-body-red').width,
	height: document.getElementById('bike-body-red').height,
	half_width: document.getElementById('bike-body-red').width / 2,
	half_height: document.getElementById('bike-body-red').height / 2,
	x_offset: 0,
	y_offset: -10
};
bike_images['wheel'] = {
	img: document.getElementById('bike-wheel'),
	width: document.getElementById('bike-wheel').width,
	height: document.getElementById('bike-wheel').height,
	half_width: document.getElementById('bike-wheel').width / 2,
	half_height: document.getElementById('bike-wheel').height / 2
};

bike_images['ramp-1'] = {
	img: document.getElementById('ramp-1'),
	width: document.getElementById('ramp-1').width,
	height: document.getElementById('ramp-1').height,
	half_width: document.getElementById('ramp-1').width / 2,
	half_height: document.getElementById('ramp-1').height / 2,
	x_offset: 0,
	y_offset: -9
}
bike_images['ramp-2'] = {
	img: document.getElementById('ramp-2'),
	width: document.getElementById('ramp-2').width,
	height: document.getElementById('ramp-2').height,
	half_width: document.getElementById('ramp-2').width / 2,
	half_height: document.getElementById('ramp-2').height / 2,
	x_offset: -18,
	y_offset: -12
}

var background_img = document.getElementById('img-background');
//console.log(bike_images);
//world.DrawDebugData();

var world_x_offset = base.GetPosition().x;
console.log((canvas.width));
var screen_x_offset = 500;//- (canvas.width / 2);
var screen_y_offset = 100;
var bg_offsets = [0, background_img.width, background_img.width * 2, background_img.width * 3];
var bg_offset = 0;
var motor_speed = 0;
var motor_on = false;
var torqueValue = 0;

function render()
{
	ctx.save();
	ctx.setTransform(1,0,0,1,0,0);
	ctx.clearRect(0,0, canvas.width, canvas.height);
	ctx.restore();

	
	//rwheel.GetFixtureList().SetDensity(5);
	//fwheel.GetFixtureList().SetDensity(5);
	// motor_on = false;
	// if (!bike_in_air) {
	// 	if (input.pressed('k')) {
	// 		if (base.GetLinearVelocity().x < MAX_SPEED) {
	// 			//base.ApplyImpulse(new b2Vec2(10,0), base.GetWorldCenter());
	// 			motor_speed = Math.min(motor_speed + 0.05, 20);
	// 			rwheelJoint.SetMotorSpeed(-motor_speed);
				
	// 			motor_on = true;
	// 		}
	// 		rwheelJoint.SetMaxMotorTorque(200);
			
	// 	}
	// 	else if (input.pressed('l')) {
	// 		if (base.GetLinearVelocity().x < MAX_TURBO) {
	// 			motor_speed += Math.min(motor_speed + 0.05, 20);
	// 			//base.ApplyImpulse(new b2Vec2(10,0), base.GetWorldCenter());
	// 			rwheelJoint.SetMotorSpeed(-motor_speed);
				
	// 			motor_on = true;
	// 		}
	// 		rwheelJoint.SetMaxMotorTorque(800);
			
	// 	}
	// 	else if (input.pressed('space')) {
	// 		//base.ApplyImpulse(new b2Vec2(50,0), base.GetWorldCenter());
	// 		//base.SetAngle(0.1);
	// 	}
	// } else {
	// 	console.log('air time!');
	// }
	// if (!motor_on) {
	// 	motor_speed -= Math.max(motor_speed - 0.05, 0);
	// 	rwheelJoint.SetMotorSpeed(motor_speed);
	// 	rwheelJoint.SetMaxMotorTorque(200);
	// }

	rwheelJoint.SetMotorSpeed(0);
	if (input.pressed('k')) {
		torqueValue = Math.min(torqueValue + 25, 600);
		rwheelJoint.SetMotorSpeed(-28);
	} else if (input.pressed('l')) {
		torqueValue = Math.min(torqueValue + 25, 800);
		rwheelJoint.SetMotorSpeed(-36);
	}

	rwheelJoint.SetMaxMotorTorque(torqueValue);

	if (input.pressed('a')) {
		//if (base.GetAngle() % (Math.PI * 2) > MIN_ANGLE) {
			//var angle_speed = Math.min((MIN_ANGLE - base.GetAngle()) / MIN_ANGLE, 1);
			var angle_speed = 1;
			base.ApplyImpulse(new b2Vec2(0,-10 * angle_speed), new b2Vec2(base.GetWorldCenter().x + 1.5, base.GetWorldCenter().y));
			base.ApplyImpulse(new b2Vec2(0,10 * angle_speed), new b2Vec2(base.GetWorldCenter().x - 1.5, base.GetWorldCenter().y));
			//base.SetAngle(base.GetAngle() - 0.05);
			//rwheel.SetDensity(20);
			//rwheel.GetFixtureList().SetDensity(50);
		//}
	} else if (input.pressed('d')/* && bike_in_air*/) {
		//if (base.GetAngle() % (Math.PI * 2) < MAX_ANGLE) {
			//var angle_speed = Math.min((MAX_ANGLE - base.GetAngle()) / MAX_ANGLE, 1);
			var angle_speed = 1;
			base.ApplyImpulse(new b2Vec2(0,10 * angle_speed), new b2Vec2(base.GetWorldCenter().x + 1.5, base.GetWorldCenter().y));
			//base.ApplyImpulse(new b2Vec2(0,10 * angle_speed), new b2Vec2(base.GetWorldCenter().x - 1.5, base.GetWorldCenter().y));
			//base.SetAngle(base.GetAngle() + 0.05);
			//fwheel.SetDensity(20);
			//fwheel.GetFixtureList().SetDensity(50);
		//}
	}

	if (input.pressed('space')) {
		//base.ApplyImpulse(new b2Vec2(50,0), base.GetWorldCenter());
		//base.SetAngle(0);
		base.SetAngularVelocity(0);
	}
	//rwheel.ResetMassData();
	//fwheel.ResetMassData();
	//console.log(rwheel.GetMass());

	

	if (input.pressed('p')) {
		logging = !logging;
	}

/*
	if (base.GetAngle() < MIN_ANGLE) {
		base.SetAngle(MIN_ANGLE);
	}
	if (base.GetAngle() > MAX_ANGLE) {
		base.SetAngle(MAX_ANGLE);
	}
*/
	/*if (input.pressed("a")) {
		rwheelJoint.SetMotorSpeed(15 * Math.PI);
		fwheelJoint.SetMotorSpeed(15 * Math.PI);
		rwheelJoint.SetMaxMotorTorque(50);
		fwheelJoint.SetMaxMotorTorque(50);
	} else if (input.pressed("d")) {
		rwheelJoint.SetMotorSpeed(-205 * Math.PI);
		//fwheelJoint.SetMotorSpeed(-205 * Math.PI);
		rwheelJoint.SetMaxMotorTorque(190);
		//fwheelJoint.SetMaxMotorTorque(190);
	} else {
		rwheelJoint.SetMotorSpeed(0);
		fwheelJoint.SetMotorSpeed(0);
		rwheelJoint.SetMaxMotorTorque(0);
		fwheelJoint.SetMaxMotorTorque(0);
	}*/
	world.Step(1/60, 10, 10);

	if (head_injury) {
		base.SetLinearVelocity(new b2Vec2(0,0));
		base.SetAngularVelocity(0);
		fwheel.SetLinearVelocity(new b2Vec2(0,0));
		rwheel.SetLinearVelocity(new b2Vec2(0,0));
		fwheel.SetAngularVelocity(0);
		rwheel.SetAngularVelocity(0);
		base.SetPositionAndAngle(new b2Vec2(base.GetPosition().x,0), 0);
		fwheel.SetPosition(new b2Vec2(fwheel.GetPosition().x,0));
		rwheel.SetPosition(new b2Vec2(rwheel.GetPosition().x,0));
		head_injury = false;
	}

	world_x_offset = base.GetPosition().x;
	screen_x_offset = (canvas.width / 3);
	draw_scale = 20;//world.m_debugDraw.m_drawScale;
	bg_offset = ((base.GetPosition().x) * draw_scale + screen_x_offset) % 800;

	world.DrawDebugData();
	var bike_cx = (base.GetPosition().x * draw_scale) + bike_images['red'].x_offset;
	var bike_cy = (base.GetPosition().y * draw_scale) + bike_images['red'].y_offset;
	//var bike_x = (bike_cx - bike_images['red'].half_width );// * draw_scale;
	//var bike_y = (bike_cy - bike_images['red'].half_height );// * draw_scale;
	//console.log([bike_x, bike_y]);
	for (var i = 0; i < bg_offsets.length; i++) {
		bg_offsets[i] += 0;
	}
	
	
	//ctx.drawImage(background_img, 0 - bg_offset, 0 + screen_y_offset);
	//ctx.drawImage(background_img, background_img.width - bg_offset, 0 + screen_y_offset);
	//ctx.drawImage(background_img, (background_img.width * 2) - bg_offset, 0 + screen_y_offset);
	//ctx.drawImage(background_img, (background_img.width * 3) - bg_offset, 0 + screen_y_offset);
	//ctx.drawImage(background_img, (0 - world_x_offset) * draw_scale + screen_x_offset - 800 + bg_offset, 0);
	//ctx.drawImage(background_img, (0 - world_x_offset) * draw_scale + screen_x_offset, 0);
	//ctx.drawImage(background_img, (0 - world_x_offset) * draw_scale + screen_x_offset + 800 + bg_offset, 0);
	//ctx.drawImage(background_img, 800, 0);
	//ctx.drawImage(background_img, 1600, 0);

	ctx.save();
	var ramp1_cx = (ramp4a.GetPosition().x - world_x_offset) * draw_scale + screen_x_offset;
	var ramp1_cy = ramp4a.GetPosition().y * draw_scale + screen_y_offset;
	ctx.translate(ramp1_cx, ramp1_cy);
	ctx.drawImage(bike_images['ramp-1'].img, -bike_images['ramp-1'].half_width + bike_images['ramp-1'].x_offset, -bike_images['ramp-1'].half_height + bike_images['ramp-1'].y_offset)
	ctx.restore();

	ctx.save();
	var ramp2_cx = (ramp3.GetPosition().x - world_x_offset) * draw_scale + screen_x_offset;
	var ramp2_cy = ramp3.GetPosition().y * draw_scale + screen_y_offset;
	ctx.translate(ramp2_cx, ramp2_cy);
	ctx.drawImage(bike_images['ramp-2'].img, -bike_images['ramp-2'].half_width + bike_images['ramp-2'].x_offset, -bike_images['ramp-2'].half_height + bike_images['ramp-2'].y_offset)
	ctx.restore();

	ctx.save();
	var fwheel_cx = ((fwheel.GetPosition().x - world_x_offset) * draw_scale) + screen_x_offset;
	var fwheel_cy = (fwheel.GetPosition().y * draw_scale) + screen_y_offset;
	ctx.translate(fwheel_cx, fwheel_cy);
	ctx.rotate(fwheel.GetAngle());
	ctx.drawImage(bike_images['wheel'].img, -bike_images['wheel'].half_width, -bike_images['wheel'].half_height);
	ctx.restore();

	ctx.save();
	var rwheel_cx = ((rwheel.GetPosition().x - world_x_offset) * draw_scale) + screen_x_offset;
	var rwheel_cy = (rwheel.GetPosition().y * draw_scale) + screen_y_offset;
	ctx.translate(rwheel_cx, rwheel_cy);
	ctx.rotate(fwheel.GetAngle());
	ctx.drawImage(bike_images['wheel'].img, -bike_images['wheel'].half_width, -bike_images['wheel'].half_height);
	ctx.restore();

	ctx.save();
	var body_cx = (base.GetPosition().x - world_x_offset) * draw_scale + screen_x_offset;
	var body_cy = base.GetPosition().y * draw_scale + screen_y_offset;
	ctx.translate(body_cx, body_cy);
	ctx.rotate(base.GetAngle());
	ctx.drawImage(bike_images['body-red'].img, -bike_images['body-red'].half_width + bike_images['body-red'].x_offset, -bike_images['body-red'].half_height + bike_images['body-red'].y_offset)
	ctx.restore();
	
	/*
	ctx.save();
	var ctx_scale = draw_scale/20;
	ctx.translate(bike_cx, bike_cy);
	ctx.scale(ctx_scale,ctx_scale);
	ctx.rotate(base.GetAngle());

	var shw = bike_images['red'].half_width * ctx_scale;
	var shh = bike_images['red'].half_height * ctx_scale;
	
	ctx.drawImage(bike_images['red'].img, 
		0 - shw + (((base.GetAngle() % (2*Math.PI)) / (2*Math.PI)) * bike_images['red'].half_width), 
		0 - shh + (((base.GetAngle() % (2*Math.PI)) / (2*Math.PI)) * bike_images['red'].half_height));
	ctx.rotate(0 - base.GetAngle());
	
	//ctx.translate(-bike_cx, -bike_cy);
	ctx.restore();
	*/

	//console.log(base.GetAngle() % (2*Math.PI) * bike_images['red'].half_width);
	//console.log(base.GetAngle() % Math.PI);
	//console.log(((base.GetAngle() % (2*Math.PI)) / (2*Math.PI)));
/*
	var bike_x = bike_cx + bike_images['red'].half_width;
	var bike_y = bike_cy + bike_images['red'].half_height;
	ctx.translate(bike_x , bike_y);
	ctx.rotate(base.GetAngle());
	ctx.drawImage(bike_images['red'].img, 0 - bike_images['red'].half_width, 0 - bike_images['red'].half_height);
	ctx.rotate(0 - base.GetAngle());
	ctx.translate(-bike_x, -bike_y);
*/	

	//var sprite = world.m_debugDraw.m_ctx;
	//clog(sprite);
	//var x = base.GetWorldCenter().x;
	//var y = base.GetWorldCenter().y;
	//canvas.width = canvas.width;
	//var pixelData = sprite.getImageData(x * draw_scale - canvas.width / 2, y, canvas.width, canvas.height);
	//ctx.drawImage(sprite.canvas, x * draw_scale - canvas.width / 2, y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
	//ctx.putImageData(pixelData, 0, 0);
	world.ClearForces();
	window.requestAnimationFrame(render);
	//clog(base.GetLinearVelocity().x);
	clog(base.GetAngle());
	//clog(bike_in_air);
}

debugDraw.SetSprite(ctx);
debugDraw.SetDrawScale(20);
debugDraw.SetFillAlpha(0.3);
debugDraw.SetLineThickness(1.0);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw(debugDraw);
jQuery(window).resize(onResize);
onResize();
render();