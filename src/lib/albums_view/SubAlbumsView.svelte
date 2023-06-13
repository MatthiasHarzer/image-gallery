<script lang="ts">

  import type Album from "../../scripts/gallery/album";
  import AlbumCard from "./AlbumCard.svelte";
  import { createEventDispatcher } from "svelte";
  import ImagesView from "../components/ImagesView.svelte";
  import { gallery } from "../../scripts/firebase/firebaseManager";
  import FlipSlider from "../util/FlipSlider.svelte";
  import { localConfig } from "../../scripts/localConfig";

  export let album: Album;

  const dispatch = createEventDispatcher();

  const onNewOrEditAlbum = (album: Album | null = null) => {
    dispatch("newOrEdit", album);
  }

  const onOpen = (album: Album) => {
    dispatch("open", album);
  }

  $: albumStore = $gallery.listener.getAlbumStore(album);
  $: images = album?.id != null ? $gallery.listener.getAlbumImageStore(album, $localConfig.includeSubAlbum)
      : $gallery.listener.galleryImageStore;

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
  <div class="album-images">
    <div class="options-bar">
      {#if album.id !== null && album.children.length !== 0}
        <div class="include-sub-albums">
          <FlipSlider bind:active={$localConfig.includeSubAlbum} id="include-sub-albums"/>
          <!--suppress XmlInvalidId -->
          <label for="include-sub-albums">Include Sub Albums</label>
        </div>
      {/if}
    </div>
    <ImagesView
        images={images}
        album={albumStore}
    />
  </div>

</div>

<style>

  .album-list {
    /*padding-top: 3rem;*/
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    /*gap: 0;*/
  }

  .options-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    /*border-bottom: 1px solid var(--border-color);*/
  }

  .include-sub-albums {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }

  .include-sub-albums label {
    margin: 0;
    font-size: 1.2rem;
    cursor: pointer;
    user-select: none;
  }

</style>
