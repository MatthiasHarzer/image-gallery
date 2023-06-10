<script lang="ts">

  import type Tag from "../../scripts/gallery/tag";
  import type { TagConfig } from "../../scripts/localConfig";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let tag: Tag;
  export let tagConfig: TagConfig;

  $: included = tagConfig.includedTags.includes(tag.id);
  $: excluded = tagConfig.excludedTags.includes(tag.id);

  const toggle = () =>{
    dispatch("toggle", tag.id);
  }

</script>

<button class="main clear excluded" class:included class:excluded on:click={toggle}>
  {tag.name} <span class="count">({tag.count})</span>
</button>

<style>
  .main{
    background-color: #2c2c2c;
    flex: 1 0 auto;
    display: inline-block;
    padding: 5px 13px;
    margin: 2px 0;
    /*border-radius: 0.5rem;*/
    /*margin: 0.5rem 0;*/
    color: #8d8d8d;
    text-align: center;
    cursor: pointer;
    border: 1px solid #8d8d8d;
    border-radius: 15px;
  }

  .main.included, .main.excluded{
    color: #fff;
  }

  .main.included{
    background-color: #2bab54;
  }

  .main.excluded{
    background-color: #ab2b2b;
  }

  .main:hover:not(.included):not(.excluded){
    background-color: #3c3c3c;
  }

  .count{
    font-size: 0.8em;
    color: #8d8d8d;
  }

  .main.included .count, .main.excluded .count{
    color: #fff;
  }

</style>
