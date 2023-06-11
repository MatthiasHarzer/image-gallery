<script lang="ts">

  import {createEventDispatcher} from "svelte";
  import {gallery} from "../../scripts/firebase/firebaseManager";
  import {getSrcAndCache} from "../../scripts/util/cacheHelper";
  import FlipSlider from "../util/FlipSlider.svelte";
  import type Album from "../../scripts/gallery/album";
  import {readable} from "svelte/store";
  import type Image from "../../scripts/gallery/image";

  const dispatch = createEventDispatcher();

  let numDownloaded = 0;
  let selectedAlbum: Album | null = null;
  let includeSubAlbums = false;
  let matchingImages: Image[] = [];

  $: albumImages = selectedAlbum ? $gallery.listener.getAlbumImageStore(selectedAlbum, includeSubAlbums) : readable([]);
  $: matchingImages = selectedAlbum == null ? $gallery.images : $albumImages;

  let downloading = false;
  let numToDownload = null;

  const close = () => {
    dispatch("close");
  }

  const download = async () => {
    if (downloading) return;
    downloading = true;
    numToDownload = matchingImages.length;
    numDownloaded = 0;

    for (const image of matchingImages) {
      const urls = [image.src, image.thumbnailSrc];

      await Promise.all(urls.map((u) => getSrcAndCache(u)));

      numDownloaded++;
    }

    downloading = false;
    numToDownload = null;
  }
</script>

<div class="blur-background">
  <div class="dialog no-scroll-bar">
    <div class="dialog-header">
      <h3>
        Pre-Download Images
      </h3>
      <button class="material close-btn" on:click={close}>
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="dialog-content">

      <div class="select-album">
        <div class="album-select">
          <label for="album-select">Select Album</label>
          <select bind:value={selectedAlbum} id="album-select">
            <option value={null}>All</option>
            {#each $gallery.albums as album}
              <option value={album}>{album.name}</option>
            {/each}
          </select>
        </div>

        <div class="include-sub-albums">

          <!--suppress XmlInvalidId -->
          <label for="include-sub-albums">Include Sub-Albums</label>
          <FlipSlider bind:active={includeSubAlbums} id="include-sub-albums"/>
        </div>
      </div>

      <button class="material text-button download-btn" on:click={download}>
        {downloading ? "Downloading..." : "Download"}
        <span class="material-icons">download</span>
      </button>

      <div class="progress">
        {numDownloaded} / {numToDownload ?? matchingImages.length}
        <div class="progress-bar">
          <div class="progress-bar-value" style="width: {numDownloaded/(numToDownload ?? matchingImages.length)*100}%"></div>
        </div>
      </div>
    </div>

  </div>
</div>

<style lang="scss">
  .dialog-content {
    width: 90%;
    margin: 10px auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .select-album{
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;

    .album-select{
      max-width: 400px;
      margin-bottom: 10px;
    }

    .include-sub-albums{
      max-width: 400px;
      display: flex;
      flex-direction: row;
      justify-content: center;

      label{
        margin-right: 10px;
        display: flex;
        align-items: center;

      }
    }
  }

  .progress {
    display: flex;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 0.8em;

    width: 100%;

    flex-direction: column;

    .progress-bar {
      flex-grow: 1;
      height: 10px;
      background-color: var(--border-color);
      border-radius: 5px;
      overflow: hidden;
      width: 100%;

      .progress-bar-value {
        height: 100%;
        background-color: var(--primary-color);
      }
    }
  }


  .download-btn {
    margin-bottom: 20px;
    background-color: var(--primary-color);
  }


</style>
