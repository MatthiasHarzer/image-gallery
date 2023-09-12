<script lang="ts">

  import type {ReadWritable} from "../../../scripts/util/helperTypes";
  import {get, readable, writable} from "svelte/store";
  import type Image from "../../../scripts/gallery/image";
  import {onMount} from "svelte";
  import ImageWrapper from "../../components/ImageWrapper.svelte";
  import {CarrouselHelper} from "./carrouselHelper";

  export let images: ReadWritable<Image[]> = writable([]);

  export let currentImageIndex: number = 0;

  export let currentImage: Image;

  export let zooming: boolean;

  const PROGRESS_TO_NEXT_IMAGE = 0.3;
  const SPEED_TO_NEXT_IMAGE = 0.8;
  const SINGLE_CLICK_PROGRESS_TO_NEXT_IMAGE = 0.2;
  const ANIMATION_DURATION = 300;

  const PRELOAD_TOP_IMAGES = 2;

  let initialized = false;
  let zoom: number;

  $: zooming = zoom != 1;


  $: currentImage = $images[currentImageIndex];


  let carouselElement: HTMLElement;
  let carrouselHelper: CarrouselHelper;
  let carrouselSingleClickEnabled = true;

  let to;

  $: if (zooming) {
    carrouselSingleClickEnabled = false;
    to && clearTimeout(to);
  } else {
    to = setTimeout(() => {
      carrouselSingleClickEnabled = true;
    }, 300);
  }


  $: if (currentImageIndex != null && carrouselHelper != undefined) {
    setTimeout(()=>{
      carrouselHelper.setIndex(currentImageIndex, initialized, !initialized);
      initialized = true;
    }, 100)
  }

  onMount(() => {
    carrouselHelper = new CarrouselHelper(carouselElement, currentImageIndex, $images, {
      progress_to_next_image: PROGRESS_TO_NEXT_IMAGE,
      speed_to_next_image: SPEED_TO_NEXT_IMAGE,
      num_preload_images: PRELOAD_TOP_IMAGES,
      animation_duration: ANIMATION_DURATION,
    });

    carrouselHelper.nonFractionalIndex.subscribe((index) => {
      if (index != currentImageIndex) {
        currentImageIndex = index;
      }
    });

    carrouselHelper.observer.onClick((_: [x: number, y: number], [progressX,]: [x: number, y: number]) => {
      if (!carrouselSingleClickEnabled) return;
      if (progressX < SINGLE_CLICK_PROGRESS_TO_NEXT_IMAGE && get(carrouselHelper.nonFractionalIndex) > 0) {
        carrouselHelper.movePrevious();
      }

      if (progressX > 1 - SINGLE_CLICK_PROGRESS_TO_NEXT_IMAGE && get(carrouselHelper.nonFractionalIndex) < $images.length - 1) {
        carrouselHelper.moveNext();
      }
    });
  })


  $: if (carrouselHelper) carrouselHelper.enabled = !zooming;
  $: renderedImages = carrouselHelper ? carrouselHelper.renderedImages : readable([])

  // $: console.log($renderedImages)


</script>

<div bind:this={carouselElement} class="main no-scroll-bar">

    <div class="image-list">

        {#each $renderedImages as image, index (image.id)}
            <div class="image-container" class:active={index === currentImageIndex}>
                <ImageWrapper loading="eager" {image}
                              zoomEnabled={index === currentImageIndex} bind:zoom/>
            </div>
        {/each}

    </div>

</div>

<style>

    .main {
        position: relative;
        /*width: 70%;*/
        /*height: 70%;*/
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        /*border: 2px dashed red;*/
        /*top: 50%;*/
        /*left: 50%;*/
        /*transform: translate(-50%, -50%);*/
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
