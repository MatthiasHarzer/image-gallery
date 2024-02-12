<script lang="ts">
  import type { TagConfig } from "../../scripts/localConfig";
  import { defaultTagConfig } from "../../scripts/localConfig";
  import { createEventDispatcher } from "svelte";
  import { gallery } from "../../scripts/firebase/firebaseManager";
  import TagSelectItem from "./TagSelectItem.svelte";
  import FlipSlider from "../util/FlipSlider.svelte";
  import { applyFiltersWithConfig } from "../../scripts/filters";
  import Dialog from "../components/Dialog.svelte";

  const dispatch = createEventDispatcher();

  export let tagConfig: TagConfig = defaultTagConfig;

  const close = () => {
    dispatch("close");
  };

  const submit = () => {
    dispatch("submit", tagConfig);
  };

  const toggle = ({ detail: tagId }: CustomEvent<string>) => {
    const included = tagConfig.includedTags.includes(tagId);
    const excluded = tagConfig.excludedTags.includes(tagId);

    if (included) {
      tagConfig.includedTags = tagConfig.includedTags.filter(
        (id) => id !== tagId,
      );
      tagConfig.excludedTags.push(tagId);
    } else if (excluded) {
      tagConfig.excludedTags = tagConfig.excludedTags.filter(
        (id) => id !== tagId,
      );
    } else {
      tagConfig.includedTags.push(tagId);
    }

    tagConfig = tagConfig;
  };

  $: numMatchingImages = applyFiltersWithConfig($gallery.images, {
    randomSeed: 0,
    tagConfig,
    favoritesOnly: false,
  }).length;
</script>

<Dialog on:close>
  <h3 slot="title">Select Tags</h3>

  <div class="dialog-content">
    <div class="tags-list">
      {#each $gallery.tags as tag}
        <TagSelectItem {tag} {tagConfig} on:toggle={toggle} />
      {/each}
    </div>
    <label class="match-all" id="match-all-tags">
      <FlipSlider bind:active={tagConfig.matchAll} id="match-all-tags" />
      <span>Match All Tags</span>
    </label>
    <span class="matching-number">
      {numMatchingImages} matching images
    </span>
    <button class="material text-button submit-btn" on:click={submit}>
      Close
    </button>
  </div>
</Dialog>

<style>
  .dialog-content {
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.5rem;
  }

  .match-all {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin: 0.5rem auto;
  }

  .submit-btn {
    margin: 1.5rem auto;
    background-color: #646cff;
    font-size: 1.2rem;
  }

  .matching-number {
    display: block;
    text-align: center;
    margin: 0.5rem auto;
  }
</style>
