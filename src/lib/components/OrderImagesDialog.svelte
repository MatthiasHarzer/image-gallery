<script lang="ts">

  import type Image from "../../scripts/gallery/image";
  import {flip} from "svelte/animate";
  import {createEventDispatcher, onMount} from "svelte";
  import ImageWrapper from "./ImageWrapper.svelte";

  const dispatch = createEventDispatcher();

  export let images: Image[] = [];

  let dummyImages: Image[] = [];

  onMount(() => {
    dummyImages = [...images];
  })

  const close = () => {
    dispatch("close")
  }

  const submit = () => {
    dispatch("submit", dummyImages);
  }

  const dragDuration = 300;
  // @ts-ignore
  let draggingImage;
  let animatingImages = new Set();

  const swapWith = (image) => {
    if (draggingImage === image || animatingImages.has(image)) return;
    animatingImages.add(image);
    setTimeout(() => animatingImages.delete(image), dragDuration);
    const cardAIndex = dummyImages.indexOf(draggingImage);
    const cardBIndex = dummyImages.indexOf(image);
    dummyImages[cardAIndex] = image;
    dummyImages[cardBIndex] = draggingImage;
  }

</script>

<div class="blur-background">
  <div class="dialog no-scroll-bar">
    <div class="dialog-header">
      <h3>
        Reorder Images
      </h3>
      <button class="material close-btn" on:click={close}>
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="dialog-content discrete-scrollbar">
      <div class="images">

        {#each dummyImages as image (image.id)}
          <div
              animate:flip={{ duration: dragDuration }}
              class="image-container"
              draggable="true"
              on:dragstart={() => draggingImage = image}
              on:dragend={() => draggingImage = undefined}
              on:dragenter={() => swapWith(image)}
              on:dragover|preventDefault
          >
            <div class="img">
              <ImageWrapper {image} cover={true} thumbnail={true}/>
            </div>
            <div class="image-name">
              <span>{image.name}</span>
            </div>
          </div>

        {/each}
      </div>


    </div>
    <div class="dialog-footer">
      <button class="material text-button submit-btn" on:click={submit}>

          <span class="material-icons">
            check
          </span>
        Submit
      </button>
    </div>
  </div>
</div>

<style>
    .dialog-header {
        flex: 0;
    }

    .dialog-content {
        flex: 1;
        margin-top: 1rem;
        width: 90vw;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;

        overflow-y: auto;
    }

    .dialog-footer {
        width: 100%;
        display: flex;
        justify-content: center;
        flex: 0;
    }

    .images {
        width: 90%;
        height: fit-content;
        display: grid;
        grid-gap: 10px;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, min(150px, 25%)), 1fr));
        grid-auto-rows: 1fr;
    }

    .image-container {
        padding: 0;
        position: relative;
        /*width: 100%;*/
        overflow: hidden
    }

    .image-container .image-name{
        position: absolute;
        bottom: 0;
        left: 0;
        width: 90%;
        background-color: rgba(0,0,0,0.5);
        color: white;
        padding: 0.5rem;
        font-size: 1rem;
        font-weight: 500;
        text-align: center;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .image-container .img {
        position: relative;
        /*width: 100%;*/
        /*height: 100%;*/

        object-fit: cover;
        aspect-ratio: 1;
        border-radius: 0.5rem;
        overflow: hidden;
        transition: all 0.2s ease-in-out;
    }

    .submit-btn {
        margin: 1rem;
        width: 100%;
        max-width: 300px;
        background-color: var(--primary-color);
    }
</style>
