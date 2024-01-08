<script>
	import 'aframe';
	import AnnotationList from './components/Annotation-list.svelte';
	import axios from 'axios';
	// import Annotation from './components/annotation.svelte';
    // import { AFRAME } from 'aframe';
    // import { AFRAME } from 'aframe';
	$: headPositionText = "head position";
	$: headPosition = [];

	$: annotations =[];

	$: time = 0;
	$: duration =0;
	$: vidPaused = true;
	// set the session id to the current time
	const serverURL="http://vr-done-server.io.tudelft.nl";
	let sessionID = "test";
	// const serverURL="http://localhost:5000";
	// const sessionID = "";
	AFRAME.registerComponent('rotation-reader', {
		init: function () {
		},
		tick: function () {
			// `this.el` is the element.
			// `object3D` is the three.js object.
			// `rotation` is a three.js Euler using radians. `quaternion` also available.
			// console.log(this.el.object3D.rotation);
			let x = this.el.object3D.rotation.x * 180 / Math.PI;
			let y = this.el.object3D.rotation.y * 180 / Math.PI;
			let z = this.el.object3D.rotation.z * 180 / Math.PI;
			//  create a string that contains the x, y, and z values
			headPositionText = `x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}`;
			headPosition.yaw = this.el.components['look-controls'].yawObject.rotation.y;
			headPosition.pitch=this.el.components['look-controls'].pitchObject.rotation.x;
			
		}
	});
	AFRAME.registerComponent('timer', {
		init: function () {
			// get the time of the video
			duration = document.querySelector('#bike_ride').duration;
			// get the duration of the video
		},
	});
	// add an event listener to the document that listens for the spacebar to pause the video
	document.addEventListener('keydown', function(event) {
      if (event.keyCode === 32 && document.activeElement.nodeName !== 'INPUT') {
		vidPaused = !vidPaused;
	}
	});

	$: screenshotID = 0;

	function calcScreenshotID() {
		screenshotID = annotations.length+1;
	}

	function makeAnnotation(){
		//  pause the video
		document.querySelector('#bike_ride').pause();
		calcScreenshotID();
		let perscanvas = document.querySelector('a-scene').components.screenshot.getCanvas('perspective');
		perscanvas = cloneCanvas(perscanvas);
		let overallcanvas = document.querySelector('a-scene').components.screenshot.getCanvas('equarectangular');
		overallcanvas = cloneCanvas(overallcanvas)
		annotations = [ {text:"",time: time,orientation: {...headPosition}, perscanvas: perscanvas, overallcanvas:overallcanvas, id: screenshotID}, ...annotations];
	}


	function cloneCanvas(originalCanvas) {
		const newCanvas = document.createElement('canvas');
		const context = newCanvas.getContext('2d');
		newCanvas.width = originalCanvas.width;
		newCanvas.height = originalCanvas.height;
		context.drawImage(originalCanvas, 0, 0);
		return newCanvas;
	}
	// make a function that logs all the annotations to the console
	function logAnnotations(){
		console.log(annotations);
	}

	function removeAnnotation(annotation) {
      annotations = annotations.filter(a => a.id !== annotation.id)
    }
  
    function updateAnnotation(annotation) {
    const i = annotations.findIndex((a) => a.id === annotation.id);
    annotations[i] = { ...annotations[i], ...annotation };
   }
   function uploadAnnotation(annotation){
	   completeUpload(annotation);
   }



   async function testUpload() {
	makeAnnotation();
	completeUpload(annotations[0]);
}
	async function completeUpload(annotation)
	{
		let uploadData = await uploadAnnotationImage(annotation);
		console.log(uploadData);
		let fileUrl = uploadData['file_url'];
		let res = await uploadMiro(annotation, fileUrl);
		console.log(res);
	}
	async function uploadAnnotationImage (annotation) {

		const imageURL = annotation.perscanvas.toDataURL('image/png');
		// Convert image data URL to binary data
		const imageBlob = await fetch(imageURL).then(response => response.blob());
		let formData = new FormData();
		formData.append('file', imageBlob, `${annotation.id}.png`);
		// Upload image to server using Axios
		const response = await axios.post(`${serverURL}/upload/${sessionID}`, 
		formData
		,    {headers: {
		'Content-Type': 'multipart/form-data'
		}});

		// Handle response
		if (response.ok) {
		console.log('Image uploaded successfully');
		} else {
		console.error('Error uploading image:', response.statusText);
		}
		return response.data;
	
	}
	async function uploadMiro(annotation, file_url){
		// file_url= "http://vr-done-server.io.tudelft.nl/files/test/image.jpg"
		let json_payload = {
			"fileUrl": file_url,
			"posX": annotation.time*20,
			"posY": 0,
			"text": annotation.text + " " + annotation.time,
		}
		const response = await axios.post(`${serverURL}/uploadMiro/`,
		json_payload
		,    {headers: {
		'Content-Type': 'application/json'
		}});
		return response.data;
	}

   

</script>

<div class="metacontainer">
    <div class="container">

        <div class="aframe">
            <a-scene embedded screenshot="width: 1024; height: 512;" >
                <a-assets>
                    <!-- svelte-ignore a11y-media-has-caption -->
                    <video id="bike_ride"  loop="true" src="../bike_ride.mp4" bind:currentTime={time} bind:paused={vidPaused}> </video>
                </a-assets>
                <a-entity camera look-controls rotation-reader timer>
                    <!-- <a-video src="#bike_ride" width="16" height="9" position="5 5 -20"></a-video> -->
                </a-entity>
                <a-videosphere autoplay src="#bike_ride"></a-videosphere>
            </a-scene>
        </div>
		<!-- make the children of this  div appear inline-->
        <div class="controls">
            <input type="range" id="slider" min="0" step="0.001" bind:value={time} max={duration} list ="markers">
			<datalist id="markers">
				{#each annotations as annotation (annotation.id)}
					<option value={annotation.time}>{annotation.text}</option>
				{/each}
			</datalist>
            <div id="time-text"> {time.toFixed(2)} / {duration}</div>
			{#if vidPaused}
            <button class = "control-button" onclick="document.querySelector('#bike_ride').play()"> Play  </button>
			{:else}
            <button class = "control-button" onclick="document.querySelector('#bike_ride').pause()">Pause</button>
			{/if}
            <!-- <div id="selector-text"> {headPositionText}</div> -->

			<button class = "control-button" on:click={()=>{ makeAnnotation()}}>+</button>
			<!-- <button on:click={()=>{ testUpload()}}>log annotation</button> -->



        </div>

    </div>
    <div class="annotations">
		<AnnotationList annotations={annotations} 
			on:remove={(e) => removeAnnotation(e.detail)} 
			on:update={(e)=> updateAnnotation(e.detail)} 
			on:upload={(e)=> uploadAnnotation(e.detail)}
			/>
	  <!-- <AnnotationList annotations={annotations}/> -->
    </div>
        
    </div>

<style>

    .metacontainer{
        display: flex;
        flex-direction: row;
        height: 100vh;
		width: 100vw;
    }
  
    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 70vw;
    }
  
    .aframe, .controls, .map {
      width: 100%;
      border: 1px solid #ddd;
      box-sizing: border-box;
    }
  
    .aframe {
      height: 80vh;
      background-color: #ffcccc; /* Example color */
    }
  
    .controls {
      flex: 1;
      background-color: #ccffcc; /* Example color */
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  /* add a gap */
	  gap: 10px;
	  padding: 10px;
    }
    .annotations{
        flex: 1;
        background-color: #ecf7f7;
		overflow-y: scroll;
		padding: 5px;
    }
	/* make it so the images within the annotations div are 80% of the width */

    #slider {
      flex: 1;
    }
	/* make a class for buttons that is 100px wide and 60 px tall */
	.control-button {
	  width: 100px;
	  height: 60px;
	}
	/* make a time class that is a monospaced font */
	#time-text {
	  font-family: monospace;
	}
</style>