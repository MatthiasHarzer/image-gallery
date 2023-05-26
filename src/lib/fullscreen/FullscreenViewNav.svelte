<script lang="ts">

  import { createEventDispatcher } from "svelte";
  import type Image from "../../scripts/gallery/image";
  import { firebaseUser, firestoreManager } from "../../scripts/firebase/firebaseManager";

  const dispatch = createEventDispatcher();

  export let image: Image;

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

  const onFavorite = () => {
    firestoreManager.updateImageProps($firebaseUser, image, { favorite: !image.favorite });
    image = image;
  }
</script>

<div class="main">
  <div class="top-nav-bar">
    <div class="left">
      <button class="material" on:click={onClose}>
        <span class="material-icons">arrow_back</span>
      </button>
    </div>

    <div class="right">
      <button class="material favorite" class:is-favorite={image.favorite} on:click={onFavorite}>
        <span class="material-icons-outlined">{image.favorite ? "star" : "star_outline"}</span>
      </button>
      <button class="material delete" on:click={onDelete}>
        <span class="material-icons-outlined">delete</span>
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

</div>

<style>

  button{
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
  }

  .main .page-nav {
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

  .top-nav-bar .favorite.is-favorite span{
    color: #f1c40f;
  }
</style>
