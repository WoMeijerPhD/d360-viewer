<script>
	import 'aframe';
	import AnnotationList from '$lib/components/Annotation-list.svelte';
	import MiroInfo from '$lib/components/Miro-Info.svelte';
	import {miroUploadAnnotation, newUserLabel, deleteSticky, deleteImage} from "$lib/components/miro-upload";
	import { storedUID } from '$lib/components/storable.js'
	import {addViewer, upsertAnnotation, deleteAnnotation,getAnnotationsByUser,supaUploadImage,getAnnotationPYByID} from "$lib/Supabase-functions";
	import Timeline from '$lib/components/Timeline.svelte';
	import {randomColor} from "$lib/components/helper-functions";
	import {setUpCanvas, drawMinimapDot} from "$lib/components/minimap";
	import { onMount } from 'svelte';
	export let data;
	$: headPosition = {pitch: 0, yaw: 0};
	$: time =  0;
	$: annotations =[];
	$: duration =0;
	$: vidPaused = true;
	$: fov = 80;
	$: viewuserID = null;
	$: prevClosestID = 0;

	function handleLoaded(){
		console.log("loaded");
	}
</script>


<div class="metacontainer">
    <div class="container">

        <div class="aframe">
            <a-scene embedded screenshot="width: 1024; height: 512;" >
                <a-entity id="main-camera" camera look-controls rotation-reader timer> 
                </a-entity> 
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
			</div>
            <div id="time-text"> {String(time.toFixed(2)).padStart(6, '0')} / {duration}</div>

			<button class = "control-button" on:click={()=>{ makeAnnotation()}}>+</button>
        </div>

    </div>
    <div class="annotations">
		<div id = "minimap">
			<!-- svelte-ignore a11y-media-has-caption -->
			<video id="bike_ride"  loop="true" src={data.props.video.url} bind:currentTime={time} bind:paused={vidPaused} 
			on:loadeddata={handleLoaded}> </video>
			<canvas id="overlay"></canvas>
		</div>
		pitch: {headPosition.pitch.toFixed(2)}, yaw:{headPosition.yaw.toFixed(2)}, <span title="use q/e to change FOV, w to reset">fov: {fov}</span>
		
		
		<!-- <AnnotationList annotations={annotations} 
			on:remove={(e) => removeAnnotation(e.detail)} 
			on:update={(e)=> updateAnnotationText(e.detail)} 
			on:upload={(e)=> uploadAnnotation(e.detail)}
			/> -->
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