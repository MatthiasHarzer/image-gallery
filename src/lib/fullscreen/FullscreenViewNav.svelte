<script lang="ts">

  import { createEventDispatcher, onMount } from "svelte";
  import type Image from "../../scripts/gallery/image";
  import { firebaseUser, firestoreManager, gallery } from "../../scripts/firebase/firebaseManager";
  import Tag from "../../scripts/gallery/tag";

  const dispatch = createEventDispatcher();

  export let image: Image;

  let tagsScrollElement: HTMLElement;

  let tagInput = "";

  onMount(()=>{
    tagsScrollElement.onwheel = (event) => {
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

  const onFavorite = () => {
    firestoreManager.updateImageProps($firebaseUser, image, { favorite: !image.favorite });
  }

  const onTagEnter = async () =>{
    tagInput = tagInput.trim();

    if(tagInput.length === 0) return;

    const existingTag = $gallery.tags.find(tag => tag.name.toLowerCase() === tagInput.toLowerCase());

    let tag: Tag;

    if (existingTag){
      if(image.tags.some(tag => tag.id === existingTag.id)) return;
      tag = existingTag;
    }else{
      const doc = await firestoreManager.createTag($firebaseUser, {
        name: tagInput,
        description: ""
      })
      tag = new Tag(doc.id, tagInput, "");
    }

    await firestoreManager.addTagToImage($firebaseUser, image, tag);

    tagInput = "";
  }

  const removeTag = (tag: Tag) =>{
    firestoreManager.removeTagFromImage($firebaseUser, image, tag);
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

  <div class="tags-nav">

    <div class="tags-list" bind:this={tagsScrollElement}>
      {#each image.tags as tag (tag.id)}
        <div class="tag">
          <span class="name">{tag.name}</span>
          <button class="remove-tag material" on:click={()=>removeTag(tag)}>
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
      {/each}
    </div>
    <div class="input-field">
      <input id="tag" type="text"
             bind:value={tagInput}
             placeholder="Enter tag..."
             on:keyup={e => {if(e.key === "Enter") onTagEnter()}}
      />
      <label for="tag">
        <button class="material no-effect" on:click={onTagEnter}>
          <span class="material-icons">add</span>
        </button>
      </label>
    </div>
  </div>

</div>

<style>

  button, input{
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

  .top-nav-bar .favorite.is-favorite span{
    color: #f1c40f;
  }

  .input-field{
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    /*width: 100%;*/
    width: 350px;
    /*height: 3em;*/
    margin: 0.5em auto;

    background-color: #313131;
    border-radius: 0.5em;
  }

  .input-field input{
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    background-color: #00000000;
    color: white;
    font-size: 1.1rem;
    padding: 0.5em;
    margin: 0;
    border-bottom: 1px solid #ffffff;
    border-radius: inherit;
  }

  .input-field label{
    border-radius: inherit;
  }

  .input-field button{
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    background-color: var(--primary-color);
    border-radius: inherit;
  }
  .input-field button:hover{
    background-color: var(--primary-color-accent);
  }

  .tags-nav{
    position: relative;
    width: 100%;

    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
  }

  .tags-list{
    display: flex;
    width: 100%;
    margin: 0;
    overflow-x: auto;

    pointer-events: all;
  }

  .tags-list::-webkit-scrollbar {
    height: 0.5em;
  }

  .tags-list .tag{
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0.5em;
    padding: 0 0 0 0.5rem;
    background-color: var(--primary-color);
    border-radius: 0.5em;
  }

  .tags-list .tag button span{
    font-size: 1.1rem;
    transition: all 0.2s ease-in-out;
  }
  .tags-list .tag button:hover span{
    color: #ffcdc9;
  }

  .tags-list .tag .name{
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
