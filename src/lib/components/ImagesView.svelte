<script lang="ts">

  import type Image from "../../scripts/gallery/image";
  import GalleryView from 'svelte-gallery-view'
  import type { Readable, } from "svelte/store";
  import { writable } from "svelte/store";
  import type { ReadWritable } from "../../scripts/util/helperTypes";
  import type Album from "../../scripts/gallery/album";
  import { route } from "../../scripts/routeManager";
  import { localConfig } from "../../scripts/localConfig";
  import { applyFilters } from "../../scripts/filters";
  import {getIfHasCachedOrUncachedOtherwise} from "../../scripts/util/cacheHelper";

  export let images: ReadWritable<Image[]> = writable([]);
  export let album: ReadWritable<Album> = null;

  let filteredImages: Readable<Image[]>
  let photosFormatted: any[] = [];

  // $: console.log("ALBUM", $album)

  // Store goes brrrr
  $: $localConfig.currentImageViewStore.set(applyFilters(images, album))
  $: imageViewStore = $localConfig.currentImageViewStore;
  $: filteredImages = $imageViewStore;

  let loadKey = 0;
  let previousImages: string[] = [];

  const loadImages = async (images: Image[]) => {
    const ids = images.map(i=> i.id);
    if (ids.join(",") === previousImages.join(",")) return;
    previousImages = ids;
    loadKey++;
    const key = loadKey;
    const promises = await Promise.all(images.map((img) => getIfHasCachedOrUncachedOtherwise(img.thumbnailSrc)))

    if (key !== loadKey) return;

    photosFormatted = images.map((img, i) => {
      return {
        orig: img,
        title: img.name,
        ...img,
        url: promises[i],
      }
    });
  }

  $: loadImages($filteredImages)

  const openFullscreenDialog = (image) => {
    const index = $filteredImages.indexOf(image.orig);

    route.setFullscreenImage($filteredImages[index])
  }
</script>

<div class="main">

  <div class="gallery">
    <GalleryView
        baseHeight={180}
        gutter={2}
        onPhotoClick={openFullscreenDialog}
        photoClass="photo"
        photos={photosFormatted}
    />
  </div>

</div>

<style>
  img {
    max-width: 100%;
    max-height: 100%;
  }

</style>
