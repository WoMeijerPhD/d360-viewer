<script>
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
    export let userid;

    let editing = false;

    function updateID(amount) {
      dispatch('update', amount)              // emit update event
    }
</script>
<h3>Miro info</h3>
<div class="miro-options">
    <a href="https://miro.com/app/board/uXjVMR8QuxI=/" target="_blank">View board</a>
    <div>
        user ID: {userid}
        <!-- <button  on:click={updateID()}>+</button> -->
    </div>
</div>
<hr />
<style>
    .miro-options{
        display:flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: baseline;
    }
</style>