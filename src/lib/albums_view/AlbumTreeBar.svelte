<script lang="ts">

  import type Album from "../../scripts/gallery/album";
  import { createEventDispatcher } from "svelte";

  export let albums: Album[] = [];

  let pathElement: HTMLElement;

  const dispatch = createEventDispatcher();

  const handleAlbumSkip = (index: number) => {
    dispatch("albumSkip", index);
  }

  $: indexedAlbums = albums.map((album, index) => [album, index]);

  const handleScroll = (event: WheelEvent) => {
    console.log("handleScroll", event.deltaY);
    pathElement && pathElement.scrollBy({
      left: event.deltaY < 0 ? -30 : 30,
    });
  }

  $: {
    albums;
    setTimeout(() => {
      pathElement && pathElement.scrollTo({
        left: pathElement.scrollWidth,
        behavior: "smooth",
      });
    }, 0);

  }

</script>

<div class="main" bind:this={pathElement} on:wheel={handleScroll}>

  <div class="path" >
    {#each indexedAlbums as [album, index] }

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
</div>

<style>

  .main {
    /*justify-content: flex-start;*/
    width: 100%;
    position: relative;
    overflow: auto;
  }

  .main::-webkit-scrollbar {
    display: none;
  }

  .path {
    display: flex;
    flex-direction: row;
    align-items: center;

  }

  .main .album {
    margin: 0 10px;
  }

  .album-title {
    /*background-color: #2c2c2c;*/
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);

    padding: 5px 10px;
    border-radius: 5px;

    text-overflow: ellipsis;
    white-space: nowrap;
  }


</style>

