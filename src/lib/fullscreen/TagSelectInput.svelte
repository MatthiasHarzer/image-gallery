<script lang="ts">

  import { createEventDispatcher } from "svelte";
  import { firebaseUser, firestoreManager, gallery } from "../../scripts/firebase/firebaseManager";
  import Tag from "../../scripts/gallery/tag";
  import type Image from "../../scripts/gallery/image";

  const dispatch = createEventDispatcher();

  export let image: Image;

  let tagInput: string = "";

  let matchingTags: Tag[];
  let availableTags: Tag[] = [];

  $: if (image != null) availableTags = $gallery?.tags.filter(tag => !image.tags.some(t => t.id === tag.id));
  $: availableTags.sort((a, b) => a.name.localeCompare(b.name));
  $: matchingTags = tagInput.length == 0
      ? []
      : availableTags.filter(tag => tag.name.toLowerCase().includes(tagInput.toLowerCase()));
  $: topTenTags = matchingTags.slice(0, 10);

  const onTagEnter = async () => {
    tagInput = tagInput.trim();

    if (tagInput.length === 0) return;

    const existingTag = $gallery.tags.find(tag => tag.name.toLowerCase() === tagInput.toLowerCase());

    let tag: Tag;

    if (existingTag) {
      if (image.tags.some(tag => tag.id === existingTag.id)) return;
      tag = existingTag;
    } else {
      const doc = await firestoreManager.createTag($firebaseUser, {
        name: tagInput,
        description: ""
      })
      tag = new Tag(doc.id, tagInput, "");
    }

    addTag(tag);
  }

  const addTag = (tag: Tag) => {
    dispatch("addTag", tag);
    tagInput = "";
  }
</script>


<div class="main">
  {#if topTenTags.length > 0}
    <div class="suggestion-box box-shadow">
      {#each topTenTags as tag}
        <button class="suggestion material text-button" on:click={() => addTag(tag)}>
          <span>{tag.name}</span>
        </button>
      {/each}
    </div>
  {/if}

  <input bind:value={tagInput} id="tag"
         on:keyup={e => {if(e.key === "Enter") onTagEnter()}}
         placeholder="Enter tag..."
         type="text"
  />
  <label for="tag">
    <button class="material no-effect" on:click={onTagEnter}>
      <span class="material-icons">add</span>
    </button>
  </label>

</div>

<style>

  .main {
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
    pointer-events: all;
  }

  .main input {
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

  .main label {
    border-radius: inherit;
  }

  .main label button {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    background-color: var(--primary-color);
    border-radius: inherit;
  }

  .main button:hover {
    background-color: var(--primary-color-accent);
  }

  .suggestion-box {
    position: absolute;
    /*bottom: 200px;*/
    bottom: 100%;
    left: 0;
    width: 100%;
    background-color: #313131;
    border-radius: 0.5em;
    pointer-events: all;

    /*overflow-y: auto;*/
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  button.suggestion {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex: 0;
    width: 100%;
    height: 2.5em !important;
    padding: 0.5em 20px;
    border: none;
    background-color: #00000000;
    color: white;
    font-size: 1.1rem;
    margin: 0;
    border-radius: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  button.suggestion span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  button.suggestion:not(:last-child) {
    border-bottom: 1px solid #ffffff;
    border-radius: 0;
  }

  button.suggestion:last-child {
    border-radius: 0 0 0.5em 0.5em;
  }

  button.suggestion:first-child {
    border-radius: 0.5em 0.5em 0 0;
  }

</style>
