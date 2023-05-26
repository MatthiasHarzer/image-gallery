<script lang="ts">

  import type Album from "../../scripts/gallery/album";
  import { createEventDispatcher } from "svelte";

  export let albums: Album[] = [];

  const dispatch = createEventDispatcher();

  const handleAlbumSkip = (index: number) => {
    console.log("handleAlbumSkip", index);
    dispatch("albumSkip", index);
  }

  let i = 0;

  const reset = () => {
    i = 0;
  }

  $: indexedAlbums = albums.map((album, index) => [album, index]);

</script>

<div class="main">

  {#each indexedAlbums as [album, index] (album.id)}

    <div class="album" on:click={() => handleAlbumSkip(index)}>
      <button class="clear album-title material text-button">{album.name}</button>
    </div>

    {#if index < indexedAlbums.length - 1}
      <div class="album-separator flex-center">
        <span class="material-icons">
          keyboard_arrow_right
        </span>
      </div>
    {/if}
  {/each}

</div>

<style>

  .main{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .main .album{
    margin: 0 10px;
  }

  .album-title{
    /*background-color: #2c2c2c;*/
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);

    padding: 5px 10px;
    border-radius: 5px;
  }




</style>

