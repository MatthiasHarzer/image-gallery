<script lang="ts">

  import ImageWrapper from "./ImageWrapper.svelte";
  import type Image from "../../scripts/gallery/image";

  export let images: Image[] = [];
  export let selectedImages: Image[] = [];
  export let multiple = false;

  let lastIndex = 0;

  const toggle = (image: Image, shift: boolean) => {

    if (!multiple) {
      selectedImages = [image];
      return;
    }
    const index = images.indexOf(image);
    if (selectedImages.includes(image)) {
      selectedImages = selectedImages.filter(i => i !== image);
    } else {

      if (shift) {
        const start = Math.min(index, lastIndex);
        const end = Math.max(index, lastIndex);
        // console.log(index, start, end);
        selectedImages = [...selectedImages, ...images.slice(start, end + 1)];
      } else {
        selectedImages = [...selectedImages, image];
      }
      selectedImages = [...new Set(selectedImages)];
      lastIndex = images.indexOf(image);
    }
  }

</script>

<div class="main">
  <div class="images">

    {#each images as image (image.id)}

      <div role="button" class="image-container clear" class:selected={selectedImages.includes(image)}
           on:click={e=>toggle(image, e.shiftKey)}>
        <div class="img">
          <ImageWrapper {image} cover={true} thumbnail={true}/>
        </div>
        <div class="image-overlay">
            <span class="material-icons">
              check
            </span>
        </div>
      </div>

    {/each}
  </div>
</div>

<style>
  *{
    user-select: none;
  }
  .main {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .images {
    width: 100%;
    height: fit-content;
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, min(150px, 25%)), 1fr));
    grid-auto-rows: 1fr;
  }

  .image-container {
    padding: 0;
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 0.5rem;
    overflow: hidden
  }

  .image-container .img {
    position: relative;
    /*width: 250px;*/
    /*height: auto;*/
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
    transition: all 0.2s ease-in-out;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0;


    opacity: 0;

    transition: all 0.2s ease-in-out;

  }

  .image-container.selected .image-overlay {
    opacity: 1;
  }

  .image-container.selected .img {
    filter: brightness(0.5);
  }

  .image-overlay span {
    font-size: 2rem;
    color: white;
    text-align: center;
    background: rgba(1, 135, 218, 0.8);
    border-radius: 50%;
    padding: 0.5rem;

    position: absolute;
    right: 10px;
    top: 10px;
  }

</style>
