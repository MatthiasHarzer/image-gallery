<script lang="ts">

  import type { default as CustomImage } from "../../scripts/gallery/image";
  import { onMount } from "svelte";
  import LoadingSpinner from "../util/LoadingSpinner.svelte";
  import FullscreenViewNav from "./FullscreenViewNav.svelte";
  import { fullscreenDialog } from "../../scripts/fullscreenDialog";
  import { firebaseUser, firestoreManager } from "../../scripts/firebase/firebaseManager";

  export let images: CustomImage[] = [];
  export let currentImage: CustomImage = null;

  $: index = images.indexOf(currentImage);
  $: upcomingImage = index + 1 >= images.length ? images[0] : images[index + 1];
  $: previousImage = index - 1 < 0 ? images[images.length - 1] : images[index - 1];

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

  const getOrCache = (image: CustomImage) => {
    const idx = images.indexOf(image);
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

  $: if (currentImage) {
    imagePromise = getOrCache(currentImage);

    scrollElement && scrollElement.scrollTo({
      left: pageWidth,
    });
  }
  $: if (upcomingImage) {
    upcomingImagePromise = getOrCache(upcomingImage);
  }
  $: if (previousImage) {
    previousImagePromise = getOrCache(previousImage);
  }

  $: renderedImages = [previousImagePromise, imagePromise, upcomingImagePromise]


  onMount(() => {
    if (currentImage == null && images.length > 0) {
      currentImage = images[0];
    }
    setImage(index);

    scrollElement.onscroll = (_: Event) => {
      const offset = scrollElement.scrollLeft;
      const width = scrollElement.clientWidth;
      const scrollWidth = scrollElement.scrollWidth;

      const page = Math.floor(offset / width);
      const pageOffset = offset % width;
      const pageProgress = pageOffset / width;

      if (pageProgress !== 0) return;

      if(page === 0){
        onPreviousSkip()
      }else if(page === 2){
        onNextSkip()
      }
    }

  })

  const setImage = (idx: number) => {
    if (idx < 0 && images.length > 0) {
      idx = images.length - 1;
    } else if (images.length == 0) {
      return;
    } else if (idx >= images.length) {
      idx = 0;
    }

    currentImage = images[idx];
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
    fullscreenDialog.hide();
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

    images = images.filter(image => image != currentImage);

    if (images.length == 0) {
      onClose();
      return;
    }

    invalidateCache();

    if (oldIndex >= images.length) {
      setImage(images.length - 1);
    } else {
      setImage(oldIndex);
    }

  }


</script>


<div class="main">
  {#if imagePromise != null}

    <div class="scrollable-image-wrapper" bind:this={scrollElement}>
      {#each renderedImages as imagePromise}
        <div class="image-container" bind:clientWidth={pageWidth}>
          {#await imagePromise}
            <div class="loading">
              <LoadingSpinner/>
            </div>
          {:then image}
            <img src={image.src} alt={image.name}/>
          {:catch error}
            <div class="error">
              <p>Failed to load image</p>
            </div>
          {/await}
        </div>
      {/each}
    </div>
  {:else}


  {/if}

  {#if navShown}
    <FullscreenViewNav on:next={onNext} on:prev={onPrevious} image={currentImage} on:close={onClose}
                       on:delete={onDelete}/>
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

  .scrollable-image-wrapper{
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
  }

  .image-container img {
    max-width: 100%;
    max-height: 100%;
  }

</style>
