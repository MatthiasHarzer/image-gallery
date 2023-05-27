<script lang="ts">

  import type { default as CustomImage } from "../../scripts/gallery/image";
  import { onMount } from "svelte";
  import LoadingSpinner from "../util/LoadingSpinner.svelte";
  import FullscreenViewNav from "./FullscreenViewNav.svelte";
  import { swipe } from 'svelte-gestures';
  import { firebaseUser, firestoreManager } from "../../scripts/firebase/firebaseManager";
  import type { ReadWritable } from "../../scripts/util/helperTypes";
  import { writable } from "svelte/store";
  import Zoom from "svelte-zoom";
  import { fade } from 'svelte/transition';
  import { route } from "../../scripts/routeManager";
  import ImageCarrousel from "./ImageCarrousel.svelte";

  export let images: ReadWritable<CustomImage[]> = writable([]);
  export let initialImageIdx: number = 0;

  interface PromisedImage {
    src: string;
    name: string;
  }

  let navShown = false;
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

  let currentImage: CustomImage = null;

  $: renderedImages = [previousImagePromise, imagePromise, upcomingImagePromise]
  $: loaded = renderedImages && renderedImages.every(promise => promise != null);


  $: if(currentImage) {
    route.setFullscreenImage(currentImage, true);
  }


  onMount(() => {
    if (initialImageIdx < 0 || initialImageIdx >= $images.length) {
      index = 0;
    } else {
      index = initialImageIdx;
    }
  })


  const onNext = () => {
    index = Math.min(index + 1, $images.length - 1);
  }

  const onPrevious = () => {
    index = Math.max(index - 1, 0);
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

    invalidateCache();
  }

  let lastToggle = 0;
  const toggleNav = () => {
    const now = Date.now();
    if (now - lastToggle < 200) return;
    lastToggle = now;
    navShown = !navShown;
  }


  const handleSwipe = (event) =>{
    if (event.detail.direction === "bottom"){
      toggleNav();
    }
  }
</script>


<div class="main">


  <div bind:this={scrollElement} class="scrollable-image-wrapper"
       use:swipe={{ timeframe: 300, minSwipeDistance: 100 }}
       on:swipe={handleSwipe}
  >
      <ImageCarrousel
          images={images}
          bind:currentImage
          bind:currentImageIndex={index} />
  </div>

  <FullscreenViewNav on:next={onNext} on:prev={onPrevious} image={currentImage} on:close={onClose}
                     {navShown} on:delete={onDelete} {zoomEnabled} on:toggle-nav={toggleNav}
  />

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
    overflow: hidden;
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

</style>
