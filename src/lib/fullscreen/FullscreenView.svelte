<script lang="ts">

  import type { default as CustomImage } from "../../scripts/gallery/image";
  import { onMount } from "svelte";
  import LoadingSpinner from "../util/LoadingSpinner.svelte";
  import FullscreenViewNav from "./FullscreenViewNav.svelte";
  import { fullscreenDialog } from "../../scripts/fullscreenDialog";
  import { firebaseUser, firestoreManager } from "../../scripts/firebase/firebaseManager";
  import type { ReadWritable } from "../../scripts/util/helperTypes";
  import { writable } from "svelte/store";
  import Zoom from "svelte-zoom";
  import { fade } from 'svelte/transition';
  import { route } from "../../scripts/routeManager";

  export let images: ReadWritable<CustomImage[]> = writable([]);
  export let initialImageIdx: number = 0;

  interface PromisedImage {
    src: string;
    name: string;
  }

  let navShown = true;
  const imageCache = new Map<number, Promise<PromisedImage>>();
  let imagePromise: Promise<PromisedImage> = null;
  let upcomingImagePromise: Promise<PromisedImage> = null;
  let previousImagePromise: Promise<PromisedImage> = null;
  let scrollElement: HTMLElement;
  let pageWidth: number;

  let zoomEnabled = false
  let index = null;
  let upcomingImageIndex = null;
  let previousImageIndex = null;

  // $: console.log($images, currentImage);

  $: currentImage = $images[index];
  $: if (index != null) upcomingImageIndex = index + 1 % $images.length;
  $: if (index != null) previousImageIndex = index - 1 % $images.length;

  $:if (index != null) {
    imagePromise = getOrCache(index);

    scrollElement && scrollElement.scrollTo({
      left: pageWidth,
    });
  }
  $: if (upcomingImageIndex != null) upcomingImagePromise = getOrCache(upcomingImageIndex);
  $: if (previousImageIndex != null) previousImagePromise = getOrCache(previousImageIndex);

  $: renderedImages = [previousImagePromise, imagePromise, upcomingImagePromise]
  $: loaded = renderedImages && renderedImages.every(promise => promise != null);


  $: if(currentImage) {
    route.setFullscreenImage(currentImage, true);
  }

  function getOrCache(idx: number) {
    const image = $images[idx];
    if (imageCache.has(idx)) {
      return imageCache.get(idx);
    } else {
      const promise = new Promise<PromisedImage>((resolve, reject) => {
        const img = new Image();
        img.src = image.url;
        img.onload = () => {
          resolve({
            src: image.url,
            name: image.name
          });
        }
        img.onerror = () => {
          reject();
        }
      });
      imageCache.set(idx, promise);
      return promise;
    }
  }


  onMount(() => {
    if (initialImageIdx < 0 || initialImageIdx >= $images.length) {
      index = 0;
    } else {
      index = initialImageIdx;
    }

    scrollElement.onscroll = (_: Event) => {
      const offset = scrollElement.scrollLeft;
      const width = scrollElement.clientWidth;

      const page = Math.floor(offset / width);
      const pageOffset = offset % width;
      const pageProgress = pageOffset / width;

      if (pageProgress !== 0) return;

      if (page === 0) {
        onPreviousSkip()
      } else if (page === 2) {
        onNextSkip()
      }
    }

  })

  const setImage = (idx: number) => {
    if (idx < 0 && $images.length > 0) {
      index = $images.length - 1;
    } else if ($images.length == 0) {
      return;
    } else if (idx >= $images.length) {
      index = 0;
    } else {
      index = idx;
    }
  }

  const onNextSkip = () => {
    setImage(index + 1);
  }

  const onNext = () => {
    scrollElement && scrollElement.scrollTo({
      left: pageWidth * 2,
      behavior: "smooth"
    });
  }

  const onPrevious = () => {
    scrollElement && scrollElement.scrollTo({
      left: 0,
      behavior: "smooth"
    });
  }

  const onPreviousSkip = () => {
    setImage(index - 1);
  }

  const onClose = () => {
    route.setFullscreenImage(null);
  }

  const invalidateCache = () => {
    imageCache.clear();
  }

  const onDelete = async () => {
    if (!$firebaseUser || !currentImage) return;
    const confirm = window.confirm("Are you sure you want to delete this image?");
    if (!confirm) return;
    await firestoreManager.deleteImage($firebaseUser, currentImage);

    const oldIndex = index;

    invalidateCache();

    setTimeout(()=>{

    if (oldIndex >= $images.length) {
      setImage($images.length - 1);
    } else {
      setImage(oldIndex);
    }
    }, 100);

  }

  let lastToggle = 0;
  const toggleNav = () => {
    const now = Date.now();
    if (now - lastToggle < 200) return;
    lastToggle = now;
    navShown = !navShown;
  }

  const toggleZoom = () => {
    zoomEnabled = !zoomEnabled;
  }
</script>


<div class="main">


  <div bind:this={scrollElement} class="scrollable-image-wrapper"
       on:dblclick|stopPropagation={toggleNav}
  >
    {#if loaded}
      {#each renderedImages as imagePromise}
        <div class="image-container container-{renderedImages.indexOf(imagePromise)}" bind:clientWidth={pageWidth}>
          {#await imagePromise}
            <div class="loading">
              <LoadingSpinner/>
            </div>
          {:then image}
            {#if zoomEnabled}
              <Zoom src={image.src} alt={image.name}/>
            {:else}
              <img loading="lazy" src={image.src} alt={image.name}/>
            {/if}
          {:catch error}
            <div class="error">
              <p>Failed to load image</p>
            </div>
          {/await}
        </div>
      {/each}
    {/if}
  </div>


  {#if navShown && currentImage}
    <div transition:fade="{{duration: 150}}">
      <FullscreenViewNav on:next={onNext} on:prev={onPrevious} image={currentImage} on:close={onClose}
                         on:delete={onDelete} {zoomEnabled} on:toggle-zoom={toggleZoom}/>
    </div>
  {/if}

</div>


<style>

  .main {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #2c2c2c;
    /*display: flex;*/
    /*justify-content: center;*/
    /*align-items: center;*/
  }

  .scrollable-image-wrapper {
    position: relative;
    display: flex;

    overflow-x: auto;
    scroll-snap-type: x mandatory;

    scroll-behavior: auto;

    -webkit-overflow-scrolling: touch;

    height: 100%;
  }

  .scrollable-image-wrapper::-webkit-scrollbar {
    display: none;
  }

  .image-container {
    scroll-snap-align: start;
    flex-shrink: 0;

    width: 100%;
    height: 100%;
    position: relative;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: #2c2c2c;
  }

  .image-container img {
    max-width: 100%;
    max-height: 100%;
  }

  .container-0, .container-2 {
    z-index: -1;
  }

</style>
