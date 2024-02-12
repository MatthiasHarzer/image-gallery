<script lang="ts">
  import ImagesView from "./components/ImagesView.svelte";
  import { gallery } from "../scripts/firebase/firebaseManager";
  import { Screen } from "../scripts/screen";
  import { fly } from "svelte/transition";
  import AlbumsView from "./albums_view/AlbumsView.svelte";
  import { route } from "../scripts/routeManager";
  import EditView from "./edit_view/EditView.svelte";
  import TagsEditView from "./tags_edit_view/TagsEditView.svelte";
</script>

<div class="main">
  {#if $gallery?.listener?.galleryImageStore !== undefined}
    {#if $route.screen === Screen.GALLERY}
      <div class="all-images view" transition:fly={{ duration: 200, x: 200 }}>
        <ImagesView images={$gallery.listener.galleryImageStore} />
      </div>
    {:else if $route.screen === Screen.ALBUMS}
      <div class="albums view" transition:fly={{ duration: 200, x: -200 }}>
        <AlbumsView />
      </div>
    {:else if $route.screen === Screen.EDIT}
      <div class="edit view" transition:fly={{ duration: 200, x: 200 }}>
        <EditView />
      </div>
    {:else if $route.screen === Screen.TAGS}
      <div class="tags view" transition:fly={{ duration: 200, x: -200 }}>
        <TagsEditView />
      </div>
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
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
