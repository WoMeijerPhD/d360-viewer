<!-- components/Todo.svelte -->
<script>
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
  
    export let annotation
    console.log("created new annotation", annotation)
    let editing = false                     // track editing mode
    let text = annotation.text                    // hold the text of the annotation being edited
    let info = false
    let uploaded = false
    let cachedText = annotation.text
    function update(updatedTodo) {
      annotation = { ...annotation, ...updatedTodo }    // applies modifications to annotation
      dispatch('update', annotation)              // emit update event
    }
  
    function onCancel() {
      text = annotation.text                      // restores text to its initial value and
      editing = false                       // and exit editing mode
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
  
    function moveCamera(aorientation) {    
        let camera =  document.querySelector('a-entity[camera]')
        camera.components["look-controls"].pitchObject.rotation.x = aorientation.pitch,
        camera.components["look-controls"].yawObject.rotation.y = aorientation.yaw
    }
  
  </script>
  
<!-- <div class="annotation"> -->
  <!-- if uploading -->
  <div class="annotation {annotation.uploaded? 'annotation-uploaded':'annotation-uploading'}">

    <div class="topbar">
        <div>
            Time: {annotation.time.toFixed(2)}
        </div>
        <div>
          <!-- checkmark character -->
          {#if annotation.uploaded}
            <div class="hint">{'\u2713'}</div>
          {:else}
              <div class="spinner">{'\u27F3'}</div>
            {/if}
          <button on:click={onInfo}>i</button>
          <button on:click={onRemove}>X</button>
        </div>
    </div>
    <img src={annotation.perscanvas.toDataURL()} alt={annotation.text} class="annotationPerspective"/>
    <!-- <img src={annotation.overallcanvas.toDataURL()} alt={annotation.text} class="annotationOverall"/> -->
  {#if editing}
    <!-- markup for editing annotation: label, input text, Cancel and Save Button -->
    <form on:submit|preventDefault={onSave} class="stack-small" on:keydown={e => e.key === 'Escape' && onCancel()}>
      <div class="form-group">
        <!-- <label for="annotation-{annotation.id}" class="annotation-label">New text for '{annotation.text}'</label> -->
        <input bind:value={text} type="text" id="annotation-{annotation.id}" autoComplete="off" class="annotation-text" />
      </div>
      <div class="btn-group">
          <button class="btn btn__primary annotation-edit" type="submit" disabled={!text}>
            Save
          </button>
        <button class="btn annotation-cancel" on:click={onCancel} type="button">
          Cancel
          </button>
      </div>
    </form>
  {:else}
    <!-- markup for displaying annotation: checkbox, label, Edit and Delete Button -->

        <!-- add an input form that lets the user edit the text -->
        <!-- if the annotation text is null -->
        <!-- add a textbox that is the annotation text and updates when editing is done -->
        <input bind:value={text} type="text" id="annotation-{annotation.id}" autoComplete="off" class="annotation-text" placeholder="annotation label" on:focusout={onSave} />


        <!-- add a button that moves the aframe camera to the orientation -->
        <button on:click={()=>{document.querySelector('#bike_ride').currentTime = annotation.time;moveCamera(annotation.orientation)}}>return to moment</button>
        <!-- add a button that deletes the annotation -->
        
        {/if}
        {#if info}
        <hr/>
        <div class="annotation-info">

          <!-- <button type="button" class="btn" on:click={upLoad}>
            force upload
        </button> -->
      <p>id: {annotation.id}</p>
      <p>supa_id: {annotation.supa_id??"not set"}</p>
      <p>time: {annotation.time}</p>
      <p>text: {annotation.text}</p>
      <p>head pos: {annotation.orientation.yaw.toFixed(2)},{annotation.orientation.pitch.toFixed(2)}</p>
      <p>uploaded: {annotation.uploaded}</p>
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
    </div>
  {/if}

  </div>


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
        border: 1px solid rgba(0,0,0,0.75);
        padding: 5px;
        margin-bottom: 20px;
        background-color: white;
        /* round the corners */
        border-radius: 5px;
        /* add a dropshadow */
        box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);
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
  