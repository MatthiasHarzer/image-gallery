<script lang="ts">
  import { localConfig, type TagConfig } from "../../scripts/localConfig";
  import { defaultTagConfig } from "../../scripts/localConfig";
  import { createEventDispatcher } from "svelte";
  import { gallery } from "../../scripts/firebase/firebaseManager";
  import TagSelectItem from "./TagSelectItem.svelte";
  import FlipSlider from "../util/FlipSlider.svelte";
  import { applyFiltersWithConfig } from "../../scripts/filters";
  import Dialog from "../components/Dialog.svelte";
  import { route } from "../../scripts/routeManager";
  import { isNotNull } from "../../scripts/util/inlineShorthand";

  const dispatch = createEventDispatcher();

  export let tagConfig: TagConfig = defaultTagConfig;

  let search = "";

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

  $: selectedTags = [
    ...$localConfig.tagConfig.excludedTags,
    ...$localConfig.tagConfig.includedTags,
  ];

  $: relevantTags = route.currentAlbum()?.getTags() ?? $gallery.tags;
  $: tags = [
    ...new Set([
      ...relevantTags,
      ...selectedTags.map((id) => $gallery.getTagById(id)).filter(isNotNull),
    ]),
  ];
  $: filterdTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()),
  );
</script>

<Dialog on:close>
  <h3 slot="title">Select Tags</h3>

  <div class="dialog-content">
    <div>
      <input
        type="text"
        class="dark-text-input"
        bind:value={search}
        placeholder="Search tags"
      />
    </div>
    <div class="tags-list">
      {#each filterdTags as tag}
        <TagSelectItem
          {tag}
          {tagConfig}
          on:toggle={toggle}
          noMatchInAlbum={relevantTags.indexOf(tag) === -1}
        />
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
      Submit
    </button>
  </div>
</Dialog>

<style>
  .dialog-content {
    width: 90%;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.5rem;
    /*width: 100%;*/
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
