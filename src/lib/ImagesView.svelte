<script lang="ts">

  import type Image from "../scripts/gallery/image";
  import GalleryView from 'svelte-gallery-view'
  import { fullscreenDialog } from "../scripts/fullscreenDialog";
  import { writable } from "svelte/store";
  import type { ReadWritable } from "../scripts/util/helperTypes";
  import type Album from "../scripts/gallery/album";

  export let images: ReadWritable<Image[]> = writable([]);
  export let album: ReadWritable<Album> = null;

  $: photosFormatted = $images.map((img) => {
    return {
      title: img.name,
      ...img
    }
  });

  const openFullscreenDialog = (image) => {
    const index = photosFormatted.indexOf(image);
    fullscreenDialog.show(images, Math.max(index, 0), album);
  }
</script>

<div class="main">

  <div class="gallery">
    <GalleryView
        baseHeight={300}
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
