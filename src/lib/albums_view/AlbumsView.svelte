<script lang="ts">

  import Album from "../../scripts/gallery/album";
  import CreateOrEditAlbumDialog from "./CreateOrEditAlbumDialog.svelte";
  import { firebaseUser, firestoreManager, gallery } from "../../scripts/firebase/firebaseManager";
  import SubAlbumsView from "./SubAlbumsView.svelte";
  import AlbumTreeBar from "./AlbumTreeBar.svelte";
  import { route } from "../../scripts/routeManager";
  import { rootAlbum } from "../../scripts/rootAlbum";


  let createOrEditAlbumDialogShown = false;
  let albumToEdit: Album | null = null;
  // let albumTree: Album[] = [];

  $: selectedAlbum = $route.albums.length > 0 ? $route.albums[$route.albums.length - 1] : null;
  $: openedAlbum = selectedAlbum || $rootAlbum;

  const onNewOrEditAlbum = ({ detail: album }) => {
    if (!(album instanceof Album)) {
      album = Album.dummy();
      album.parent = selectedAlbum;
    }

    albumToEdit = album;
    createOrEditAlbumDialogShown = true;
  }



  const submitAlbum = async ({ detail: album }: CustomEvent<Album>) => {

    const isValid = album.name != null && album.name.length > 0;
    if (!isValid) return;


    await firestoreManager.createOrUpdateAlbum($firebaseUser, album);


    createOrEditAlbumDialogShown = false;
  }

  const deleteAlbum = async ({ detail: album }: CustomEvent<Album>): Promise<void> => {
    if (album.id == null) return;

    const conf = confirm(`Are you sure you want to delete album "${album.name}"?`);

    if (!conf) return;

    await firestoreManager.deleteAlbum($firebaseUser, album);
    createOrEditAlbumDialogShown = false;
  }

  const openAlbum = ({ detail: album }) => {
    route.addAlbum(album)
  }

  const moveBackOne = () => {
    route.popAlbum();
  }

  const albumSkip = ({ detail: index }) => {
    if (index == null || index >= $route.albums.length) return;

    const albums = $route.albums.slice(0, index + 1);

    route.setAlbums(albums);
  }

  $: {
    $gallery;
    // albumTree = albumTree;
  }

  // $: console.log(selectedAlbum, openedAlbum);
</script>

<div class="main">
  <div class="header-nav-bar">
    <div class="album-nav">

      {#if $route.albums.length > 0}
        <button class="material move-back-btn" on:click={moveBackOne}>
          <span class="material-icons">arrow_back</span>
        </button>

        <AlbumTreeBar albums={$route.albums}
                      on:albumSkip={albumSkip}
                      on:albumEdit={onNewOrEditAlbum}
        />
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
      on:delete={deleteAlbum}
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

  .album-nav {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .album-nav .move-back-btn{
    margin-left: 5px;
  }

  .add-album {
    position: relative;
    flex: 0;
  }

  .add-album span {
    white-space: nowrap;
  }


</style>
