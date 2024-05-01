
<script>
  	import {moveCamera} from "$lib/a-frame-functions.js";
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
  
    export let annotation
    console.log("created new annotation", annotation)
    let editing = false                     // track editing mode
    let text = annotation.text                    // hold the text of the annotation being edited
    let info = false
    $: uploaded = annotation.uploaded ?? false
    let cachedText = annotation.text

    function update(updatedTodo) {
      annotation = { ...annotation, ...updatedTodo }    // applies modifications to annotation
      dispatch('update', annotation)              // emit update event
    }

    function onSave() {
      // check if the text is the same as the cached text
      if (text != cachedText){
        // if it is not, update the annotation
        annotation = { ...annotation, text: text }    // applies modifications to annotation
        dispatch('update', annotation)              // emit update event
        // update the cached text
        cachedText = text
      }
      editing = false                       // exit editing mode
    }

    function upLoad(){
      annotation.uploaded = false
        dispatch('upload', annotation)
    }
  
    function onRemove() {
      dispatch('remove', annotation)              // emit remove event
    }
  
    function onEdit() {
      editing = true                        // enter editing mode
    }
    function onInfo(){
      info = !info
    }
  
    // function scrollIntoView(){
    //   // get the annotation element
    //   const annotationElement = document.getElementById("annotation-"+annotation.id)
    //   // scroll the annotation element into view
    //   annotationElement.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
    // }
    // // if we're active, scroll into view
    // $: if (annotation.active){
    //   scrollIntoView()
    // }

    // check if the annotation has a imgurl
    $: imgsrc = annotation.imgurl ?? annotation.perscanvas

    function onReturn(){
      document.querySelector('#bike_ride').currentTime = annotation.time;
      document.querySelector('#bike_ride').pause();
      moveCamera(annotation.orientation)
    }

  </script>
  
<!-- <div class="annotation"> -->
  <!-- if uploading -->
  <div class="annotation {uploaded? 'annotation-uploaded':'annotation-uploading'} {annotation.active?'annotation-active':''}">

    <div class="topbar">
        <div class = "color-header-container">
            <div class="color-header" style="background-color: {annotation.color}"></div>
            Time: {annotation.time.toFixed(2)}
        </div>
        <div>
          <!-- checkmark character -->
          {#if uploaded}
            <div class="hint">{'\u2713'}</div>
          {:else}
              <div class="spinner">{'\u27F3'}</div>
            {/if}
          <button on:click={onInfo}>i</button>
          <button on:click={onRemove}>X</button>
        </div>
    </div>

    <img src={imgsrc == null?src:imgsrc} alt={annotation.text} class="annotationPerspective"/>
        <input bind:value={text} type="text" id="annotation-{annotation.id}" autoComplete="off" class="annotation-text" placeholder="annotation label" on:focusout={onSave} />


        <!-- add a button that moves the aframe camera to the orientation -->
        <button on:click={onReturn}>return to moment</button>
        <!-- add a button that deletes the annotation -->

        {#if info}
        <hr/>
        <div class="annotation-info">
      <p>id: {annotation.id}</p>
      <p>supa_id: {annotation.supa_id??"not set"}</p>
      <p>time: {annotation.time}</p>
      <p>text: {annotation.text}</p>
      <p>head pos: {annotation.orientation.yaw.toFixed(2)},{annotation.orientation.pitch.toFixed(2)}</p>
      <p>uploaded: {uploaded}</p>
      <p>image URL:
      <!-- if the imgurl is null -->
      {#if annotation.imgurl == ""}
          <!-- display a message that says "no image" -->
          no image
      {:else}
          <!-- display the image -->
          <a href={annotation.imgurl}> image</a>
      {/if}
      </p>
      <p>Miro ID text: {annotation.miroIDText ??'not yet set'}</p>
      <p>Miro ID image: {annotation.miroIDImage ??'not yet set'}</p>
      <p>yOffset:{annotation.yOffset}</p>
      <p>color: {annotation.color}</p>
      <p>active: {annotation.active}</p>
    </div>
  {/if}

  </div>


<style>
    .annotationPerspective{
		width: 100%;
		height: auto;
	}
  .color-header{
    /* make this a 20px by 20px box that displays even if there is no child */
    display: inline-block;
    width: 20px;
    height: 20px;
    /* round the corners so it's a circle */
    border-radius: 50%;
  }
    .annotationOverall{
        width: 40%;
        height: auto;
    }
    .annotation{
        /* make this look like a card */
        border: 1px solid rgba(0,0,0,0.75);
        padding: 5px;
        margin-bottom: 20px;
        background-color: white;
        /* round the corners */
        border-radius: 5px;
        /* add a dropshadow */
        box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);
    }
    .annotation-active{
      /* make the border twice as big */
      border: 3px solid rgba(0,0,0,0.75);
    }
    .annotation-uploading{
      /* make the background color very light grey */
      /* background-color: #e0e0e0; */
    }
    .annotation-uploaded{
      /* make the background color very light green */
      /* background-color: #e0ffe0; */
    }
    .topbar{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: baseline;
    }
    .annotation-text{
        width: 100%;
    }
    .head-orient{
      /*  make the text small */
      font-size: 0.5em;
      /*  make the text grey */
      color: grey;
    }
    .hint{
        color: grey;
        display: inline-block;
    }
    .annotation-info{
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      /* make the text smaller */
      font-size: 0.5em;
    }
    .color-header-container{
      display: flex;
      flex-direction: row;
      align-items: center;

      gap: 10px;
    }
    .spinner{
      /* make the div shrink to child content */
      display: inline-block;
      animation-name: spin;
      animation-duration: 5000ms;
      animation-iteration-count: infinite;
      animation-timing-function: linear; 
    }
    @keyframes spin {
    from {
        transform:rotate(0deg);
    }
    to {
        transform:rotate(360deg);
    }
}
</style>
  