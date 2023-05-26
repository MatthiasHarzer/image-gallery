<script lang="ts">

  import Album from "../../scripts/gallery/album";
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  export let album: Album | null = null;

  $: isEdit = album !== null;

  let dummyAlbum: Album;

  onMount(() => {
    dummyAlbum = album !== null ? { ...album } : Album.dummy();
  })

  const close = () => {
    dispatch("close");
  }

  const submit = () => {
    dispatch("submit", dummyAlbum);
  }


</script>

<div class="blur-background">
  <div class="dialog">
    <div class="dialog-header">
      <h3 class="dialog-title">{isEdit ? "Edit Album" : "Create Album"}</h3>
      <button class="material close-btn" on:click={close}>
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="dialog-content">
      {#if dummyAlbum}
        <input type="text" class="album-name" placeholder="Enter album name..." bind:value={dummyAlbum.name}/>
      {/if}

      <button class="material text-button submit-btn" on:click={submit}>
        <span class="material-icons">done</span>
        <span>Submit</span>
      </button>
    </div>
  </div>
</div>

<style>
  .dialog-content {
    position: relative;
    margin: 10px;
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;

  }

  .submit-btn{
    margin-top: auto;
  }

  .album-name{
    width: 100%;
    height: 30px;
    border: none;
    border-bottom: 1px solid #ccc;
    font-size: 20px;
    padding: 5px;
    margin-bottom: 20px;
  }

</style>
