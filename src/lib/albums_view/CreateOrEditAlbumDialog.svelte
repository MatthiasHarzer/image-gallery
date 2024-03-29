<script lang="ts">
  import Album from "../../scripts/gallery/album";
  import { createEventDispatcher, onMount } from "svelte";
  import { gallery } from "../../scripts/firebase/firebaseManager";
  import type Image from "../../scripts/gallery/image";
  import SelectImagesDialog from "../components/dialogs/SelectImagesDialog.svelte";
  import OrderImagesDialog from "../components/dialogs/OrderImagesDialog.svelte";
  import FlipSlider from "../util/FlipSlider.svelte";
  import Dialog from "../components/Dialog.svelte";

  const dispatch = createEventDispatcher();

  export let album: Album | null = null;

  $: isEdit = album !== null && album?.id !== null;

  let selectImagesDialogOpen = false;
  let orderImagesDialogOpen = false;
  let selectCoverDialogOpen = false;

  let dummyAlbum: Album;

  onMount(() => {
    dummyAlbum = album !== null ? album.copy() : Album.dummy();
  });

  const close = () => {
    dispatch("close");
  };

  const submit = () => {
    dispatch("submit", dummyAlbum);
  };

  const deleteAlbum = () => {
    dispatch("delete", dummyAlbum);
  };

  const submitSelectedImages = ({ detail: images }: CustomEvent<Image[]>) => {
    dummyAlbum.images = images;
    selectImagesDialogOpen = false;
  };

  const submitOrderedImages = ({ detail: images }: CustomEvent<Image[]>) => {
    dummyAlbum.images = images;
    orderImagesDialogOpen = false;
  };

  const submitCover = ({ detail: image }: CustomEvent<Image | null>) => {
    selectCoverDialogOpen = false;
    dummyAlbum.cover = image;
  };

  $: availableParents = $gallery.albums.filter((a) => a.id !== dummyAlbum?.id);
</script>

<Dialog on:close>
  <button class="material delete" on:click={deleteAlbum} slot="left-action">
    <span class="material-icons"> delete </span>
  </button>

  <h3 slot="title">{isEdit ? "Edit Album" : "Create Album"}</h3>

  <div class="dialog-content">
    {#if dummyAlbum}
      <input
        type="text"
        class="album-name"
        placeholder="Enter album name..."
        bind:value={dummyAlbum.name}
      />

      <div class="parent-select">
        <label for="parent-select">Parent Album</label>
        <select id="parent-select" bind:value={dummyAlbum.parent}>
          <option value={null}>None</option>
          {#each availableParents as parent}
            <option value={parent}>{parent.name}</option>
          {/each}
        </select>
      </div>
    {/if}

    <div class="select-reorder-wrapper">
      <button
        class="material text-button select-images"
        on:click={() => (selectImagesDialogOpen = true)}
      >
        <span class="material-icons">add</span>
        <span>Select Images</span>

        <span class="number-selected-images">
          ({dummyAlbum?.images.length} selected)
        </span>
      </button>

      <button
        class="material text-button reorder-images"
        on:click={() => (orderImagesDialogOpen = true)}
      >
        <span class="material-icons">reorder</span>
        <span>Reorder Images</span>
      </button>

      <button
        class="material text-button select-cover"
        on:click={() => (selectCoverDialogOpen = true)}
      >
        <span class="material-icons">image</span>
        <span>Select Cover</span>
      </button>
    </div>
    <div class="force-order-wrapper">
      {#if dummyAlbum}
        <FlipSlider bind:active={dummyAlbum.forceSort} id="force-order" />
        <!--suppress XmlInvalidId -->
        <label for="force-order">Force Image Order</label>
      {/if}
    </div>
    <button class="material text-button submit-btn" on:click={submit}>
      <span class="material-icons">done</span>
      <span>Submit</span>
    </button>
  </div>
</Dialog>

{#if selectImagesDialogOpen}
  <SelectImagesDialog
    selectedImages={dummyAlbum?.images ?? []}
    on:submit={submitSelectedImages}
    on:close={() => (selectImagesDialogOpen = false)}
  />
{/if}

{#if orderImagesDialogOpen}
  <OrderImagesDialog
    images={dummyAlbum.images ?? []}
    on:submit={submitOrderedImages}
    on:close={() => (orderImagesDialogOpen = false)}
  />
{/if}

{#if selectCoverDialogOpen}
  <SelectImagesDialog
    selectedImages={dummyAlbum?.cover !== null ? [dummyAlbum.cover] : []}
    multiple={false}
    on:submit={submitCover}
    on:close={() => (selectCoverDialogOpen = false)}
  />
{/if}

<style lang="scss">
  .dialog-content {
    position: relative;
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }

  .submit-btn {
    margin-top: 20px;
    background-color: #4caf50;
  }

  .album-name {
    width: 100%;
    height: 30px;
    border: none;
    border-bottom: 1px solid #ccc;
    font-size: 20px;
    padding: 5px;
    margin-bottom: 20px;
  }

  .parent-select {
    width: 100%;
    margin-bottom: 20px;
    display: flex;
    flex-direction: row;
  }

  .parent-select label {
    margin-right: 10px;
    font-size: 1.2em;
  }

  .select-reorder-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 20px;
  }

  .select-reorder-wrapper > button {
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
    margin: 5px;
  }

  .number-selected-images {
    margin-left: 10px;
  }

  .force-order-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 20px;

    label {
      margin-left: 10px;
      cursor: pointer;
      user-select: none;
    }
  }
</style>
