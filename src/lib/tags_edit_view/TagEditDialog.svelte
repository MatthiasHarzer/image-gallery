<script lang="ts">

  import type Tag from "../../scripts/gallery/tag";
  import {createEventDispatcher, onMount} from "svelte";
  import Dialog from "../components/Dialog.svelte";

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

<Dialog on:close>
      <h3 slot="title">Edit Tag</h3>

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

      <div class="footer">
        <button class="material text-button submit-btn" on:click={submit}>Submit</button>
      </div>

    </div>
  {/if}

</Dialog>


<style lang="scss">

  .footer{
    display: flex;
    justify-content: center;
    padding: 1rem;

    .submit-btn{
      width: 100%;
      background-color: var(--primary-color);
    }
  }

</style>
