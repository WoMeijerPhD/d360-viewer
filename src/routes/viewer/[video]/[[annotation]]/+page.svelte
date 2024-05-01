<script>
	import 'aframe';
	import AnnotationList from '$lib/components/Annotation-list.svelte';
	import { storedUID } from '$lib/components/storable.js'
	import {addViewer, upsertAnnotation, deleteAnnotation,getAnnotationsByUser,supaUploadImage,getAnnotationPYByID} from "$lib/Supabase-functions";
	import Timeline from '$lib/components/Timeline.svelte';
	import {randomColor} from "$lib/components/helper-functions";
	import {setUpCanvas, drawMinimapDot} from "$lib/components/minimap";
	import { onMount } from 'svelte';
	import {moveCamera} from "$lib/a-frame-functions.js";
	import { v4 as uuidv4 } from 'uuid';




	
	export let data;
	console.log(data);
	$: headPosition = {pitch: 0, yaw: 0};
	$: time =  0;
	$: annotations =[];
	$: duration =0;
	$: vidPaused = true;
	$: fov = 80;
	$: viewuserID = null;
	$: prevClosestID = 0;

	// --- code to initialize when the video is loaded
	function videoLoaded(){
		console.log("video is loaded");
		duration = document.querySelector("#bike_ride").duration;
		setUpCanvas();
		loadAnnotationsFromSupabase();
	}
	// --- a-frame initialization code

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
			let camera =  document.querySelector('a-entity[camera]')
    		headPosition.yaw = camera.components["look-controls"].yawObject.rotation.y
    		headPosition.pitch = camera.components["look-controls"].pitchObject.rotation.x 
			// draw the position on the minimap
			drawMinimapDot(headPosition.pitch, headPosition.yaw);
		}
	});

	// check if there is an annotation
	if(data.props.annotation){
		// log the annotation for now
		console.log(data.props.annotation);
	}

	// --- code for creating annotations
	function makeAnnotation(forTest = false){
		// code for creating an annotation locally
		// pause the video
		vidPaused = true;
		// set the screenshot id to a uuid
		const screenshotID = uuidv4();
		const perscanvas = document.querySelector('a-scene').components.screenshot.getCanvas('perspective').toDataURL('image/png')
		const overallcanvas = document.querySelector('a-scene').components.screenshot.getCanvas('equarectangular').toDataURL('image/png')

		// add the annotation to the list of annotations
		annotations = [ {text:"",time: time,orientation: {...headPosition}, video: data.props.video.id, perscanvas: perscanvas, overallcanvas:overallcanvas, id: screenshotID, yOffset:0, color: randomColor(), active: false,fov: fov, uploaded:false}, ...annotations];
		console.log("uploading annotation", annotations[0].id);
		if(!forTest){
			// if we're testing locally, no need to add to miro or supabase yet...
			uploadAnnotation(annotations[0]);
		}
	}

	function updateAnnotation(annotation, updateYOffset = true) {
		const i = annotations.findIndex((a) => a.id === annotation.id);
		annotations[i] = { ...annotations[i], ...annotation };
    }

	function sortAnnotations(){
		annotations.sort((a,b) => a.time - b.time);
		calcYOffset();
	}
	function calcYOffset(){
		annotations.forEach((a, i) => a.yOffset = i*12);
	}
	async function uploadAnnotation(annotation){
		annotation.uploaded = false;
		updateAnnotation(annotation);
		// check if the image url is null
		if (annotation.imgurl == null){
			// if it is, upload the image to supabase
			annotation.imgurl = await supaUploadImage(annotation.perscanvas, $storedUID);
			annotation.equarecimg = await supaUploadImage(annotation.overallcanvas, $storedUID);
		}

		annotation = await upsertAnnotation(annotation, $storedUID);
		annotation.uploaded = true;
		updateAnnotation(annotation);
	}

	function updateAnnotationText(annotation){
		// uploading the annotation also updates it, so just upload it
		uploadAnnotation(annotation);
		
	}
	function removeAnnotation(annotation) {
      annotations = annotations.filter(a => a.id !== annotation.id)
	  deleteAnnotation(annotation);
    }

	// crappy old code to clean up
	async function setupUserID(){
		if ($storedUID == null){
			// get a new userID from supabase
			$storedUID = await addViewer();
			let res = await newUserLabel($storedUID, `user number ${$storedUID}`);
		}
		if(viewuserID == -1){
			viewuserID = newID;
		}
   }


   async function loadAnnotationsFromSupabase(){
		console.log("loading annotations from supabase");
		// make sure the user id is set
		// check if viewuserID is set
		if(viewuserID == null){
			
			if($storedUID == null){
				await setupUserID();
			}
			viewuserID = $storedUID;
		}
		// get the annotations from supabase
		annotations = await getAnnotationsByUser(viewuserID, data.props.video.id);
		sortAnnotations();
	}
</script>


<div id="metacontainer">
    <div id="container">
        <div class="aframe">
            <a-scene  embedded screenshot="width: 1024; height: 512;" look-controls rotation-reader>
                <a-videosphere autoplay src="#bike_ride"></a-videosphere>
            </a-scene> 
        </div>
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
				on:seek={(e)=>time=e.detail}
				/>
			</div>
            <div id="time-text"> {String(time.toFixed(2)).padStart(6, '0')} / {duration}</div>
			<button class = "control-button" on:click={()=>{ makeAnnotation()}}>+</button>
        </div>

    </div>
	<div id ="sidebar">

		<div id = "minimap">
			<!-- svelte-ignore a11y-media-has-caption -->
			<video id="bike_ride"  loop="true" src={data.props.video.url} bind:currentTime={time} bind:paused={vidPaused} 
			on:loadeddata={videoLoaded}> </video>
			<canvas id="overlay"></canvas>
			pitch: {headPosition.pitch.toFixed(2)}, yaw:{headPosition.yaw.toFixed(2)}, <span title="use q/e to change FOV, w to reset">fov: {fov}</span>
		</div>
		
		<div class="annotations">
			
			<AnnotationList annotations={annotations} 
				on:remove={(e) => removeAnnotation(e.detail)} 
				on:update={(e)=> updateAnnotationText(e.detail)} 
				on:upload={(e)=> uploadAnnotation(e.detail)}
				/>
			</div>
			
		</div>
	</div>

<style>

    #metacontainer{
        display: flex;
        flex-direction: row;
        height: 100vh;
		width: 100vw;
    }
  
    #container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 70vw;
    }
	#sidebar{
		display: flex;
		flex-direction: column;
		width: 30vw;
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
		margin-bottom: 10px;
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