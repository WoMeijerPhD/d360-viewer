<script>
    export let annotations = [];
    let newAnnotation = "";
    function addAnnotation(){
        annotations = [...annotations, newAnnotation];

        newAnnotation = "";

    }
</script>

<h2>annotations</h2>
<form on:submit|preventDefault={addAnnotation}>
    <input
    bind:value={newAnnotation}
    type="text"
    id="todo-0"
    autocomplete="off"
    class="input input__lg" />
    <input type="submit" value="Submit">
</form>
<ul>
    
    {#each annotations as annotation}
        <li>{annotation.text}</li>
    {/each}
</ul>