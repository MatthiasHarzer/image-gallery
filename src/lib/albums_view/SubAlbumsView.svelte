<script lang="ts">

  import type Album from "../../scripts/gallery/album";
  import { gallery } from "../../scripts/firebase/firebaseManager";
  import AlbumCard from "./AlbumCard.svelte";
  import { createEventDispatcher } from "svelte";

  export let album: Album;

  const dispatch = createEventDispatcher();

  const onNewOrEditAlbum = (album: Album | null = null) => {
    dispatch("newOrEdit", album);
  }

  const onOpen = (album: Album) => {
    dispatch("open", album);
  }
</script>

<div class="main">
  <div class="album-list">
    {#each album.children as album (album.id)}
      <AlbumCard
          album={album}
          on:edit={()=>onNewOrEditAlbum(album)}
          on:open={()=>onOpen(album)}
      />
    {/each}
  </div>

</div>

<style>

  .album-list{
    /*padding-top: 3rem;*/
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    /*gap: 0;*/
  }

</style>
