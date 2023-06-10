<script lang="ts">

  import type Tag from "../../scripts/gallery/tag";
  import {createEventDispatcher, onMount} from "svelte";

  export let tag: Tag;

  let dummyTag: Tag;

  onMount(() => {
    dummyTag = tag.copy();
  });

  const submit = () => {
    dispatch("submit", dummyTag);
  }

  const close = () => {
    dispatch("close");
  }

  const dispatch = createEventDispatcher();
</script>

<div class="blur-background">
  <div class="dialog">
    <div class="dialog-header">
      <h3>Edit Tag</h3>
      <button class="material close-btn" on:click={close}>
        <span class="material-icons">close</span>
      </button>
    </div>
    {#if dummyTag}
      <div class="dialog-content">

        <div class="input-group">
          <label for="name">Name</label>
          <input bind:value={dummyTag.name} id="name" type="text"/>
        </div>


        <div class="input-group">
          <label for="description">Description</label>
          <textarea bind:value={dummyTag.description} id="description"/>
        </div>

      </div>
    {/if}
    <div class="dialog-footer">
      <button class="material text-button submit-btn" on:click={submit}>Submit</button>
    </div>

  </div>
</div>

<style lang="scss">

  .dialog-footer{
    display: flex;
    justify-content: flex-end;
    padding: 1rem;

  }

</style>
