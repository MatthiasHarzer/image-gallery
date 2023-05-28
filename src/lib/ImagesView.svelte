<script lang="ts">

  import type Image from "../scripts/gallery/image";
  import GalleryView from 'svelte-gallery-view'
  import { fullscreenDialog } from "../scripts/fullscreenDialog";
  import { writable } from "svelte/store";
  import type { ReadWritable } from "../scripts/util/helperTypes";
  import type Album from "../scripts/gallery/album";
  import { route } from "../scripts/routeManager";

  export let images: ReadWritable<Image[]> = writable([]);
  export let album: ReadWritable<Album> = null;

  $: photosFormatted = $images.map((img) => {
    return {
      title: img.name,
      ...img,
      url: img.src,
    }
  });

  const openFullscreenDialog = (image) => {
    const index = photosFormatted.indexOf(image);

    route.setFullscreenImage($images[index])

    // fullscreenDialog.show(images, Math.max(index, 0), album);
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
