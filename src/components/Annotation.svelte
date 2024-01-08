<!-- components/Todo.svelte -->
<script>
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
  
    export let annotation
    console.log(annotation)
    let editing = false                     // track editing mode
    let text = annotation.text                    // hold the text of the annotation being edited
  
    function update(updatedTodo) {
      annotation = { ...annotation, ...updatedTodo }    // applies modifications to annotation
      dispatch('update', annotation)              // emit update event
    }
  
    function onCancel() {
      text = annotation.text                      // restores text to its initial value and
      editing = false                       // and exit editing mode
    }
  
    function onSave() {
      update({ text: text })                // updates annotation text
      editing = false                       // and exit editing mode
    }

    function upLoad(){
        dispatch('upload', annotation)
    }
  
    function onRemove() {
      dispatch('remove', annotation)              // emit remove event
    }
  
    function onEdit() {
      editing = true                        // enter editing mode
    }
  
    function moveCamera(aorientation) {    
        let camera =  document.querySelector('a-entity[camera]')
        camera.components["look-controls"].pitchObject.rotation.x = aorientation.pitch,
        camera.components["look-controls"].yawObject.rotation.y = aorientation.yaw
    }
  
  </script>
  
<div class="annotation">
    <div class="topbar">
        <div>
            Time: {annotation.time.toFixed(2)}
            <span class="head-orient">
              head pos: {annotation.orientation.yaw.toFixed(2)},{annotation.orientation.pitch.toFixed(2)}
            </span>
        </div>
        <button on:click={onRemove}>X</button>
    </div>
    <img src={annotation.perscanvas.toDataURL()} alt={annotation.text} class="annotationPerspective"/>
    <img src={annotation.overallcanvas.toDataURL()} alt={annotation.text} class="annotationOverall"/>
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
        <p>{annotation.text}</p>
        <button type="button" class="btn" on:click={onEdit}>
            Edit
        </button>
        <button type="button" class="btn" on:click={upLoad}>
          upload
      </button>
        <!-- add a button that moves the aframe camera to the orientation -->
        <button on:click={()=>{document.querySelector('#bike_ride').currentTime = annotation.time;moveCamera(annotation.orientation)}}>return to moment</button>
        <!-- add a button that deletes the annotation -->

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
    .annotation-text{
        width: 100%;
    }
    .head-orient{
      /*  make the text small */
      font-size: 0.5em;
      /*  make the text grey */
      color: grey;
    }
</style>
  