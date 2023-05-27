<script lang="ts">

  import type Image from "../scripts/gallery/image";
  import GalleryView from 'svelte-gallery-view'
  import { fullscreenDialog } from "../scripts/fullscreenDialog";
  import { writable } from "svelte/store";
  import type { ReadWritable } from "../scripts/util/helperTypes";

  export let images: ReadWritable<Image[]> = writable([]);

  $: photosFormatted = $images.map((img) => {
    return {
      title: img.name,
      ...img
    }
  });

  const openFullscreenDialog = (image) => {
    const index = photosFormatted.indexOf(image);
    fullscreenDialog.show(images, Math.max(index, 0));
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
