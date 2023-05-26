<script lang="ts">

  import type { default as CustomImage } from "../../scripts/gallery/image";
  import { onMount } from "svelte";
  import LoadingSpinner from "../util/LoadingSpinner.svelte";
  import FullscreenViewNav from "./FullscreenViewNav.svelte";
  import { fullscreenDialog } from "../../scripts/fullscreenDialog";

  export let images: CustomImage[] = [];
  export let currentImage: CustomImage = null;

  $: index = images.indexOf(currentImage);

  interface PromisedImage {
    src: string;
    name: string;
  }

  let navShown = true;
  let imagePromise: Promise<PromisedImage> = null;
  const imageCache = new Map<number, Promise<PromisedImage>>();

  onMount(() => {
    if (currentImage == null && images.length > 0) {
      currentImage = images[0];
    }

    setImage(index);
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

    if (imageCache.has(idx)) {
      imagePromise = imageCache.get(idx);
    } else {
      imagePromise = new Promise((resolve, reject) => {
        const image = new Image();
        image.src = images[idx].url;
        image.onload = () => {
          resolve({
            src: images[idx].url,
            name: images[idx].name
          });
        }
        image.onerror = () => {
          reject();
        }
      });
      imageCache.set(idx, imagePromise);
    }


  }

  const onNext = () => {
    setImage(index + 1);
  }

  const onPrevious = () => {
    setImage(index - 1);
  }

  const onClose = () =>{
    fullscreenDialog.hide();
  }


</script>


<div class="main">
  {#if imagePromise != null}
    <div class="image-container">
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
  {:else}


  {/if}

  {#if navShown}
    <FullscreenViewNav on:next={onNext} on:prev={onPrevious} image={currentImage} on:close={onClose} />
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
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .image-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .image-container img {
    max-width: 100%;
    max-height: 100%;
  }

</style>
