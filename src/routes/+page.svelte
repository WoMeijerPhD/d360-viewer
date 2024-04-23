<script>
	import 'aframe';
	import AnnotationList from '../components/Annotation-list.svelte';
    import axios from 'axios';
	import MiroInfo from '../components/Miro-Info.svelte';
	import {supabase} from "../components/Supabase-Client";
	import {miroUploadAnnotation, newUserLabel, addURLMiro, deleteSticky, deleteImage} from "../components/miro-upload";
	import { storedUID } from '../components/storable.js'
	import {addViewer, upsertAnnotation, supaUpload, deleteAnnotation} from "../components/Supabase-functions";
	import Timeline from '../components/Timeline.svelte';
	import {randomColor} from "../components/helper-functions";

	$: headPositionText = "head position";
	$: headPosition = {pitch: 0, yaw: 0};
	$: time =  0;
	$: relHeadPos = {pitch:0, yaw:0};


	$: annotations =[];


	$: duration =0;
	$: vidPaused = true;
	$: prevClosestID = 0;
	// check if Aframe has a rotation-reader component
	if (AFRAME.components['rotation-reader'] != undefined){
		// remove the component
		AFRAME.components['rotation-reader'] = undefined;
	}
		//  register a new component that reads the rotation of the camera
		AFRAME.registerComponent('rotation-reader', {
			init: function () {
			},
			tick: function () {
				// `this.el` is the element.
				// `object3D` is the three.js object.
				// `rotation` is a three.js Euler using radians. `quaternion` also available.
				let x = this.el.object3D.rotation.x * 180 / Math.PI;
				let y = this.el.object3D.rotation.y * 180 / Math.PI;
				let z = this.el.object3D.rotation.z * 180 / Math.PI;
				//  create a string that contains the x, y, and z values
				headPositionText = `x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}`;
				headPosition.yaw = this.el.components['look-controls'].yawObject.rotation.y;
				headPosition.pitch = this.el.components['look-controls'].pitchObject.rotation.x;
				const relPos = pitchYawToPercentage(headPosition.pitch, headPosition.yaw);
				relHeadPos.pitch = relPos.pitch;
				relHeadPos.yaw = relPos.yaw;
				drawMinimapDot(relPos.pitch, relPos.yaw);
			}
		});
	

	
	function moveCamera(aorientation) {    
        let camera =  document.querySelector('a-entity[camera]')
        camera.components["look-controls"].pitchObject.rotation.x = aorientation.pitch,
        camera.components["look-controls"].yawObject.rotation.y = aorientation.yaw
    }
	// add an event listener to the document that listens for the spacebar to pause the video
	document.addEventListener('keydown', function(event) {
		if (event.code === 'Space' && document.activeElement.nodeName !== 'INPUT') {
			vidPaused = !vidPaused;
		}
	});

	function updateVideoTime(){
		duration = document.querySelector('#bike_ride').duration;
	}

	function updateURLparams(){
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('time')){
			//  check that time is a float
			if (isNaN(parseFloat(urlParams.get('time')))){
				time = 0;
			}
			else{
				time = parseFloat(urlParams.get('time'));
			}
		}
		//  check if roll and yaw are set in the url
		if (urlParams.has('roll') && urlParams.has('yaw')){
			//  check that roll and yaw are floats
			if (isNaN(parseFloat(urlParams.get('roll'))) || isNaN(parseFloat(urlParams.get('yaw')))){
				headPosition.yaw = 0;
				headPosition.pitch = 0;
			}
			else{
				headPosition.yaw = parseFloat(urlParams.get('yaw'));
				headPosition.pitch = parseFloat(urlParams.get('roll'));
			}
			//  move the camera to the specified position
			moveCamera(headPosition);
		}
	}


	function handleLoaded(){
		// runs when the video is loaded
		console.log("loaded");
		updateVideoTime();
		updateURLparams();
	}

    $: screenshotID = 0;

	function calcScreenshotID() {
		screenshotID = annotations.length+1;
	}

	function makeAnnotation(forTest = false){
		// code for creating an annotation locally
		// pause the video
		document.querySelector('#bike_ride').pause();
		calcScreenshotID();
		let perscanvas = document.querySelector('a-scene').components.screenshot.getCanvas('perspective');
		perscanvas = cloneCanvas(perscanvas);
		let overallcanvas = document.querySelector('a-scene').components.screenshot.getCanvas('equarectangular');
		overallcanvas = cloneCanvas(overallcanvas)

		// add the annotation to the list of annotations
		annotations = [ {text:"",time: time,orientation: {...headPosition}, perscanvas: perscanvas, overallcanvas:overallcanvas, id: screenshotID, yOffset:0, color: randomColor(), active: false}, ...annotations];
		console.log("uploading annotation", annotations[0].id);
		// sort the annotations by time
		sortAnnotations();
		calcYOffset();
		if(!forTest){
			// if we're testing locally, no need to add to miro or supabase yet...
			uploadAnnotation(annotations[0]);
		}
	}

	function sortAnnotations(){
		annotations.sort((a,b) => a.time - b.time);
	}

	function calcYOffset(){
		// todo: make this function + feauture smoother
		// this function goes over the annotations and if two or more have the same time, it offsets them vertically by 4px
		for (let i = 0; i < annotations.length-1; i++){
			if (annotations[i].time == annotations[i+1].time){
				// if they do, offset the next annotation by 4px compared to the current one
				annotations[i+1].yOffset = annotations[i].yOffset + 1;
			}
			else{
				annotations[i+1].yOffset = 0;
			}
		}
	}


	function cloneCanvas(originalCanvas) {
		const newCanvas = document.createElement('canvas');
		const context = newCanvas.getContext('2d');
		newCanvas.width = originalCanvas.width;
		newCanvas.height = originalCanvas.height;
		context.drawImage(originalCanvas, 0, 0);
		return newCanvas;
	}

	function removeAnnotation(annotation) {
      annotations = annotations.filter(a => a.id !== annotation.id)
	  deleteAnnotation(annotation);
	  // remove the annotation from miro
	  deleteImage(annotation.miroIDImage);
	  deleteSticky(annotation.miroIDText);
    }
  
    function updateAnnotation(annotation, updateYOffset = true) {
    const i = annotations.findIndex((a) => a.id === annotation.id);
    annotations[i] = { ...annotations[i], ...annotation };

	if(updateYOffset){
		// todo: remove this jank 
		// because this happens async there's a chance it overrides things like the yOffset, calculate that here, again...
		calcYOffset();
	}
    }
	function updateAnnotationText(annotation){
		// uploading the annotation also updates it, so just upload it
		uploadAnnotation(annotation);
	}

   async function  uploadAnnotation(annotation){
	annotation.uploaded = false;
	updateAnnotation(annotation);
	// check if the image url is null
	   if (annotation.imgurl == null){
		   // if it is, upload the image to supabase
		   annotation.imgurl = await supaUpload(annotation, $storedUID);
		   updateAnnotation(annotation);
	   }
	// then upload / update the annotation to miro
		annotation = await miroUploadAnnotation(annotation, $storedUID);
		// add the annotation link to miro
		addURLMiro(annotation, $storedUID)
		annotation = await upsertAnnotation(annotation, $storedUID);
		annotation.uploaded = true;
		updateAnnotation(annotation);
   }

   async function setupUserID(){
	if ($storedUID == null){
		// get a new userID from supabase
		$storedUID = await addViewer();
		let res = await newUserLabel($storedUID, `user number ${$storedUID}`);
	}
   }
	function updateUserID(newID){
	$storedUID = newID;
   }
   // check the user id on page load
   setupUserID();


   async function testSupa(annotation){
	   console.log("testing supabase");
	   console.log("annotation:", annotation);
	   console.log(await upsertAnnotation(annotation));
   }

   function forceSupaTest(){
	makeAnnotation();
	testSupa(annotations[0]);
   
   }

   function seek(newTime){
	   time = newTime;
	//    document.querySelector('#bike_ride').currentTime = newTime;
   }
   function calculateActive(){
	// check there are annotations
	if (annotations.length === 1 || annotations.length === 0){
		return;
	}
		//  firs the screenshot whose time is closest to the current time
		let closest = annotations.reduce((prev, curr) => {
			return (Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev);
		});
		// if the closest is already active, do nothing
		if (closest.active){
			return;
		}
		//  then mark it as active
		closest.active = true;
		//todo: unmark the previous closest
		updateAnnotation(closest, false);
		// find the previous closest
		let prevClosest = annotations.find(a => a.id == prevClosestID);
		// set it to inactive
		if (prevClosest != undefined){
			prevClosest.active = false;
			updateAnnotation(prevClosest, false);
		}
		// set the prev closest to the current closest
		prevClosestID = closest.id;

   }
   // todo: find a better way to calculate the closest annotation to the current time, and a better way to check
   // check every 2 seconds
   setInterval(calculateActive, 2000);


   // create a script to convert the pitch and yaw to a percentage of the total rotation
   function pitchYawToPercentage(pitch, yaw){
	   // convert the pitch and yaw (in radians) to a percentage of the total rotation
		let pitchPercentage =1- ((pitch + Math.PI/2) / Math.PI)%1;
		let yawPercentage =1- ((yaw +Math.PI/2) / (2 * Math.PI))%1;
		return {pitch: pitchPercentage, yaw: yawPercentage};
   }

   function drawMinimapDot(heightPer,widthPer){
	// draws a red square on the canvas at the height and width percentage
	var canvas = document.getElementById('overlay');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw something on the canvas
	ctx.fillStyle = 'red';
	ctx.fillRect(canvas.width * widthPer -5, canvas.height * heightPer-5, 10, 10);
   }

</script>

<div class="metacontainer">
    <div class="container">

        <div class="aframe">
            <a-scene embedded screenshot="width: 1024; height: 512;" >
                <a-assets>
                    <!-- svelte-ignore a11y-media-has-caption -->

					<!-- todo: find better place to host this file, currently it's in my personal free oracle cloud account? 
						not ideal, but it avoids issues with the github lfs bandwidth? -->
                </a-assets>
                <a-entity camera look-controls rotation-reader timer>
                    <!-- <a-video src="#bike_ride" width="16" height="9" position="5 5 -20"></a-video> -->
                </a-entity>
                <a-videosphere autoplay src="#bike_ride"></a-videosphere>
            </a-scene>
        </div>
		<!-- make the children of this  div appear inline-->
        <div class="controls">
			{#if vidPaused}
            <button class = "control-button" onclick="document.querySelector('#bike_ride').play()"> Play  </button>
			{:else}
            <button class = "control-button" onclick="document.querySelector('#bike_ride').pause()">Pause</button>
			{/if}
			<div class = "timelines">
				<!-- <input type="range" id="slider" min="0" step="0.001" bind:value={time} max={duration} list ="markers"> -->
				<Timeline 
				annotations={annotations}
				duration={duration} 
				currentTime={time}
				on:seek={(e)=>seek(e.detail)}
				/>
			</div>
            <div id="time-text"> {String(time.toFixed(2)).padStart(6, '0')} / {duration}</div>

            <!-- <div id="selector-text"> {headPositionText}</div> -->
			<!-- random change -->

			<button class = "control-button" on:click={()=>{ makeAnnotation()}}>+</button>
			<!-- <button class = "control-button" on:click={()=>{ makeAnnotation(true)}}>local annotation</button>
			<button class = "control-button" on:click={()=>{ calculateActive()}}>closest</button> -->

        </div>

    </div>
    <div class="annotations">
		<div id = "minimap">
			<!-- svelte-ignore a11y-media-has-caption -->
			<video id="bike_ride"  loop="true" src="https://axxrj9ldvusx.objectstorage.eu-amsterdam-1.oci.customer-oci.com/n/axxrj9ldvusx/b/bucket-20240111-0932/o/bike_ride.mp4" bind:currentTime={time} bind:paused={vidPaused} 
			on:loadeddata={handleLoaded}> </video>
			<canvas id="overlay"></canvas>
		</div>
		<!-- {headPosition.yaw} {headPosition.pitch} -->
		{relHeadPos.pitch.toFixed(2)} {relHeadPos.yaw.toFixed(2)}
		
		<MiroInfo userid={$storedUID}
		on:update={(e)=> updateUserID(e.detail)}
		/>
		<AnnotationList annotations={annotations} 
			on:remove={(e) => removeAnnotation(e.detail)} 
			on:update={(e)=> updateAnnotationText(e.detail)} 
			on:upload={(e)=> uploadAnnotation(e.detail)}
			/>
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
	  align-items: top;
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
	  width:100%
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
	.timelines{
		flex:1;
	}
	#minimap{
		position: relative;
		width: 100%;
		height: auto;
	}
	#bike_ride{
		width: 100%;
		height: auto;
	}
	#overlay{
		/* position the overlay on top of the video, at the minimap */
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: auto;
	}
</style>