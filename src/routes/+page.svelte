<script>
	import 'aframe';
	import AnnotationList from '../components/Annotation-list.svelte';
    import axios from 'axios';
	import MiroInfo from '../components/Miro-Info.svelte';
	import {supabase} from "../components/Supabase-Client";
	import {miroUploadAnnotation, newUserLabel, addURLMiro} from "../components/miro-upload";
	import { storedUID } from '../components/storable.js'
	import {addViewer} from "../components/Supabase-functions";

	$: headPositionText = "head position";
	$: headPosition = {pitch: 0, yaw: 0};
	$: time =  0;


	$: annotations =[];


	$: duration =0;
	$: vidPaused = true;

	// check if Aframe has a rotation-reader component
	if (AFRAME.components['rotation-reader'] != undefined){
		// remove the component
		AFRAME.components['rotation-reader'] = undefined;
	}
		//  if it doesn't, register it
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
	

	
	function moveCamera(aorientation) {    
        let camera =  document.querySelector('a-entity[camera]')
        camera.components["look-controls"].pitchObject.rotation.x = aorientation.pitch,
        camera.components["look-controls"].yawObject.rotation.y = aorientation.yaw
    }
	// add an event listener to the document that listens for the spacebar to pause the video
	document.addEventListener('keydown', function(event) {
      if (event.keyCode === 32 && document.activeElement.nodeName !== 'INPUT') {
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
	

	
	

	// $: time = 0;
    $: screenshotID = 0;

	function calcScreenshotID() {
		screenshotID = annotations.length+1;
	}

	function makeAnnotation(){
		// code for creating an annotation locally
		// pause the video
		document.querySelector('#bike_ride').pause();
		calcScreenshotID();
		let perscanvas = document.querySelector('a-scene').components.screenshot.getCanvas('perspective');
		perscanvas = cloneCanvas(perscanvas);
		let overallcanvas = document.querySelector('a-scene').components.screenshot.getCanvas('equarectangular');
		overallcanvas = cloneCanvas(overallcanvas)
		annotations = [ {text:"",time: time,orientation: {...headPosition}, perscanvas: perscanvas, overallcanvas:overallcanvas, id: screenshotID}, ...annotations];

		console.log("uploading annotation", annotations[0].id);
		uploadAnnotation(annotations[0]);
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
    }
  
    function updateAnnotation(annotation) {
    const i = annotations.findIndex((a) => a.id === annotation.id);
    annotations[i] = { ...annotations[i], ...annotation };
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
		   annotation.imgurl = await supaUpload(annotation);
		   updateAnnotation(annotation);
	   }
	// then upload / update the annotation to miro
		annotation = await miroUploadAnnotation(annotation, $storedUID);
		// add the annotation link to miro
		addURLMiro(annotation, $storedUID)
		annotation.uploaded = true;
		updateAnnotation(annotation);
   }

   async function supaUpload(annotation){
		const imageURL = annotation.perscanvas.toDataURL('image/png');
		// Convert image data URL to binary data
		const imageBlob = await fetch(imageURL).then(response => response.blob());


		const fileName = `public/${$storedUID}/${annotation.id}.png`;

		const { data, error } = await supabase
		.storage
		.from('annotationBucket')
		.upload(fileName, imageBlob, {
			cacheControl: '3600',
			upsert: true
		});
		// console.log("data:", data);
		if(error){
			console.log("error uploading to supabase", error);
		}

		// time to get the public URL
		// TODO: make this use the supabase command, currently it doesnt work
		// const { urldata, urlerror } = supabase
		// .storage
		// .from('annotationBucket')
		// .getPublicUrl(fileName)
		// console.log("urldata:", urldata);
		// if(urlerror){
		// 	console.log("error getting url from supabase", urlerror);
		// }
		// //... but this works!
		// console.log("test url:",`https://swhufdbqgtxdxiseggrf.supabase.co/storage/v1/object/public/annotationBucket/${fileName}`);
		return (`https://swhufdbqgtxdxiseggrf.supabase.co/storage/v1/object/public/annotationBucket/${fileName}`);
   }




   // begin user code
//    $: userid = 0;

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





</script>

<div class="metacontainer">
    <div class="container">

        <div class="aframe">
            <a-scene embedded screenshot="width: 1024; height: 512;" >
                <a-assets>
                    <!-- svelte-ignore a11y-media-has-caption -->
                    <video id="bike_ride"  loop="true" src="../bike_ride.mp4" bind:currentTime={time} bind:paused={vidPaused} 
					on:loadeddata={handleLoaded}> </video>
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
		<!-- {headPosition.yaw} {headPosition.pitch} -->
		<MiroInfo userid={$storedUID}
		on:update={(e)=> updateUserID(e.detail)}
		/>
		<AnnotationList annotations={annotations} 
			on:remove={(e) => removeAnnotation(e.detail)} 
			on:update={(e)=> updateAnnotationText(e.detail)} 
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