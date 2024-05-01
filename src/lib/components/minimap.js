import {moveCamera} from "$lib/a-frame-functions.js";
export function pitchYawToPercentage(pitch, yaw){
    // convert the pitch and yaw (in radians) to a percentage of the total rotation
    let pitchPercentage =1- ((pitch + Math.PI/2) / Math.PI)%1;
    let yawPercentage =1- ((yaw +Math.PI/2) / (2 * Math.PI))%1;
    return {pitch: pitchPercentage, yaw: yawPercentage};
}

export function percentageToPitchYaw(pitchPercentage, yawPercentage){
    // convert the percentage of the total rotation to pitch and yaw (in radians)
    let pitch = (1-pitchPercentage) * Math.PI - Math.PI/2;
    let yaw = (1-yawPercentage) * 2 * Math.PI - Math.PI/2;
    return {pitch: pitch, yaw: yaw};
}

export function drawMinimapDot(pitch, yaw){	
	let canvas = document.getElementById('overlay');
    let pers = pitchYawToPercentage(pitch,yaw);
    let widthPer = pers.yaw;
    let heightPer = pers.pitch;
	let xpos = canvas.width * widthPer;
	let ypos = canvas.height * heightPer;
	drawOnly(xpos,ypos, canvas);
   }

function drawOnly(x,y, canvas){

	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw a bullseye on the canvas
	ctx.lineWidth = 8;
	ctx.strokeStyle = 'white';
	ctx.beginPath();
	ctx.arc(x,y, 5, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.lineWidth = 4;
	ctx.strokeStyle = 'black';
	ctx.beginPath();
	ctx.arc(x,y, 5, 0, 2 * Math.PI);
	ctx.stroke();
}

function clearCanvas(canvas){
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);

}

export function setUpCanvas(){
	let canvas = document.getElementById('overlay');
	 // Add event listener to the canvas
	 canvas.addEventListener('click', function(event) {
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;

		var widthPer = x / rect.width;
		var heightPer = y / rect.height;

		// convert the percentage to pitch and yaw
		const calcPos = percentageToPitchYaw(heightPer, widthPer);
		// move the camera to the calculated position
		moveCamera(calcPos);
		// console.log(drawOnly)
		// // draw the dot on the canvas
		clearCanvas(canvas);

	});
   }
