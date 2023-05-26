<script lang="ts">

  import type Album from "../../scripts/gallery/album";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let album: Album;

  let titleHeight: number = 0;

  const openEdit = () =>{
    dispatch("edit", album);
  }

  const openAlbum = () =>{
    dispatch("open", album);
  }

  $: cover = album?.cover ?? (album?.images?.length > 0 ? album?.images[0] : null);
</script>

<div class="main" on:click|stopPropagation={openAlbum}>
  {#if cover}
    <img src="{cover.url}" alt="{cover.name}"/>
    <img class="blur" src="{cover.url}" alt="{cover.name}" style="--titleHeight: {titleHeight}px"/>
  {/if}
  <h1 bind:clientHeight={titleHeight}>{album.name}</h1>

  <button class="material edit-btn" on:click|stopPropagation={openEdit}>
    <span class="material-icons">edit</span>
  </button>

</div>

<style>

  .main{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 200px;
    border: 2px solid var(--primary-color);
    border-radius: 15px;
    margin: 10px;
    padding: 10px;
    cursor: pointer;
    position: relative;
  }

  .main img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    z-index: -2;
    border-radius: inherit;
  }

  .main img.blur{
    filter: blur(5px);
    /*opacity: 0.5;*/
    z-index: -1;
    height: calc(var(--titleHeight) + 20px);
  }



  .main h1{
    font-size: 1.5rem;
    text-align: center;
    margin: 0;
    color: white;
    text-shadow: 1px 2px 10px black;
    user-select: none;
  }

  .edit-btn{
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(44, 44, 44, 0.8);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }





</style>
