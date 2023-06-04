<script lang="ts">

  import ImagesView from "./components/ImagesView.svelte";
  import {gallery} from "../scripts/firebase/firebaseManager";
  import {Screen} from "../scripts/screen";
  import {fly} from "svelte/transition";
  import AlbumsView from "./albums_view/AlbumsView.svelte";
  import {route} from "../scripts/routeManager";
  import EditView from "./edit_view/EditView.svelte";


</script>

<div class="main">
  {#if $gallery?.listener?.galleryImageStore !== undefined}
    {#if $route.screen === Screen.GALLERY}
      <div class="all-images view" transition:fly={{duration: 200, x: 200}}>
        <ImagesView images={$gallery.listener.galleryImageStore}/>
      </div>
    {:else if $route.screen === Screen.ALBUMS}
      <div class="albums view" transition:fly={{duration: 200, x: -200}}>
        <AlbumsView/>
      </div>
    {:else if $route.screen === Screen.EDIT}
      <EditView/>
    {/if}
  {/if}


</div>
<style>
    .main {
        position: relative;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
    }

    .view {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

</style>
