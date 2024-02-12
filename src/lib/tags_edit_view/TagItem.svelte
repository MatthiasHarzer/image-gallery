<script lang="ts">
  import type Tag from "../../scripts/gallery/tag";
  import { createEventDispatcher } from "svelte";

  export let tag: Tag;

  const dispatch = createEventDispatcher();
</script>

<div class="tag-item box-shadow">
  <div class="tag">
    <span>{tag.name}</span>
    <span class="count">({tag.count})</span>
  </div>

  <div class="actions">
    <button class="material edit" on:click={() => dispatch("edit", tag)}>
      <span class="material-icons">edit</span>
    </button>
    <button class="material delete" on:click={() => dispatch("delete", tag)}>
      <span class="material-icons">delete</span>
    </button>
  </div>
</div>

<style lang="scss">
  .tag-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.2rem 1rem;
    background-color: transparent;
    border-radius: 1.5rem;
    border: 1px solid #ccc;
    flex: 1;
    max-width: 100%;
    box-sizing: border-box;
    //overflow: hidden;

    height: 44px;

    .tag {
      flex: 0 1 auto;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    &.focused,
    &:hover {
      background-color: #646cff;
    }

    .count {
      font-size: 0.8rem;
      color: #ccc;
      margin-left: 3px;
    }

    .actions {
      margin-left: 15px;
      display: flex;
      //gap: 0.1rem;
    }
  }
</style>
