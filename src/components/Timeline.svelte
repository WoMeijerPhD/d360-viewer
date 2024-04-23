<script>
    import { onMount } from 'svelte';

    // import Annotation from "./Annotation.svelte";
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()
    export let annotations = [];
    export let duration = 0;
    export let currentTime = 0;
    const yMultiplier =12;

    function seek(newtime){
        dispatch('seek', newtime)
    }

    function moveCamera(aorientation) {   
        //todo: make this less janky, don;t duplicate code 
        let camera =  document.querySelector('a-entity[camera]')
        camera.components["look-controls"].pitchObject.rotation.x = aorientation.pitch,
        camera.components["look-controls"].yawObject.rotation.y = aorientation.yaw
    }
    function moveToAnnotation(annotation){
        moveCamera(annotation.orientation);
        seek(annotation.time);
    }

    $: barWidth = 0;
    function onMouseDown(event){
        //todo: make this less janky
        // get the timebar
        const timebar = document.getElementById("timebar");
        
        let x = event.clientX - timebar.getBoundingClientRect().left;
        x = x / timebar.getBoundingClientRect().width;
        // make sure the x value is between 0 and 1
        if (x < 0) x = 0;
        if (x > 1) x = 1;
        // calculate the new time
        const newtime = x * duration;
        // seek to the new time
        seek(newtime);
    }
    // onMount (() =>{
    //     const timebar = document.getElementById("timebar");
    //     barWidth = timebar.getBoundingClientRect().width;
    // })
    


  </script>
  
  <!-- Annotations.svelte -->

    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div id="timebar" class="timebar" on:mousedown={(e)=>{onMouseDown(e)}}>
        <div class="seek-handle" style="left: {currentTime * 100 / duration}%"></div>
        <div class="progress" style="width: {currentTime * 100 / duration}%"></div>
    </div>
    <div id="annotation-bar">
        <!-- loop over the annotations and add a ^ for each -->
        {#each annotations as annotation (annotation.id)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div 
            class="annotation" 
            title={annotation.text} 
            style="left: {(annotation.time * 100/ duration)}%; top:{annotation.yOffset}px;background-color:{annotation.color}" 
            on:click={()=>{moveToAnnotation(annotation)}}>
            </div>
            
        {/each}
    </div>

<style>
    .timebar{
        width: 100%;
        height: 20px;
        background-color: #ddd;
        display: inline-block;
    }
    .seek-handle{
        width: 10px;
        height: 20px;
        background-color: #000;
        position: relative;
        /* top: -20px; */
    }
    .progress{
        height: 20px;
        background-color: #5de4f4;
        position: relative;
        top: -20px;
    }
    #annotation-bar{
        width: 100%;
        height: 10vh;
        background-color: transparent;
        display: inline-block;
        position: relative;
        overflow-y: scroll;
        scrollbar-width: thin;
        scrollbar-color: #888 transparent;
    }
    .annotation{
        width: 10px;
        height: 10px;
        background-color: #000;
        position: absolute;
        margin: 0px;
        padding: 0px;
        /* top: -20px; */
        display: inline-block;
    }

</style>