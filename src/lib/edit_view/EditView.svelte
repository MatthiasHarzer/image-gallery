<script lang="ts">

  import {firebaseUser, firestoreManager, gallery} from "../../scripts/firebase/firebaseManager";
  import type Image from "../../scripts/gallery/image";
  import SelectImagesView from "../components/SelectImagesView.svelte";
  import FlipSlider from "../util/FlipSlider.svelte";
  import type Tag from "../../scripts/gallery/tag";
  import TagSelectInput from "../fullscreen/TagSelectInput.svelte";

  let images: Image[] = [];
  let albumImagesStore;
  $: {
    if (filter.album && albumImagesStore) {
      images = $albumImagesStore;
    } else {
      images = $gallery.images;
    }
  }

  $: if (filter.album) albumImagesStore = $gallery.listener.getAlbumImageStore(filter.album, filter.includeSubAlbums);

  const filter = {
    album: null,
    includeSubAlbums: false
  }

  let tagsToAdd: Tag[] = [];

  const onAddTag = ({detail: tag}: CustomEvent<Tag>) => {
    console.log(tag);
    if (tagsToAdd.includes(tag)) return;
    tagsToAdd = [...tagsToAdd, tag];
  }

  const removeTag = (tag: Tag) => {
    tagsToAdd = tagsToAdd.filter(t => t !== tag);
  }

  let working = false;
  const submit = async  () =>{
    if (working || tagsToAdd.length <= 0) return;
    working = true;

    selectedImages.forEach(i => i.tags = [...new Set([...i.tags, ...tagsToAdd])])

    await firestoreManager.updateMultiImages($firebaseUser, selectedImages);

    working = false;

    tagsToAdd = [];
    selectedImages = [];
  }

  const toggleSelectAll = ({detail: selected}: CustomEvent<boolean>) =>{
    if (selected) {
      selectedImages = [...images];
    } else {
      selectedImages = [];
    }
  }

  let selectedImages: Image[] = [];
  let actionAreaCollapsed = false;
  $: allSelected = selectedImages.length === images.length;
</script>

<div class="main">
  <div class="select-area discrete-scrollbar">
    <div class="apply-filter">
      <div class="item select-album">
        <label>By Album</label>
        <select bind:value={filter.album}>
          <option value={null}>All</option>
          {#each $gallery.albums as album}
            <option value={album}>{album.name}</option>
          {/each}
        </select>
      </div>
      <div class="item include-sub-albums">
        <FlipSlider bind:active={filter.includeSubAlbums} id="include-sub-album"/>
        <!--suppress XmlInvalidId -->
        <label for="include-sub-album">Include Sub Albums</label>
      </div>
      <div class="item select-all">
        <FlipSlider on:toggle={toggleSelectAll} id="select-all"/>
        <!--suppress XmlInvalidId -->
        <label for="select-all">Select All</label>
      </div>
    </div>
    <SelectImagesView bind:selectedImages {images} multiple={true}/>
  </div>
  <div class="action-area" class:collapsed={actionAreaCollapsed}>
    <div class="action-area-header" on:click={() => actionAreaCollapsed = false}>
      <h3>{selectedImages.length} images selected</h3>
      <button class="material expand-collapse-btn"
              on:click|stopPropagation={()=>actionAreaCollapsed = !actionAreaCollapsed}>
        <span class="material-icons">
          {actionAreaCollapsed ? "expand_more" : "expand_less"}
        </span>
      </button>
    </div>

    <div class="add-tags">
      <div class="selected-tags">
        {#each tagsToAdd as tag}
          <span class="tag">
            {tag.name}
            <button class="material remove-tag-btn" on:click={()=>removeTag(tag)}>
              <span class="material-icons">
                close
              </span>
            </button>
          </span>
        {/each}
      </div>
      <div class="add-tag">
        <TagSelectInput on:addTag={onAddTag} presentTags={tagsToAdd} />
      </div>
    </div>

    <button class="material text-button submit-btn" on:click={submit}>
      <span class="material-icons">
        done
      </span>
      <span>Submit</span>
    </button>

  </div>

</div>

<style lang="scss">
  .main {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    width: 100%;
    height: 100%;
    overflow-y: hidden;
  }

  .select-area {
    flex: 1;
    overflow-y: auto;
    /*height: auto;*/
    /*display: block;*/
    min-height: min-content;
    height: fit-content;
    padding: 0 15px;
  }

  .action-area {
    flex: 0;
    background-color: #424242;
    height: auto;

    &.collapsed {
      height: 60px;
      //overflow: hidden;
    }

    .action-area-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
      cursor: pointer;
    }

    .expand-collapse-btn {
      background-color: transparent;
      border: none;
      outline: none;
      cursor: pointer;
    }
  }

  .apply-filter {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    flex-wrap: wrap;

    .item {
      margin-right: 10px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      label {
        margin: 0 10px;
      }

      select {
        margin: 0;
      }
    }
  }

  .selected-tags{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;

    .tag{
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      background-color: #646cff;
      padding: 0 0 0 5px;
      border-radius: 5px;
      margin: 5px;

      .remove-tag-btn{
        background-color: transparent;
        border: none;
        outline: none;
        cursor: pointer;

        span{
          font-size: 17px;
        }
      }
    }
  }

  .submit-btn{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
    margin: 10px 10px 10px auto;
    border-radius: 5px;
    background-color: #646cff;
    cursor: pointer;

    span{
      margin: 0 5px;
    }
  }

</style>
