<script lang="ts">

  import Zoom from "./svelte-zoom/Zoom.svelte";
  import LoadingSpinner from "./LoadingSpinner.svelte";
  import type Image from "../../scripts/gallery/image";

  export let image: Image;
  export let zoomEnabled: boolean = false;
  export let zoom: number = 1;

  let loader: Zoom;
  let elementZoom: number;
  $: infiniteLoad = image?.url != null ? null : new Promise((_)=>_);

  $: zoom = elementZoom ?? 1;
</script>

<div class="main">
  <Zoom loading="lazy" src={image.src} alt={image.name} {zoomEnabled} bind:zoom={elementZoom}
        bind:this={loader} {...$$props}
  />
  {#if loader || infiniteLoad}
    {#await (infiniteLoad || loader.loaded)}
      <LoadingSpinner />
    {:then img}
    {/await}
  {/if}
</div>

<style>
  .main{
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
