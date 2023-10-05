<script lang="ts">

  import type { default as CustomImage } from "../../scripts/gallery/image";
  import { onMount } from "svelte";
  import FullscreenViewNav from "./FullscreenViewNav.svelte";
  import { swipe } from 'svelte-gestures';
  import { firebaseUser, firestoreManager } from "../../scripts/firebase/firebaseManager";
  import type { ReadWritable } from "../../scripts/util/helperTypes";
  import { writable } from "svelte/store";
  import { route } from "../../scripts/routeManager";
  import ImageCarrousel from "./ImageCarrousel.svelte";
  import { localConfig } from "../../scripts/localConfig";
  import {saveMod} from "../../scripts/util/mod";

  export let images: ReadWritable<CustomImage[]> = writable([]);
  export let initialImageIdx: number = 0;

  interface PromisedImage {
    src: string;
    name: string;
  }

  const imageCache = new Map<number, Promise<PromisedImage>>();
  let imagePromise: Promise<PromisedImage> = null;
  let upcomingImagePromise: Promise<PromisedImage> = null;
  let previousImagePromise: Promise<PromisedImage> = null;
  let scrollElement: HTMLElement;

  let index = null;
  let upcomingImageIndex = null;
  let previousImageIndex = null;

  let currentImage: CustomImage = null;
  let loaded;
  let zooming;

  $: renderedImages = [previousImagePromise, imagePromise, upcomingImagePromise]
  $: loaded = renderedImages && renderedImages.every(promise => promise != null);


  $: if (currentImage) {
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
    index = saveMod(index + 1, $images.length);
  }

  const onPrevious = () => {
    index = saveMod(index - 1, $images.length);
  }

  const onClose = () => {
    route.setFullscreenImage(null);
  }

  const onDelete = async () => {
    if (!$firebaseUser || !currentImage) return;
    const confirm = window.confirm("Are you sure you want to delete this image?");
    if (!confirm) return;

    const nextImage = $images[index + 1] || $images[index - 1] || null;

    route.setFullscreenImage(nextImage, true);
    await firestoreManager.deleteImage($firebaseUser, currentImage);

  }

  let lastToggle = 0;
  const toggleNav = () => {
    const now = Date.now();
    if (now - lastToggle < 200) return;
    lastToggle = now;
    $localConfig.showFullscreenNav = !$localConfig.showFullscreenNav;
  }


  const handleSwipe = (event) => {
    if (event.detail.direction === "bottom") {
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
        bind:currentImageIndex={index}
        bind:zooming
    />
  </div>

  <FullscreenViewNav on:next={onNext} on:prev={onPrevious} image={currentImage} on:close={onClose} {zooming}
                     navShown={$localConfig.showFullscreenNav} on:delete={onDelete} on:toggle-nav={toggleNav}
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
</style>
