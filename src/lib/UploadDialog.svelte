<script lang="ts">

  import { createEventDispatcher, onMount } from "svelte";
  import { firestoreManager } from "../scripts/firebase/firebaseManager";
  import { firebaseUser } from "../scripts/firebase/firebaseManager.js";

  const dispatch = createEventDispatcher();
  const close = () => {
    if (uploading) return;
    dispatch('close');
  }

  let dragAndDropElement: HTMLElement;
  let filesToUpload: File[] = []
  let dragAndDropActive = false;
  let uploading = false;
  let uploadProgress = 0;
  let finishedUploading = false;

  const upload = (files: FileList) => {
    if (uploading) return;
    filesToUpload = [...filesToUpload, ...Array.from(files)]
  }

  const startUpload = async () => {
    uploading = true;

    await firestoreManager.uploadImages($firebaseUser, filesToUpload, (progress) => {
      uploadProgress = progress;
    });

    finishedUploading = true;
    uploading = false;
    setTimeout(() => {
      close();
    }, 1000);
  }

  onMount(() => {
    dragAndDropElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    dragAndDropElement.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragAndDropActive = true;
    });
    dragAndDropElement.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragAndDropActive = false;
    });
    dragAndDropElement.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragAndDropActive = false;
      upload(e.dataTransfer.files);
    });
  })


</script>

<div class="blur-background">
  <div class="dialog">
    <div class="dialog-header">
      <h3>Upload images</h3>
      <button class="material close-btn" on:click={close}>
        <span class="material-icons">close</span>
      </button>
    </div>
    <div bind:this={dragAndDropElement} class="dialog-content">
      {#if finishedUploading}
        <div class="finished-uploading">
          <span class="material-icons">check_circle</span>
          <h3>Finished uploading</h3>
        </div>
      {/if}

      <label class="drag-and-drop-area" for="upload">
        {#if dragAndDropActive}
          Drop files here
        {:else}
          Drag and drop files here or click to upload
        {/if}
      </label>
      <input accept="image/*" hidden id="upload" multiple on:change={e => upload(e.target.files)} type="file"/>

      <div class="selected-files">
        {filesToUpload.length} files selected
        <div class="preview">
          {#each filesToUpload as file}
            <div class="preview-item">
              <img loading="lazy" src={URL.createObjectURL(file)} alt=""/>
              <div class="preview-item-actions">
                <button class="clear" on:click={() => filesToUpload = filesToUpload.filter(f => f !== file)}>
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      {#if filesToUpload.length > 0 && !uploading}

        <div class="upload-button-area">
          <button class="material text-button" on:click={startUpload}>
            Upload

            <span class="material-icons">upload</span>
          </button>
        </div>
      {:else if uploading}
        <div class="upload-button-area">
          <button class="material text-button" disabled>
            Uploading {(uploadProgress * 100).toFixed(2)}%
          </button>
        </div>
      {/if}

    </div>

  </div>
</div>

<style>

  .dialog-content {
    position: relative;
    margin: 10px;
    width: 80%;
  }

  .drag-and-drop-area {
    border: 1px dashed #ccc;
    padding: 1rem;
    text-align: center;
    margin-bottom: 1rem;
    cursor: pointer;
  }

  .selected-files {
    margin-bottom: 1rem;
    text-align: left;

    color: #cccccc;
  }

  .preview {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .preview-item {
    display: inline-block;
    position: relative;
    margin: 0.5rem;

    width: 100px;
    height: 100px;

  }

  .preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 5px;
  }

  .preview-item-actions {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .preview-item-actions button {
    width: 100%;
    height: 100%;
  }

  .preview-item-actions:hover {
    opacity: 1;
  }

  .upload-button-area {
    text-align: right;
    display: flex;
    justify-content: flex-end;

  }

  .upload-button-area button {
    padding: 0.5rem 1rem;
    background-color: #646cff;
  }

  .finished-uploading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    margin: 10px;
    border: 1px solid #1cb230;
    color: white;
    border-radius: 5px;
  }

  .finished-uploading h3 {
    margin-left: 1rem;
    margin-top: 0;
  }

</style>
