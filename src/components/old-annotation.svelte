<script>
    export let screenshots = [];
    $: screenshotID = 0;

    function moveCamera(aorientation) {    
        let camera =  document.querySelector('a-entity[camera]')
        camera.components["look-controls"].pitchObject.rotation.x = aorientation.pitch,
        camera.components["look-controls"].yawObject.rotation.y = aorientation.yaw
    }
    function removeAnnotation(note){
        screenshots = screenshots.filter(s => s.id !== note.id)
    }

</script>
  
  {#each screenshots as screenshot (screenshot.id)}
    <div class="annotation">
        <div class="topbar">
            <p>Time: {screenshot.time.toFixed(2)}</p>
            <button on:click={()=>{ removeAnnotation(screenshot)}}>X</button>
        </div>
        <img src={screenshot.perscanvas.toDataURL()} alt={screenshot.text} class="annotationPerspective"/>
        <img src={screenshot.overallcanvas.toDataURL()} alt={screenshot.text} class="annotationOverall"/>
        <!-- add an input form that lets the user edit the text -->
        <input id="todo-{screenshot.id}" type="text" bind:value={screenshot.text} placeholder="note"/>
        <p>Orientation: {screenshot.orientation.yaw.toFixed(2)},{screenshot.orientation.pitch.toFixed(2)}</p>
        <!-- add a button that moves the aframe camera to the orientation -->
        <button on:click={()=>{document.querySelector('#bike_ride').currentTime = screenshot.time;moveCamera(screenshot.orientation)}}>return to moment</button>
        <!-- add a button that deletes the screenshot -->
    </div>
  {/each}
  <p>Press "+" to add a new annotation!</p>
  

<style>
    .annotationPerspective{
		width: 100%;
		height: auto;
	}
    .annotationOverall{
        width: 40%;
        height: auto;
    }
    .annotation{
        /* make this look like a card */
        border: 1px solid black;
        
        background-color: white;
        padding: 5px;
        margin-bottom: 20px;
        /* round the corners */
        border-radius: 5px;
        /* add a dropshadow */
        box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);
    }
    .topbar{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
</style>