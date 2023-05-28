<script lang="ts">

  import type { ReadWritable } from "../../scripts/util/helperTypes";
  import { writable } from "svelte/store";
  import type Image from "../../scripts/gallery/image";
  import Zoom from "svelte-zoom";
  import { onMount } from "svelte";
  import type { ScrollObserver } from "../../scripts/util/scrollObserver";
  import { createScrollObserver } from "../../scripts/util/scrollObserver";
  import { getSrc } from "../../scripts/util/cacheHelper";

  export let images: ReadWritable<Image[]> = writable([]);

  export let currentImageIndex: number = 0;

  export let currentImage: Image;

  const PROGRESS_TO_NEXT_IMAGE = 0.5;
  const SPEED_TO_NEXT_IMAGE = 1.2;

  let initialized = false;

  $: upcomingImageIndex = (currentImageIndex + 1) % $images.length;
  $: previousImageIndex = (currentImageIndex - 1 + $images.length) % $images.length;

  $: currentImage = $images[currentImageIndex];
  $: upcomingImage = $images[upcomingImageIndex];
  $: previousImage = $images[previousImageIndex];

  let carouselElement: HTMLElement;
  let scrollObserver: ScrollObserver;

  $: if (carouselElement) {
    carouselElement.scrollTo({
      left: carouselElement.clientWidth * currentImageIndex,
      behavior: "smooth"
    });
  }

  const scrollToAbs = (x: number, smooth: boolean = false) =>{
    carouselElement?.scrollTo({
      left: x,
      behavior: smooth ? "smooth" : "auto"
    });
  }

  const scrollTo = (index: number, smooth: boolean = false) =>{
    scrollToAbs(carouselElement.clientWidth * index, smooth);
  }

  $: if(currentImageIndex != null && !initialized){
    initialized = true;
    scrollTo(currentImageIndex, false);
  }

  onMount(() => {
    scrollObserver = createScrollObserver(carouselElement, { uniDirectional: true });

    scrollObserver.onScrollEnd(([x, y], [speedX, speedY], [progressX, progressY]) => {
      const transition = Math.abs(progressX) > PROGRESS_TO_NEXT_IMAGE || Math.abs(speedX) > SPEED_TO_NEXT_IMAGE;
      const deltaIndex = -Math.sign(progressX);

      if (transition) {
        if (currentImageIndex + deltaIndex < 0) {
          currentImageIndex = 0;
        } else if (currentImageIndex + deltaIndex >= $images.length) {
          currentImageIndex = $images.length - 1;
        } else {
          currentImageIndex += deltaIndex;
        }

        scrollTo(currentImageIndex, true);
      }

    })

    scrollTo(currentImageIndex, false);
  })

  $: sliding = $scrollObserver?.direction != null;

  $: if (scrollObserver && carouselElement) {
    scrollToAbs(carouselElement.clientWidth * currentImageIndex - $scrollObserver?.deltaX, !sliding);
  }

</script>

<div bind:this={carouselElement} class="main no-scroll-bar">

  <div class="image-list">
    {#each $images as image, index}
      <div class="image-container" class:active={index === currentImageIndex}>
        <Zoom loading="lazy" src={image.src} alt={image.alt}/>
      </div>
    {/each}
  </div>

</div>

<style>

  .main {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-y: auto;
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
