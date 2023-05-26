<script lang="ts">

  import Album from "../../scripts/gallery/album";
  import { createEventDispatcher, onMount } from "svelte";
  import { gallery } from "../../scripts/firebase/firebaseManager";

  const dispatch = createEventDispatcher();

  export let album: Album | null = null;

  $: isEdit = album !== null && album?.id !== null;

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

  $: availableParents = $gallery.albums.filter(a => a.id !== dummyAlbum?.id);

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

        <div>
          <label for="parent-select">Parent Album</label>
          <select id="parent-select" bind:value={dummyAlbum.parent}>
            <option value={null}>None</option>
            {#each availableParents as parent}
              <option value={parent}>{parent.name}</option>
            {/each}
          </select>

        </div>
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
