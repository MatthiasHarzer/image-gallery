<script lang="ts">

  import type {ReadWritable} from "../../scripts/util/helperTypes";
  import {writable} from "svelte/store";
  import type Image from "../../scripts/gallery/image";
  import {onMount} from "svelte";
  import ImageWrapper from "../components/ImageWrapper.svelte";
  import Flickity, {} from "flickity";
  import "flickity/dist/flickity.min.css";

  export let images: ReadWritable<Image[]> = writable([]);

  export let currentImageIndex: number = 0;

  export let currentImage: Image;

  export let zooming: boolean;

  let initialized = false;
  let zoom: number;

  $: zooming = zoom != 1;

  $: currentImage = $images[currentImageIndex];


  let carouselElement: HTMLElement;
  let carrouselSingleClickEnabled = true;
  let flickity: Flickity;
  let _flickityOptions: Flickity.Options = {};
  let to: ReturnType<typeof setTimeout>;

  $: if (zooming) {
    carrouselSingleClickEnabled = false;
    to && clearTimeout(to);
  } else {
    to = setTimeout(() => {
      carrouselSingleClickEnabled = true;
    }, 300);
  }


  $: if (currentImageIndex != null && flickity != undefined) {
    flickity && flickity.select(currentImageIndex, false, !initialized);
    initialized = true;
  }


  const buildFlickity = (options: Flickity.Options) => {
    if (!carouselElement) return;
    flickity = new Flickity(carouselElement, options);
    flickity.on('change', (index: number) => {
      if (index != currentImageIndex) {
        currentImageIndex = index;
      }
    });
  }
  const applyFlickityOptions = (options: Flickity.Options, overwrite = false) => {
    if (!carouselElement) return;
    flickity && flickity.destroy();
    if (overwrite){
      _flickityOptions = {};
    }
    _flickityOptions = {..._flickityOptions, ...options};
    _flickityOptions.initialIndex = currentImageIndex;
    buildFlickity(_flickityOptions);
  }

  const enableFlickity = () => {
    applyFlickityOptions({
      draggable: ">1"
    });
  }

  const disableFlickity = () => {
    applyFlickityOptions({
      draggable: false
    });
  }

  $: if (carrouselSingleClickEnabled){
    enableFlickity();
  } else {
    disableFlickity();
  }



  onMount(() => {
    applyFlickityOptions({
      cellAlign: 'center',
      prevNextButtons: false,
      pageDots: false,
      wrapAround: true,
      draggable: ">1"
    }, true)
  })
</script>


<div class="carousel" class:no-zoom={!carrouselSingleClickEnabled} bind:this={carouselElement}>
    {#each $images as image, index (image.id)}
      <div class="image-container" class:active={index === currentImageIndex}>
        <ImageWrapper loading="lazy" {image}
                      zoomEnabled={index === currentImageIndex} bind:zoom/>
      </div>
    {/each}
</div>

<style lang="scss">

  .carousel {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .image-container {
    width: 100%;
    height: 100%;
    margin: 0 2px;

  }

</style>
