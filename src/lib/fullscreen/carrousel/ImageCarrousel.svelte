<script lang="ts">

  import type {ReadWritable} from "../../../scripts/util/helperTypes";
  import {writable} from "svelte/store";
  import type Image from "../../../scripts/gallery/image";
  import {onMount} from "svelte";
  import ImageWrapper from "../../components/ImageWrapper.svelte";
  import {CarrouselScrollHelper} from "./carrouselScrollHelper";

  export let images: ReadWritable<Image[]> = writable([]);

  export let currentImageIndex: number = 0;

  export let currentImage: Image;

  export let zooming: boolean;

  const PROGRESS_TO_NEXT_IMAGE = 0.3;
  const SPEED_TO_NEXT_IMAGE = 0.8;
  const LOAD_IMAGES_AHEAD = 2;
  const SINGLE_CLICK_PROGRESS_TO_NEXT_IMAGE = 0.2;

  let initialized = false;
  let zoom: number;

  $: zooming = zoom != 1;

  $: upcomingImageIndex = (currentImageIndex + 1) % $images.length;
  $: previousImageIndex = (currentImageIndex - 1 + $images.length) % $images.length;

  $: currentImage = $images[currentImageIndex];
  $: upcomingImage = $images[upcomingImageIndex];
  $: previousImage = $images[previousImageIndex];

  $: loaded_image_indexes = Array.from({length: LOAD_IMAGES_AHEAD * 2 + 1}, (_, index) => currentImageIndex - LOAD_IMAGES_AHEAD + index)


  let carouselElement: HTMLElement;
  let carrouselHelper: CarrouselScrollHelper;
  let carrouselSingleClickEnabled = true;

  let to;

  $: if(zooming){
    carrouselSingleClickEnabled = false;
    to && clearTimeout(to);
  }else{
    to = setTimeout(() => {
      carrouselSingleClickEnabled = true;
    }, 300);
  }


  $: if (currentImageIndex != null && carrouselHelper != undefined) {
    carrouselHelper.setIndex(currentImageIndex, initialized);
    initialized = true;
  }

  onMount(() => {
    carrouselHelper = new CarrouselScrollHelper(carouselElement, currentImageIndex, {
      progress_to_next_image: PROGRESS_TO_NEXT_IMAGE,
      speed_to_next_image: SPEED_TO_NEXT_IMAGE,
    });

    carrouselHelper.index.subscribe((index) => {
      if (index != currentImageIndex) {
        currentImageIndex = index;
      }
    });

    carrouselHelper.observer.onClick((_: [x: number, y: number], [progressX,]: [x: number, y: number]) => {
      if (!carrouselSingleClickEnabled) return;
      if (progressX < SINGLE_CLICK_PROGRESS_TO_NEXT_IMAGE) {
        carrouselHelper.movePrevious();
      }

      if (progressX > 1 - SINGLE_CLICK_PROGRESS_TO_NEXT_IMAGE) {
        carrouselHelper.moveNext();
      }
    });
  })


  $: if (carrouselHelper) carrouselHelper.enabled = !zooming;


</script>

<div bind:this={carouselElement} class="main no-scroll-bar">

    <div class="image-list">
        {#each $images as image, index}
            <div class="image-container" class:active={index === currentImageIndex}>
                <ImageWrapper loading={loaded_image_indexes.includes(index) ? "eager" : "lazy"} {image}
                              zoomEnabled={index === currentImageIndex} bind:zoom/>
            </div>
        {/each}
    </div>

</div>

<style>

    .main {
        position: relative;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
    }

    .image-list {
        position: relative;
        height: 100%;
        display: flex;

    }

    .image-container {
        background-color: #2c2c2c;
        flex-shrink: 0;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: -1;
    }

    .image-container.active {
        z-index: 0;
    }

    .image-container img {
        max-width: 100%;
        max-height: 100%;
    }

</style>
