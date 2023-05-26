<script lang="ts">

  import type Image from "../scripts/gallery/image";
  import GalleryView from 'svelte-gallery-view'
  import { fullscreenDialog } from "../scripts/fullscreenDialog";

  export let images: Image[] = [];

  $: photosFormatted = images.map((img) => {
    return {
      original: img,
      title: img.name,
      ...img
    }
  });

  const openFullscreenDialog = (image) => {
    fullscreenDialog.show(images, image.original);
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
