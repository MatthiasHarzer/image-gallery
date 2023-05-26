<script lang="ts">

  import Album from "../../scripts/gallery/album";
  import CreateOrEditAlbumDialog from "./CreateOrEditAlbumDialog.svelte";
  import { firebaseUser, firestoreManager, gallery } from "../../scripts/firebase/firebaseManager";
  import SubAlbumsView from "./SubAlbumsView.svelte";
  import AlbumTreeBar from "./AlbumTreeBar.svelte";


  let createOrEditAlbumDialogShown = false;
  let albumToEdit: Album | null = null;
  let selectedAlbum: Album | null = null;
  let albumTree: Album[] = [];
  const onNewOrEditAlbum = ({ detail: album }) => {
    if (! (album instanceof Album)) {
      album = Album.dummy();
      album.parent = selectedAlbum;
    }

    albumToEdit = album;
    createOrEditAlbumDialogShown = true;
  }

  const isSelfParent = (parent: Album, self: Album) => {
    if (parent == null) return false;
    return parent.id === self.id || isSelfParent(parent.parent, self);
  }

  const getRootAlbums = (albums: Album[]) => {
    return albums.filter(a => a.parent == null || isSelfParent(a.parent, a));
  }

  $: rootAlbum = Album.root($gallery.images, getRootAlbums($gallery.albums));
  $: openedAlbum = selectedAlbum || rootAlbum;

  const submitAlbum = async ({ detail: album }: CustomEvent<Album>) => {
    const isEdit = album.id != null;

    const isValid = album.name != null && album.name.length > 0;
    if (!isValid) return;

    if (isEdit) {
      await firestoreManager.updateAlbum($firebaseUser, album);
    } else {
      await firestoreManager.createAlbum($firebaseUser, album);
    }

    createOrEditAlbumDialogShown = false;
  }

  const openAlbum = ({ detail: album }) => {
    selectedAlbum = album;
    albumTree = [...albumTree, album];
  }

  const moveBackOne = () => {
    if (albumTree.length > 0) {
      albumTree = albumTree.slice(0, albumTree.length - 1);
      selectedAlbum = albumTree[albumTree.length - 1];
    }
  }

  const albumSkip = ({ detail: index }) => {
    if (index == null || index >= albumTree.length) return;

    albumTree = albumTree.slice(0, index + 1);
    selectedAlbum = albumTree[albumTree.length - 1];
  }

  $: {
    $gallery;
    albumTree = albumTree;
  }

  // $: console.log(openedAlbum);
</script>

<div class="main">
  <div class="header-nav-bar">
    <div class="album-nav">

      {#if albumTree.length > 0}
        <button class="material" on:click={moveBackOne}>
          <span class="material-icons">arrow_back</span>
        </button>

        <AlbumTreeBar albums={albumTree} on:albumSkip={albumSkip}/>
      {/if}
    </div>

    <button class="material text-button add-album" on:click={onNewOrEditAlbum}>
      <span class="material-icons">add</span>
      <span class="text">New Album</span>
    </button>
  </div>

  <div class="sub-album-views">
    <SubAlbumsView album={openedAlbum}
                   on:newOrEdit={onNewOrEditAlbum}
                   on:open={openAlbum}
    />
  </div>

</div>

{#if createOrEditAlbumDialogShown}
  <CreateOrEditAlbumDialog
      album={albumToEdit}
      on:close={() => createOrEditAlbumDialogShown = false}
      on:submit={submitAlbum}
  />
{/if}

<style>

  .main {
    position: relative;
  }

  /*.add-album {*/
  /*  position: absolute;*/
  /*  top: 10px;*/
  /*  right: 0;*/
  /*}*/


  .header-nav-bar {
    height: 50px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 5px 15px;
    display: flex;
    /*width: 500px;*/
    position: relative;
    overflow: hidden;
  }

  .album-nav{
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .add-album{
    position: relative;
    flex: 0;
  }

  .add-album span{
    white-space: nowrap;
  }




</style>
