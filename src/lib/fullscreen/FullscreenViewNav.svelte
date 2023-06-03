<script lang="ts">

  import {createEventDispatcher, onMount} from "svelte";
  import type Image from "../../scripts/gallery/image";
  import {firebaseUser, firestoreManager} from "../../scripts/firebase/firebaseManager";
  import Tag from "../../scripts/gallery/tag";
  import AddToAlbumScreen from "../AddToAlbumScreen.svelte";
  import {fullscreenDialog} from "../../scripts/fullscreenDialog";
  import TagSelectInput from "./TagSelectInput.svelte";
  import {fly} from "svelte/transition";

  const dispatch = createEventDispatcher();

  export let image: Image;

  export let navShown = false;

  export let zooming = false;

  // let album: ReadWritable<Album>;

  $: album = $fullscreenDialog.album;

  let addToAlbumOpen = false;

  let tagsScrollElement: HTMLElement;

  let tagInput = "";
  let invisibleNavShown = true;

  onMount(() => {
    tagsScrollElement.onwheel = (event) => {
      event.stopPropagation();
      tagsScrollElement.scrollBy({
        left: event.deltaY < 0 ? -30 : 30,
      })
    }
  })

  const onNext = () => {
    dispatch("next");
  }

  const onPrev = () => {
    dispatch("prev");
  }

  const onClose = () => {
    dispatch("close");
  }

  const onDelete = () => {
    dispatch("delete");
  }

  const toggleNav = () => {
    dispatch("toggle-nav");
  }

  const onFavorite = () => {
    firestoreManager.updateImageProps($firebaseUser, image, {favorite: !image.favorite});
  }


  const addTag = async ({detail: tag}: CustomEvent<Tag>) => {
    await firestoreManager.addTagToImage($firebaseUser, image, tag);
  }

  const removeTag = (tag: Tag) => {
    firestoreManager.removeTagFromImage($firebaseUser, image, tag);
  }

  const makeAlbumCover = () => {
    if ($album == null) return;

    if ($album.isFavorites) {
      firestoreManager.updateFavoriteAlbumCover($firebaseUser, image);
    } else {
      firestoreManager.updateAlbumProps($firebaseUser, $album, {cover: image.id});
    }
  }

  let to;
  $: if(zooming){
    invisibleNavShown = false;
    to && clearTimeout(to);
  }else{
    to = setTimeout(()=>{
      invisibleNavShown = true;
    }, 300);
  }
</script>

<div class="bare-nav" class:not-shown={zooming && !navShown}>
    <button class="material back-btn" on:click={onClose}>
        <span class="material-icons">arrow_back</span>
    </button>
    <button class="material toggle-nav-btn" on:click={toggleNav}>
        <span class="material-icons-outlined">{navShown ? "visibility_off" : "info"}</span>
    </button>
</div>


{#if invisibleNavShown}
    <div class="invisible-fs-nav">
        <div class="left" role="button" on:click={onPrev}></div>
        <div class="center" role="button"></div>
        <div class="right" role="button" on:click={onNext}></div>
    </div>
{/if}

<div class="main" class:visible={navShown}>
    <div class="top-nav-bar">
        <div class="left">
            <button class="material back-btn-fake">
                <span class="material-icons">arrow_back</span>
            </button>
        </div>

        <div class="right">
            <button class="material favorite" class:is-favorite={image?.favorite} on:click={onFavorite}>
                <span class="material-icons-outlined">{image?.favorite ? "star" : "star_outline"}</span>
            </button>
            <button class="material add-to-album" on:click={()=>addToAlbumOpen = true}>
                <span class="material-icons-outlined">add_to_photos</span>
            </button>
            <div class="context-menu">

                <button class="material toggle-nav">
            <span class="material-icons">
              more_vert
            </span>
                </button>
                <div class="drop-down box-shadow">
                    <button class="material text-button drop-down-item"
                            on:click={onDelete}>
            <span class="name">
              Delete
            </span>
                    </button>
                    {#if $album != null}
                        <button class="material text-button drop-down-item"
                                on:click={makeAlbumCover}>
            <span class="name">
              Make album cover
            </span>
                        </button>
                    {/if}
                </div>
            </div>

            <button class="material toggle-nav-btn-fake">
                <span class="material-icons-outlined">{navShown ? "visibility_off" : "visibility"}</span>
            </button>

        </div>

    </div>

    <div class="page-nav">
        <button class="material no-effect" on:click={onPrev}>
            <span class="material-icons">navigate_before</span>
        </button>
        <button class="material no-effect" on:click={onNext}>
            <span class="material-icons">keyboard_arrow_right</span>
        </button>
    </div>

    <div class="tags-nav">

        <div bind:this={tagsScrollElement} class="tags-list">
            {#each image?.tags ?? [] as tag (tag.id)}
                <div class="tag">
                    <span class="name">{tag.name}</span>
                    <button class="remove-tag material" on:click={()=>removeTag(tag)}>
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
            {/each}
        </div>
        <div class="input-field">
            <TagSelectInput {image} on:addTag={addTag}/>
        </div>
    </div>

</div>

{#if addToAlbumOpen}
    <AddToAlbumScreen {image} on:close={()=>addToAlbumOpen = false}/>
{/if}

<style lang="scss">

  .invisible-fs-nav {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;

    .left, .right, .center {
      flex: 1 1 auto;
      height: 100%;
    }

    .center {
      width: 60%;
    }

    .left, .right {
      pointer-events: auto;
    }
  }


  .bare-nav {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    display: flex;
    justify-content: space-between;
    z-index: 1;
    transition: top 0.2s ease-in-out;

    .toggle-nav-btn {
      position: relative;
      top: -1px;
      right: 0;
      margin: 0.5rem;
    }

    .back-btn {
      position: relative;
      top: -1px;
      left: 0;
      margin: 0.5rem;

    }
  }

  .bare-nav.not-shown{
    top: -100px;
  }

  .toggle-nav-btn-fake, .back-btn-fake {
    visibility: hidden;
  }

  button, input {
    pointer-events: all;
  }

  .main {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    opacity: 0;
    visibility: hidden;

    transition: visibility 0.2s, opacity 0.2s ease-in-out;
  }

  .main.visible {
    opacity: 1;
    visibility: visible;
  }

  .main .page-nav {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .main .page-nav button {
    outline: none;
    cursor: pointer;
    color: white;
    font-size: 2rem;
    padding: 0.2em;
    margin: .5em;
    background-color: #000000;
    border: 1px solid #00000000;
    transition: all 0.2s ease-in-out;
  }

  .main .page-nav button:hover {
    background-color: #494949;
    border-color: #5e5e5e;
  }

  .top-nav-bar {
    width: 100%;
    height: 3em;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .top-nav-bar .left {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-left: 1em;
  }

  .top-nav-bar .right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-right: 1em;
  }

  .top-nav-bar > div > button {
    margin: 0.5em;
  }

  .top-nav-bar .favorite.is-favorite span {
    color: #f1c40f;
  }


  .tags-nav {
    position: relative;
    width: 100%;

    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
  }

  .tags-list {
    display: flex;
    width: 100%;
    margin: 0;
    overflow-x: auto;

    pointer-events: all;
  }

  .tags-list::-webkit-scrollbar {
    height: 0.5em;
  }

  .tags-list .tag {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0.5em;
    padding: 0 0 0 0.5rem;
    background-color: var(--primary-color);
    border-radius: 0.5em;
  }

  .tags-list .tag button span {
    font-size: 1.1rem;
    transition: all 0.2s ease-in-out;
  }

  .tags-list .tag button:hover span {
    color: #ffcdc9;
  }

  .tags-list .tag .name {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .context-menu {
    position: relative;
  }

  .context-menu button {
    pointer-events: all;
  }

  .context-menu:not(:focus-within) .drop-down {
    opacity: 0;
    pointer-events: none;
  }

  .context-menu .drop-down {
    position: absolute;
    top: 100%;
    right: 0;
    /*width: 100%;*/
    border-radius: 0.2em;
    /*padding: 0.5em;*/
    background-color: #424242;
    opacity: 1;
    pointer-events: all;
    transition: all 0.2s ease-in-out;
    width: auto;
  }

  .context-menu .drop-down button {
    width: 100%;
    padding: 0.5em 1.5em;
    /*background-color: var(--primary-color);*/
    border-radius: 0.5em;
    border: none;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    white-space: nowrap;
  }

  .context-menu .drop-down button:not(:last-child) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .context-menu .drop-down button:not(:first-child) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
</style>
