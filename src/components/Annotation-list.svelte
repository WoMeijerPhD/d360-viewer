<!-- components/Annotations.svelte -->
<script>
    import Annotation from "./Annotation.svelte";
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()
    export let annotations = []

    let newAnnotationName = ''
    $: newAnnotationId = totalAnnotations ? Math.max(...annotations.map(t => t.id)) + 1 : 1
  
    $: totalAnnotations = annotations.length
  
    function removeAnnotation(annotation) {
      dispatch('remove', annotation)
      // annotations = annotations.filter(t => t.id !== todo.id)
    }
  
    function updateAnnotation(annotation) {
      dispatch('update', annotation)
  }
  function uploadAnnotation(annotation){
    dispatch('upload', annotation)
  }
  
  
    function addAnnotation() {
      annotations = [...annotations, { id: newAnnotationId, text: newAnnotationName, completed: false }]
      newAnnotationName = ''
    }
  
  
  </script>
  
  <!-- Annotations.svelte -->
  <div class="todoapp stack-large">
  <h3>Annotations:</h3>
  
    <!-- Annotations -->
    <ul class="annotations" aria-labelledby="list-heading">
    {#each annotations as annotation (annotation.id)}
      <li class="annotation">
        <Annotation {annotation} 
        on:remove={(e) => removeAnnotation(e.detail)} 
        on:update={(e)=> updateAnnotation(e.detail) }
        on:upload={(e)=> uploadAnnotation(e.detail)}  
          />
        </li>
    {:else}
      <li>Press "+" to create a new note!</li>
    {/each}
    </ul>
  
  </div>
<style>
  /* make the annotation class list items not have a bullet point */
  .annotations{
    list-style-type: none;
  }
  ul {

    margin:0;
    padding:10px;
  }
</style>