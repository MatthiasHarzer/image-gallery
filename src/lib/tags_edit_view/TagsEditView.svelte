<script lang="ts">

  import {firebaseUser, firestoreManager, gallery} from "../../scripts/firebase/firebaseManager";
  import type Tag from "../../scripts/gallery/tag";
  import TagItem from "./TagItem.svelte";
  import TagEditDialog from "./TagEditDialog.svelte";

  let tags: Tag[];

  $: tags = $gallery.tags;

  let editingTag: Tag | null = null;

  const openEdit = ({detail: tag}: CustomEvent<Tag>) => {
    editingTag = tag;
  }

  const onDelete = ({detail: tag}: CustomEvent<Tag>) => {
    const confirm = window.confirm(`Are you sure you want to delete the tag "${tag.name}"?`);

    if (!confirm) return;

    firestoreManager.deleteTag($firebaseUser, tag)
  }

  const submitEdit = ({detail: tag}: CustomEvent<Tag>) => {
    firestoreManager.updateTag($firebaseUser, tag)
    editingTag = null;
  }

  // $: if($gallery.tags.length > 0){
  // editingTag = $gallery.tags[0];
  //
  // }


</script>

<div class="main">

  {#each tags as tag (tag.id)}
    <TagItem {tag} on:edit={openEdit} on:delete={onDelete}  />
  {/each}

</div>

{#if editingTag}
  <TagEditDialog tag={editingTag} on:close={()=>editingTag = null} on:submit={submitEdit} />
{/if}

<style lang="scss">

  .main{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    padding: 1rem;
  }

</style>
