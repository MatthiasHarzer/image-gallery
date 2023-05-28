<script lang="ts">
  import Header from "./lib/Header.svelte";
  import GalleryApp from "./lib/GalleryApp.svelte";
  import { fullscreenDialog } from "./scripts/fullscreenDialog";
  import FullscreenView from "./lib/fullscreen/FullscreenView.svelte";
  //

  // $: console.log($fullscreenDialog)
</script>

<main>
  <div class="header">
    <Header/>
  </div>
  <div class="app-content">
    <GalleryApp/>
  </div>
</main>

{#if $fullscreenDialog.shown}
  <FullscreenView
      images={$fullscreenDialog.images}
      initialImageIdx={$fullscreenDialog.initialImageIdx}
  />
{/if}

<style>
  main {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .header {
    flex: 0;
  }

  .app-content {
    flex: 1;
  }

  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }

  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }

  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }

  .read-the-docs {
    color: #888;
  }
</style>
