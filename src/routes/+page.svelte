<script>
	import 'aframe';
	import AnnotationList from '../components/Annotation-list.svelte';
    import axios from 'axios';
	import MiroInfo from '../components/Miro-Info.svelte';
	import {supabase} from "../components/Supabase-Client";
	import {miroUploadAnnotation, newUserLabel, addURLMiro, deleteSticky, deleteImage} from "../components/miro-upload";
	import { storedUID } from '../components/storable.js'
	import {addViewer, upsertAnnotation, supaUpload, deleteAnnotation,getAnnotationsByUser} from "../components/Supabase-functions";
	import Timeline from '../components/Timeline.svelte';
	import {randomColor} from "../components/helper-functions";
	import {setUpCanvas, drawMinimapDot} from "../components/minimap";
	$: headPosition = {pitch: 0, yaw: 0};
	$: time =  0;
	$: annotations =[];
	$: duration =0;
	$: vidPaused = true;
	$: fov = 80;

	$: prevClosestID = 0;
	
	let overlayCanvas = document.getElementById('overlay');
	
	
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
			// get the rotation of the camera
			headPosition.yaw = this.el.components['look-controls'].yawObject.rotation.y;
			headPosition.pitch = this.el.components['look-controls'].pitchObject.rotation.x;
			// draw the position on the minimap
			drawMinimapDot(headPosition.pitch, headPosition.yaw, overlayCanvas);
		}
	});
	
	function moveCamera(aorientation) {    
        let camera =  document.querySelector('a-entity[camera]')
        camera.components["look-controls"].pitchObject.rotation.x = aorientation.pitch,
        camera.components["look-controls"].yawObject.rotation.y = aorientation.yaw
    }

	// function to set the fov of the camera
	function setFOV(newFOV){
		let camera =  document.querySelector('a-entity[camera]')
		camera.setAttribute('camera', 'fov', newFOV);
		fov = newFOV;
	}

	// function to change the fov of the camera
	function deltaFOV(delta){
		let camera =  document.querySelector('a-entity[camera]')
		let tempfov = camera.getAttribute('camera').fov;
		tempfov += delta;
		if(tempfov < 10){
			tempfov = 10;
		}
		if(tempfov > 170){
			tempfov = 170;
		}
		camera.setAttribute('camera', 'fov', tempfov);
		fov = tempfov;
	}

	// add an event listener so q and e change the fov    
	document.addEventListener('keyup', function(event) {
		if (document.activeElement.nodeName === 'INPUT'){
			// the user is entering text, so don't process the key commands
			return;
		}
		if (event.code === 'KeyQ') {
			deltaFOV(-5);
		}
		if (event.code === 'KeyE') {
			deltaFOV(5);
		}
		// if the w key is pressed, set the fov to 80
		if (event.code === 'KeyW') {
			setFOV(80);
		}
		if (event.code === 'Space') {
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
		if(urlParams.has('fov')){
			//  check that fov is a float
			if (isNaN(parseFloat(urlParams.get('fov')))){
				fov = 80;
			}
			else{
				fov = parseFloat(urlParams.get('fov'));
				setFOV(fov);
			}
		}
		// check if the user id is set
		if(urlParams.has('uid')){
			$storedUID = urlParams.get('uid');
		}
	}


	function handleLoaded(){
		// runs when the video is loaded
		console.log("loaded");
		updateVideoTime();
		updateURLparams();
		overlayCanvas = document.getElementById('overlay');
		setUpCanvas(overlayCanvas, moveCamera);
		// attached the rotation-reader component to the camera
		document.querySelector('a-entity[camera]').setAttribute('rotation-reader', '');
	}

    $: screenshotID = 0;

	function calcScreenshotID() {
		screenshotID = annotations.length+1;
	}

	async function loadAnnotationsFromSupabase(){
		console.log("loading annotations from supabase");
		// make sure the user id is set
		if($storedUID == null){
			await setupUserID();
		}
		// get the annotations from supabase
		annotations = await getAnnotationsByUser($storedUID);
		sortAnnotations();
		calcYOffset();
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
		annotations = [ {text:"",time: time,orientation: {...headPosition}, perscanvas: perscanvas, overallcanvas:overallcanvas, id: screenshotID, yOffset:0, color: randomColor(), active: false,fov: fov}, ...annotations];
		console.log("uploading annotation", annotations[0].id);
		if(!forTest){
			// if we're testing locally, no need to add to miro or supabase yet...
			uploadAnnotation(annotations[0]);
		}
		// sort the annotations by time
		sortAnnotations();
		// calculate the yOffset
		calcYOffset();
	}

	function sortAnnotations(){
		// sorts the annotations by time
		annotations.sort((a,b) => a.time - b.time);
	}

	function calcYOffset(){
		annotations.forEach((a, i) => a.yOffset = i*12);
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

   function seek(newTime){
	   time = newTime;
	//    document.querySelector('#bike_ride').currentTime = newTime;
   }
   function calculateActive(){
	// check there are annotations
	if (annotations.length === 1 || annotations.length === 0){
		return;
	}
		//  find the screenshot whose time is closest to the current time
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

		// scroll the annotation list to the active annotation
		let annotationBar = document.getElementById('annotation-bar');
		annotationBar.scrollTo(0, closest.yOffset);

   }
   // todo: find a better way to calculate the closest annotation to the current time, and a better way to check
   // check every 2 seconds
   setInterval(calculateActive, 1000);


</script>

<div class="metacontainer">
    <div class="container">

        <div class="aframe">
            <a-scene embedded screenshot="width: 1024; height: 512;" >
                <!-- <a-entity id="main-camera" camera look-controls rotation-reader timer> 
                </a-entity> -->
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
		<!-- add a button to log the annotations -->
		<div id = "minimap">
			<!-- svelte-ignore a11y-media-has-caption -->
			<video id="bike_ride"  loop="true" src="https://axxrj9ldvusx.objectstorage.eu-amsterdam-1.oci.customer-oci.com/n/axxrj9ldvusx/b/bucket-20240111-0932/o/bike_ride.mp4" bind:currentTime={time} bind:paused={vidPaused} 
			on:loadeddata={handleLoaded}> </video>
			<canvas id="overlay"></canvas>
		</div>
		pitch: {headPosition.pitch.toFixed(2)}, yaw:{headPosition.yaw.toFixed(2)}, <span title="use q/e to change FOV, w to reset">fov: {fov}</span>
		
		<MiroInfo userid={$storedUID}
		on:update={(e)=> updateUserID(e.detail)}
		getSupabaseAnnotations={async () => { await loadAnnotationsFromSupabase()}}
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
		/* set the transparency to 50% */
		opacity: 0.5;
	}
</style>