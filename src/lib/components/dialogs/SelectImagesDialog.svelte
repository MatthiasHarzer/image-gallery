<script lang="ts">
  import type { ReadWritable } from "../../../scripts/util/helperTypes";
  import type Image from "../../../scripts/gallery/image";
  import { writable } from "svelte/store";
  import { gallery } from "../../../scripts/firebase/firebaseManager";
  import { createEventDispatcher, onMount } from "svelte";
  import ImageWrapper from "../ImageWrapper.svelte";
  import SelectImagesView from "../SelectImagesView.svelte";
  import Dialog from "../Dialog.svelte";

  export let images: ReadWritable<Image[]> = writable(null);
  export let selectedImages: Image[] = [];

  export let title: string = "Select Images";

  export let multiple: boolean = true;

  const dispatch = createEventDispatcher();

  let availableImages: ReadWritable<Image[]>;

  $: availableImages =
    $images == null ? $gallery.listener.galleryImageStore : images;

  onMount(() => {
    if (!multiple && selectedImages.length > 1) {
      selectedImages = [selectedImages[0]];
    }
  });

  const close = () => {
    dispatch("close");
  };

  const submit = () => {
    dispatch(
      "submit",
      multiple
        ? selectedImages
        : selectedImages.length > 0
          ? selectedImages[0]
          : null,
    );
  };
</script>

<Dialog on:close>
  <h3 slot="title">
    {title}
  </h3>

  <div class="dialog-content">
    <div class="images discrete-scrollbar">
      <SelectImagesView bind:selectedImages images={$availableImages} />
    </div>

    <div class="footer">
      <button class="material text-button submit-btn" on:click={submit}>
        <span class="material-icons"> check </span>
        Submit
      </button>
    </div>
  </div>
</Dialog>

<style lang="scss">
  .dialog-header {
    flex: 0;
  }

  .dialog-content {
    flex: 1;
    margin-top: 1rem;
    box-sizing: border-box;
    width: 90vw;
    height: 100%;
    padding: 0 1rem;

    overflow: hidden;

    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;

    .images {
      flex: 1;
      width: 100%;
      padding: 0 10px;
      overflow-y: auto;
    }

    .footer {
      flex: 0;
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }

  .submit-btn {
    margin: 1rem;
    width: 100%;
    max-width: 300px;
    background-color: var(--primary-color);
  }
</style>
