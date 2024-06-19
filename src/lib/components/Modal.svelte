<script>
    export let showModal = false;

    export let modalTitle = 'Modal Title';
    export let modalContent = 'Modal content goes here...';
    function openModal() {
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }
</script>


{#if showModal}
    <div class="modal">
        <div class="modal-content">
            <h2>{modalTitle}</h2>
            <p>{modalContent}</p>
            <button on:click={closeModal}>Close</button>
        </div>
    </div>
{/if}

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
    }

    .modal-content {
        background-color: white;
        padding: 20px;
        border-radius: 4px;
    }
</style>