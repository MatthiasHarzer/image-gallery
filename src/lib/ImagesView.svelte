<script lang="ts">

  import type Image from "../scripts/gallery/image";
  import GalleryView from 'svelte-gallery-view'

  export let images: Image[] = [];

  $: photosFormatted = images.map((img) => {
    return {
      title: img.name,
      width: 1,
      height: 2,
      ...img
    }
  });
</script>

<div class="main">

  <div class="gallery">
    <GalleryView
        baseHeight={300}
        gutter={2}
        onPhotoClick={(photo) => {
            console.log(photo.id);
        }}
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
