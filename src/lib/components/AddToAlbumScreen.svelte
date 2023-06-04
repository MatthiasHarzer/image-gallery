<script lang="ts">

  import type Image from "../../scripts/gallery/image";
  import { firebaseUser, firestoreManager, gallery } from "../../scripts/firebase/firebaseManager";
  import { createEventDispatcher, onMount } from "svelte";
  import type Album from "../../scripts/gallery/album";

  export let image: Image;

  const dispatch = createEventDispatcher();

  let albums: Album[] = [];

  $: albums = $gallery.albums;

  const close = () => {
    dispatch("close");
  }


  let selectedAlbums: Album[] = [];
  let initialSelectedAlbums: Album[] = [];

  onMount(() => {
    selectedAlbums = albums.filter(album => album.images.includes(image));
    initialSelectedAlbums = [...selectedAlbums];
    console.log(selectedAlbums);
  })

  const submit = async () => {
    const albumsToRemove = initialSelectedAlbums.filter(album => !selectedAlbums.includes(album));

    await Promise.all([
      Promise.all(selectedAlbums.map(album => {
        if (!album.images.includes(image)) {
          album.images = [...album.images, image];
          return firestoreManager.createOrUpdateAlbum($firebaseUser, album);
        }
      }).filter(p => p !== undefined)),

      Promise.all(albumsToRemove.map(album => {
        if (album.images.includes(image)) {
          album.images = album.images.filter(i => i !== image);
          return firestoreManager.createOrUpdateAlbum($firebaseUser, album);
        }
      }).filter(p => p !== undefined))
    ])

    close();
  }


</script>

<div class="blur-background">
  <div class="dialog">
    <div class="dialog-header">
      <h3 class="dialog-title">Add to album</h3>
      <button class="material close-btn" on:click={close}>
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="dialog-content">
      <div class="album-selection">

        {#each albums as album (album.id)}
          <div class="album-item">
            <input type="checkbox" checked={selectedAlbums.includes(album)} on:input={(e)=>{

              if(!e.target.checked){
                selectedAlbums = selectedAlbums.filter(a => a !== album);
              }else{
                selectedAlbums = [...selectedAlbums, album];
              }
            }} id={album.id}/>
            <label for={album.id}>{album.name}</label>
          </div>
        {/each}

      </div>

      <button class="material text-button submit-btn" on:click={submit}>
        <span class="material-icons">check</span>
        <span>Submit</span>
      </button>


    </div>
  </div>
</div>


<style>

  .album-item {
    display: flex;
    align-items: center;

  }

  .album-item input {
    margin-right: 0.5rem;
    margin-bottom: 0;
  }

  .album-item label {
    padding: 0.5rem 0;
    cursor: pointer;
  }


  .submit-btn {
    margin: 1rem auto;
  }

</style>
