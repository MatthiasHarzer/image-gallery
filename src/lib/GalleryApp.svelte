<script lang="ts">

  import ImagesView from "./ImagesView.svelte";
  import { gallery } from "../scripts/firebase/firebaseManager";
  import { Screen } from "../scripts/screen";
  import { localConfig } from "../scripts/localConfig";
  import { fly } from "svelte/transition";
  import AlbumsView from "./albums_view/AlbumsView.svelte";
</script>

<div class="main">
  {#if $gallery?.listener?.galleryImageStore !== undefined}
    {#if $localConfig.currentScreen === Screen.GALLERY}
      <div class="all-images view" transition:fly={{duration: 200, x: 200}}>
        <ImagesView images={$gallery.listener.galleryImageStore}/>
      </div>
    {:else if $localConfig.currentScreen === Screen.ALBUMS}
      <div class="albums view" transition:fly={{duration: 200, x: -200}}>
        <AlbumsView/>
      </div>

    {/if}
  {/if}


</div>
<style>
  .main {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .view {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

</style>
