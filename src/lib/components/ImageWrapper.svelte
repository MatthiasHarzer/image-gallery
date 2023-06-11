<script lang="ts">

  import Zoom from "../util/svelte-zoom/Zoom.svelte";
  import LoadingSpinner from "../util/LoadingSpinner.svelte";
  import type Image from "../../scripts/gallery/image";
  import {getSrcAndCache} from "../../scripts/util/cacheHelper";
  import {onMount} from "svelte";

  export let image: Image;
  export let zoomEnabled: boolean = false;
  export let zoom: number = 1;
  export let thumbnail: boolean = false;

  export let loading: string = "lazy";

  let elementZoom: number;
  let src = null;
  let element: HTMLElement;
  let caching = false;
  let observer: IntersectionObserver;
  let elementLoaded = false;

  $: zoom = elementZoom ?? 1;
  $: targetSrc = thumbnail ? image?.thumbnailSrc : image?.src;

  onMount(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onWantsToLoad();
        }
      });
    });

    if (loading === "lazy") {
      observer.observe(element);
    }
  })

  $: loaded = src !== null;

  $: if (loading === "eager") {
    onWantsToLoad();
  }


  const onWantsToLoad = async () => {
    if (loaded || caching) return;
    caching = true;
    observer?.disconnect();
    src = await getSrcAndCache(targetSrc);
  }


</script>

<div bind:this={element} class="main">
  {#if image?.url == null || !loaded || !elementLoaded}
    <div class="loading">
      <LoadingSpinner/>
    </div>
  {/if}
  <Zoom {...$$props} alt={image.name} bind:zoom={elementZoom} loading="eager"
        on:loaded={() => elementLoaded = true}
        {src}
        {zoomEnabled}
  />

</div>

<style>
  .main {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
