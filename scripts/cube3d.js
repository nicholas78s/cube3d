"use strict";

console.log("start code");

let f = 1250.0; // the distance from the camera to the screen (focal)
let centerx = 400; // X axis
let centery = 400; // Y axis

let canvas1 = document.getElementById("canvas1");
let ctx = canvas1.getContext('2d');

let b_mousedown = false;
let mouse_x = 0;
let mouse_y = 0;

// translate 3D coordinates into 2D (f - focal length)
function translate2d(x, z) {
	return f * x / (f + z);
}
	
class Vector {
	constructor(x1, y1, z1, x2, y2, z2) {
		this.x1 = x1;
		this.y1 = y1;
		this.z1 = z1;
		this.x2 = x2;
		this.y2 = y2;
		this.z2 = z2;
	}
}

// calculating the normal for two vectors (x1, y1, z1) and (x2, y2, z2) coming out of the (x, y, z)
function normale(x, y, z, x1, y1, z1, x2, y2, z2) {
	// vector A from the origin
	let xa = x1 - x;
	let ya = y1 - y;
	let za = z1 - z;
	
	// vector B from the origin
	let xb = x2 - x;
	let yb = y2 - y;
	let zb = z2 - z;

	x = (x1 + x2)/2.0;
	y = (y1 + y2)/2.0;
	z = (z1 + z2)/2.0;
	
	// normal, shifted to (x, y, z) and shortened by 50
	let xc = (ya*zb - za*yb)/50 + x;
	let yc = (za*xb - xa*zb)/50 + y;
	let zc = (xa*yb - ya*xb)/50 + z;
	
	let n = new Vector(x, y, z, xc, yc, zc);
	
	return(n);
}

// angle between vectors
function vectAngle(v1, v2) {
	// move v1 to the origin
	let x1 = v1.x2 - v1.x1;
	let y1 = v1.y2 - v1.y1;
	let z1 = v1.z2 - v1.z1;
	
	// move v2 to the origin
	let x2 = v2.x2 - v2.x1;
	let y2 = v2.y2 - v2.y1;
	let z2 = v2.z2 - v2.z1;
	
	let cos_a = (x1*x2 + y1*y2 + z1*z2) / ( Math.sqrt(x1*x1+y1*y1+z1*z1) * Math.sqrt(x2*x2+y2*y2+z2*z2) );

	return (cos_a);
}

function convert(integer) {
    var str = Number(parseInt(integer)).toString(16);
    return str.length == 1 ? "0" + str : str;
};

function to_rgb(r, g, b) { return "#" + convert(r) + convert(g) + convert(b); }

class MyCube {
	// cube side
	h = 1;    
	// 3D
	x = [];
	y = [];
	z = [];
	// 2D
	x2 = [];
	y2 = [];
	// faces with an enumeration of vertex numbers
	surface = [];

	constructor(x, y, z, h, canvas_context) {
		this.center_x = 1.0*x;
		this.center_y = 1.0*y;
		this.center_z = 1.0*z;
		this.h = 1.0*h;
		this.canvas_context = canvas_context;
		
		this.x[0] = 1.0*x - h/2.0;
		this.y[0] = 1.0*y - h/2.0;
		this.z[0] = 1.0*z - h/2.0;
		
		this.x[1] = 1.0*x + h/2.0;
		this.y[1] = 1.0*y - h/2.0;
		this.z[1] = 1.0*z - h/2.0;
		
		this.x[2] = 1.0*x + h/2.0;
		this.y[2] = 1.0*y + h/2.0;
		this.z[2] = 1.0*z - h/2.0;
		
		this.x[3] = 1.0*x - h/2.0;
		this.y[3] = 1.0*y + h/2.0;
		this.z[3] = 1.0*z - h/2.0;
		
		this.x[4] = 1.0*x - h/2.0;
		this.y[4] = 1.0*y - h/2.0;
		this.z[4] = 1.0*z + h/2.0;
		
		this.x[5] = 1.0*x + h/2.0;
		this.y[5] = 1.0*y - h/2.0;
		this.z[5] = 1.0*z + h/2.0;
		
		this.x[6] = 1.0*x + h/2.0;
		this.y[6] = 1.0*y + h/2.0;
		this.z[6] = 1.0*z + h/2.0;
		
		this.x[7] = 1.0*x - h/2.0;
		this.y[7] = 1.0*y + h/2.0;
		this.z[7] = 1.0*z + h/2.0;
		
		// faces (enumeration of vertex numbers, counterclockwise, so that the normal goes outward)
		this.surface[0] = [0, 3, 2, 1, 0];
		this.surface[1] = [1, 2, 6, 5, 1];
		this.surface[2] = [5, 6, 7, 4, 5];
		this.surface[3] = [4, 7, 3, 0, 4];
		this.surface[4] = [0, 1, 5, 4, 0];
		this.surface[5] = [3, 7, 6, 2, 3];
		
		this.calc2d(); // recalculate 2D coordinates
	}

	calc2d() {
		for(let i=0; i < this.x.length; i++) {
			this.x2[i] = translate2d(this.x[i], this.z[i]);
			this.y2[i] = translate2d(this.y[i], this.z[i]);
		}
	}
	
	draw() {
		
		// clearing
		this.canvas_context.clearRect(0, 0, this.canvas_context.canvas.width, this.canvas_context.canvas.height);
		
		// coordinate axes
		this.canvas_context.strokeStyle = "lightgray";
		this.canvas_context.beginPath();
		this.canvas_context.moveTo(centerx, 0);
		this.canvas_context.lineTo(centerx, 800);
		this.canvas_context.closePath();
		this.canvas_context.stroke();
		
		this.canvas_context.beginPath();
		this.canvas_context.moveTo(0, centery);
		this.canvas_context.lineTo(800, centery);
		this.canvas_context.closePath();
		this.canvas_context.stroke();
		
		for(let i=0; i < this.surface.length; i++) 
		{
			let n = this.surface[i][0]; // the number of the first vertex of the i-th face
			let current_surface = this.surface[i];
			
			// normal to two vectors from vertex 0->1 and 0->3
			let n0 = current_surface[0]; // vertex 0
			let n1 = current_surface[1]; // vertex 1
			let n2 = current_surface[3]; // vertex 3
			
			let current_normale = new normale(this.x[n0], this.y[n0], this.z[n0], this.x[n1], this.y[n1], this.z[n1], this.x[n2], this.y[n2], this.z[n2]);
			
			// vector towards the camera
			let current_camera = new Vector(this.x[n0], this.y[n0], this.z[n0], 0, 0, -f);
			let current_ang = vectAngle(current_normale, current_camera);
			
			// display the face (if the cosine of the angle between the normal to the surface and the vector towards the camera >= 0)
			if(current_ang >= 0) {
			
				let color = to_rgb(current_ang*255, current_ang*128, current_ang*128);
				
				this.canvas_context.fillStyle = color;
				this.canvas_context.beginPath();
				
				this.canvas_context.strokeStyle = color;
				
				this.canvas_context.moveTo(centerx + this.x2[n], centery + this.y2[n]);
				
				for(let j=1; j < current_surface.length; j++) {
					n = current_surface[j]; // the number of the next vertex of the i-th face
					this.canvas_context.lineTo(centerx + this.x2[n], centery + this.y2[n]);
				}
				
				this.canvas_context.closePath();
				this.canvas_context.stroke();
				this.canvas_context.fill();
			}
			
		}
		// info
		document.querySelector('#info').innerText = 'x:'+this.center_x+' y:'+this.center_y+' z:'+this.center_z;
	}
	
	clear() {
		this.canvas_context.clearRect(0, 0, canvas1.width, canvas1.height);
	}
	
	move(dx, dy, dz) {
		this.center_x += dx;
		this.center_y += dy;
		this.center_z += dz;
		
		for(let i=0; i < this.x.length; i++) {
			this.x[i] = this.x[i] + dx;
			this.y[i] = this.y[i] + dy;
			this.z[i] = this.z[i] + dz;
			// calc2d
			this.x2[i] = translate2d(this.x[i], this.z[i]);
			this.y2[i] = translate2d(this.y[i], this.z[i]);
		}
	}

	// rotate around the center of the cube
	rotate(dx) {
		for(let i=0; i < this.x.length; i++) {
			// shift the vertex centered at (0, 0, 0) to rotate around the center of the cube
			let temp_x = this.x[i] - this.center_x;
			let temp_y = this.y[i] - this.center_y;
			let temp_z = this.z[i] - this.center_z;
			
			let r = Math.sqrt(temp_x*temp_x + temp_z*temp_z);
			
			this.x[i] = r * ( Math.cos(dx) * temp_x / r - Math.sin(dx) * temp_z / r) + this.center_x;
			this.z[i] = r * ( Math.cos(dx) * temp_z / r + Math.sin(dx) * temp_x / r) + this.center_z;
	
			// calc2d
			this.x2[i] = translate2d(this.x[i], this.z[i]);
			this.y2[i] = translate2d(this.y[i], this.z[i]);
		}
	}
	
	// rotate around the center of the cube
	rotate2(dy) {
		for(let i=0; i < this.x.length; i++) {
			// shift the vertex centered at (0, 0, 0) to rotate around the center of the cube
			let temp_x = this.x[i] - this.center_x;
			let temp_y = this.y[i] - this.center_y;
			let temp_z = this.z[i] - this.center_z;
			
			let r = Math.sqrt(temp_y*temp_y + temp_z*temp_z);
			
			this.y[i] = r * ( Math.cos(dy) * temp_y / r - Math.sin(dy) * temp_z / r) + this.center_y;
			this.z[i] = r * ( Math.cos(dy) * temp_z / r + Math.sin(dy) * temp_y / r) + this.center_z;

			// calc2d
			this.x2[i] = translate2d(this.x[i], this.z[i]);
			this.y2[i] = translate2d(this.y[i], this.z[i]);
		}
	}

}

class MyPyramide {
	// side
	h = 1;    
	// 3D
	x = [];
	y = [];
	z = [];
	// 2D
	x2 = [];
	y2 = [];
	// faces with an enumeration of vertex numbers
	surface = [];

	constructor(x, y, z, h, canvas_context) {
		this.center_x = 1.0*x;
		this.center_y = 1.0*y;
		this.center_z = 1.0*z;
		this.h = 1.0*h;
		this.canvas_context = canvas_context;
		
		this.x[0] = 1.0*x + h;
		this.y[0] = 1.0*y;
		this.z[0] = 1.0*z;
		
		let angl = 2*3.1416/3; // 120 degrees
			
		this.x[1] = h * ( Math.cos(angl) * this.x[0] / h - Math.sin(angl) * this.z[0] / h);
		this.y[1] = this.y[0];
		this.z[1] = h * ( Math.cos(angl) * this.z[0] / h + Math.sin(angl) * this.x[0] / h);
		
		this.x[2] = h * ( Math.cos(2*angl) * this.x[0] / h - Math.sin(2*angl) * this.z[0] / h);
		this.y[2] = this.y[0];
		this.z[2] = h * ( Math.cos(2*angl) * this.z[0] / h + Math.sin(2*angl) * this.x[0] / h);
		
		angl = -3.1416/2; // 90 degrees
		
		// face length
		let r = Math.sqrt((this.x[1]-this.x[0])*(this.x[1]-this.x[0]) + (this.z[1]-this.z[0])*(this.z[1]-this.z[0]));
		
		// the top point of the pyramid
		this.x[3] = r * ( Math.cos(angl) * this.x[0] / r - Math.sin(angl) * this.y[0] / r);
		this.y[3] = r * ( Math.cos(angl) * this.y[0] / r + Math.sin(angl) * this.x[0] / r);
		this.z[3] = this.z[0];
		
		// faces (enumeration of vertex numbers, counterclockwise, so that the normal goes outward)
		this.surface[0] = [0, 2, 1, 0];
		this.surface[1] = [0, 3, 2, 0];
		this.surface[2] = [2, 3, 1, 2];
		this.surface[3] = [1, 3, 0, 1];
		
		this.calc2d(); // recalculate 2D coordinates
	}

	calc2d() {
		for(let i=0; i < this.x.length; i++) {
			this.x2[i] = translate2d(this.x[i], this.z[i]);
			this.y2[i] = translate2d(this.y[i], this.z[i]);
		}
	}
	
	draw() {
		
		// clearing
		this.canvas_context.clearRect(0, 0, this.canvas_context.canvas.width, this.canvas_context.canvas.height);
		
		// coordinate axes
		this.canvas_context.strokeStyle = "lightgray";
		this.canvas_context.beginPath();
		this.canvas_context.moveTo(centerx, 0);
		this.canvas_context.lineTo(centerx, 800);
		this.canvas_context.closePath();
		this.canvas_context.stroke();
		
		this.canvas_context.beginPath();
		this.canvas_context.moveTo(0, centery);
		this.canvas_context.lineTo(800, centery);
		this.canvas_context.closePath();
		this.canvas_context.stroke();
		
		for(let i=0; i < this.surface.length; i++) 
		{
			let n = this.surface[i][0]; // the number of the first vertex of the i-th face
			let current_surface = this.surface[i];
			
			// normal to two vectors from vertex 0->1 and 0->3
			let n0 = current_surface[0]; 
			let n1 = current_surface[1]; 
			let n2 = current_surface[2]; 
			
			let current_normale = new normale(this.x[n0], this.y[n0], this.z[n0], this.x[n1], this.y[n1], this.z[n1], this.x[n2], this.y[n2], this.z[n2]);
			
			/*
			// draw a normal
			//if(i==5) {
				let normale2d_x1 = translate2d(current_normale.x1, current_normale.z1);
				let normale2d_y1 = translate2d(current_normale.y1, current_normale.z1);
				let normale2d_x2 = translate2d(current_normale.x2, current_normale.z2);
				let normale2d_y2 = translate2d(current_normale.y2, current_normale.z2);
				
				canvas_context.beginPath();
				canvas_context.strokeStyle = "red";
				
				canvas_context.moveTo(centerx + normale2d_x1, centery + normale2d_y1);
				canvas_context.lineTo(centerx + normale2d_x2, centery + normale2d_y2);

				canvas_context.stroke();
			//}
			*/
			
			// vector towards the camera
			let current_camera = new Vector(this.x[n0], this.y[n0], this.z[n0], 0, 0, -f);
			let current_ang = vectAngle(current_normale, current_camera);
			
			// display the face if the cosine of the angle between the normal to the surface and the vector towards the camera >= 0
			console.log(current_ang);
			//if(current_ang >= 0) {
			if(1==1) {
			
				let color = to_rgb(current_ang*255, current_ang*128, current_ang*128);
				//console.log(color);
				
				//canvas_context.fillStyle = '#fff';
				this.canvas_context.fillStyle = color;
				this.canvas_context.beginPath();
				
				/*if(current_ang >= 0)
					this.canvas_context.strokeStyle = "black";
				else
					this.canvas_context.strokeStyle = "red";*/
				this.canvas_context.strokeStyle = color;
				
				this.canvas_context.moveTo(centerx + this.x2[n], centery + this.y2[n]);
				
				//console.log(current_surface);
				for(let j=1; j < current_surface.length; j++) {
					n = current_surface[j]; // номер следующей вершины i-й грани
					this.canvas_context.lineTo(centerx + this.x2[n], centery + this.y2[n]);
				}
				
				this.canvas_context.closePath();
				this.canvas_context.stroke();
				if(current_ang >= 0) 
					this.canvas_context.fill();
			}
			
		}
		// info
		document.querySelector('#info').innerText = 'x:'+this.center_x+' y:'+this.center_y+' z:'+this.center_z;
	}
	
	clear() {
		this.canvas_context.clearRect(0, 0, canvas1.width, canvas1.height);
	}
	
	move(dx, dy, dz) {
		this.center_x += dx;
		this.center_y += dy;
		this.center_z += dz;
		
		for(let i=0; i < this.x.length; i++) {
			this.x[i] = this.x[i] + dx;
			this.y[i] = this.y[i] + dy;
			this.z[i] = this.z[i] + dz;
			// calc2d
			this.x2[i] = translate2d(this.x[i], this.z[i]);
			this.y2[i] = translate2d(this.y[i], this.z[i]);
		}
	}

	// turn around the center
	rotate(dx) {
		for(let i=0; i < this.x.length; i++) {
			// shift the vertex centered at (0, 0, 0) to rotate around the center
			let temp_x = this.x[i] - this.center_x;
			let temp_y = this.y[i] - this.center_y;
			let temp_z = this.z[i] - this.center_z;
			
			let r = Math.sqrt(temp_x*temp_x + temp_z*temp_z);
			
			this.x[i] = r * ( Math.cos(dx) * temp_x / r - Math.sin(dx) * temp_z / r) + this.center_x;
			this.z[i] = r * ( Math.cos(dx) * temp_z / r + Math.sin(dx) * temp_x / r) + this.center_z;

			// calc2d
			this.x2[i] = translate2d(this.x[i], this.z[i]);
			this.y2[i] = translate2d(this.y[i], this.z[i]);
		}
	}
	
	// turn around the center
	rotate2(dy) {
		for(let i=0; i < this.x.length; i++) {
			// shift the vertex centered at (0, 0, 0) to rotate around the center
			let temp_x = this.x[i] - this.center_x;
			let temp_y = this.y[i] - this.center_y;
			let temp_z = this.z[i] - this.center_z;
			
			let r = Math.sqrt(temp_y*temp_y + temp_z*temp_z);
			
			this.y[i] = r * ( Math.cos(dy) * temp_y / r - Math.sin(dy) * temp_z / r) + this.center_y;
			this.z[i] = r * ( Math.cos(dy) * temp_z / r + Math.sin(dy) * temp_y / r) + this.center_z;

			// calc2d
			this.x2[i] = translate2d(this.x[i], this.z[i]);
			this.y2[i] = translate2d(this.y[i], this.z[i]);
		}
	}

}

// new cube
let cube1 = new MyCube(0, 0, -880, 40, ctx);
let pyr1 = new MyPyramide(0, 0, 0, 40, ctx);

function initPage()
{
	canvas1.height = 800;
	canvas1.width  = 800;
			
	cube1.draw();
	//pyr1.draw();
}

function keyUp(e)
{
	let text = e.type +
    ' key=' + e.key +
    ' code=' + e.code +
    (e.shiftKey ? ' shiftKey' : '') +
    (e.ctrlKey ? ' ctrlKey' : '') +
    (e.altKey ? ' altKey' : '') +
    (e.metaKey ? ' metaKey' : '') +
    (e.repeat ? ' (repeat)' : '') +
    "\n";
	
	let dx = 40;
	let dy = 40;
	let dz = 40;
	let b_move = false;
	
	let obj = cube1;
	
	if(e.key == 'ArrowRight') {
		//cube1.move(dx, 0, 0);
		obj.move(dx, 0, 0);
		b_move = true;
	}
	else if(e.key == 'ArrowLeft') {
		//cube1.move(-dx, 0, 0);
		obj.move(-dx, 0, 0);
		b_move = true;
	}
	else if(e.key == 'ArrowUp') {
		//cube1.move(0, -dy, 0);
		obj.move(0, -dy, 0);
		b_move = true;
	}
	else if(e.key == 'ArrowDown') {
		//cube1.move(0, dy, 0);
		obj.move(0, dy, 0);
		b_move = true;
	}
	else if(e.key == '+') {
		//cube1.move(0, 0, dz);
		obj.move(0, 0, dz);
		b_move = true;
	}
	else if(e.key == '-') {
		//cube1.move(0, 0, -dz);
		obj.move(0, 0, -dz);
		b_move = true;
	}
	else if(e.key == 'z') {
		//cube1.rotate( 3.1416 / 32 );
		obj.rotate( 3.1416 / 32 );
		b_move = true;
	}
	else if(e.key == 'x') {
		//cube1.rotate( - 3.1416 / 32);
		obj.rotate( -3.1416 / 32);
		b_move = true;
	}
	else if(e.key == 'a') {
		//cube1.rotate2( 3.1416 / 32 );
		obj.rotate2( 3.1416 / 32 );
		b_move = true;
	}
	else if(e.key == 's') {
		//cube1.rotate2( - 3.1416 / 32);
		obj.rotate2( -3.1416 / 32);
		b_move = true;
	}
	/*else if ((e.key == ' ') || (e.key == 'Enter') || (e.key == 'Escape')) {
		python_dy = 0;
		python_dx = 0;
		b_move = true;
		python_head_image = 'head';
	}
	else if(e.key == '+') {
		if(python_delay >= 10)
			python_delay -= 10;
		console.log('python_delay='+python_delay);	
	}
	else if(e.key == '-') {
		if(python_delay <= 2990)
			python_delay += 10;
		console.log('python_delay='+python_delay);	
	}
	*/
	if(b_move) {
		//cube1.draw();
		obj.draw();
		e.preventDefault();
	}
}

function canvasMouseDown(e, obj) {
	b_mousedown = true;
	mouse_x = e.offsetX;
	mouse_y = e.offsetY;
}

function canvasMouseUp(e, obj) {
	b_mousedown = false;
}

function canvasMouseMove(e, obj) {
	if (b_mousedown === true) {
		let dx = e.offsetX - mouse_x;
		let dy = e.offsetY - mouse_y;
		
		mouse_x = e.offsetX;
		mouse_y = e.offsetY;
		
		let obj = cube1;
		
		// rotate cube
		obj.rotate( dx / 128 );
		obj.rotate2( dy / 128 );
		
		obj.draw();
	}
}