<script lang="ts">

  import {firebaseUser, firestoreManager} from "../scripts/firebase/firebaseManager";
  import {auth, authProvider} from "../scripts/firebase/firebase";
  import {signInWithPopup, signOut} from "firebase/auth";
  import UploadDialog from "./components/dialogs/UploadDialog.svelte";
  import {localConfig} from "../scripts/localConfig";
  import {createEventDispatcher} from "svelte";
  import {route} from "../scripts/routeManager";
  import type Image from "../scripts/gallery/image";
  import SelectImagesDialog from "./components/dialogs/SelectImagesDialog.svelte";
  import {get} from "svelte/store";
  import LoadingSpinner from "./util/LoadingSpinner.svelte";


  $: signedId = $firebaseUser != null;

  let uploadDialog = false;
  let logoutBtnShown = false;
  let contextMenuOpen = false;

  const signInOut = async () => {
    if (signedId) {
      await signOut(auth);
      route.clear();
      window.location.reload();
    } else {
      await signInWithPopup(auth, authProvider)
    }
  }

  const upload = () => {
    uploadDialog = true;
  }

  const toggleNav = () => {
    $localConfig.navOpen = !$localConfig.navOpen;
  }
</script>

<div class="main">
  <div class="navigation">

    <button class="material toggle-nav" on:click={toggleNav}>
    <span class="material-icons">
      menu
    </span>
    </button>
  </div>
  {#if signedId}
    <div class="manage-section">
      <button class="text-button material upload-btn" on:click={upload}>
        Upload
        <span class="material-icons">
            upload
        </span>
      </button>
    </div>
  {/if}
  <div class="auth-section right">
    {#if !signedId}
      <button class="sign-in-out-btn material text-button" on:click={signInOut}>
        Sign in
      </button>
    {:else}
      <div role="button" class="account-btn flex-center" on:click={()=> logoutBtnShown = !logoutBtnShown}>
        <img src={$firebaseUser.photoURL} alt="profile picture" class="profile-picture"/>
        <button class="material text-button logout-btn box-shadow" class:visible={logoutBtnShown} on:click={signInOut}>
          Logout
          <span class="material-icons">
            logout
          </span>
        </button>
      </div>
    {/if}
  </div>
</div>

{#if uploadDialog}
  <UploadDialog
      targetAlbum={$route.album}
      on:close={()=>uploadDialog = false}
  />
{/if}

<style lang="scss">
  .main {
    width: 100%;
    height: 100%;
    background-color: #2c2c2c;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .right {
    margin-left: auto;
  }

  .auth-section {
    display: flex;
    align-items: center;
  }

  .context-menu {
    position: relative;
    margin-right: 10px;

    .drop-down {
      position: absolute;
      top: 100%;
      right: 0;
      /*width: 100%;*/
      border-radius: 0.2em;
      /*padding: 0.5em;*/
      background-color: #424242;
      transition: all 0.2s ease-in-out;
      width: auto;
      z-index: 2;

      pointer-events: none;
      opacity: 0;


      &.open {
        opacity: 1;
        pointer-events: all;
      }

      button {
        width: 100%;
        padding: 0.5em 1.5em;
        margin: 0;
        /*background-color: var(--primary-color);*/
        border-radius: 0.5em;
        border: none;
        outline: none;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        white-space: nowrap;
      }

      button:not(:last-child) {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }

      button:not(:first-child) {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }
    }

  }

  button.text-button {
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    margin: 5px;
  }

  button.toggle-nav {
    margin-left: 15px;
  }

  button.sign-in-out-btn {
    border: 1px solid #12436b;
  }


  .account-btn {
    background-color: transparent;
    border: none;
    outline: none;
    margin: 0 5px;
    cursor: pointer;
    position: relative;


    .logout-btn {
      position: absolute;
      top: 100%;
      right: -130%;
      transform: translate(-50%, 0);
      background-color: #9f2828;
      border: 2px solid #595959;
      color: #fff;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin: 5px;
      display: none;
      z-index: 2;

      flex-wrap: nowrap;
    }

    .logout-btn.visible {
      display: flex;
    }

    .logout-btn span {
      margin-left: 5px;
    }


    img {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      border: 5px double #646cff;
    }

  }



</style>
