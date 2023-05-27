<script lang="ts">

  import { firebaseUser } from "../scripts/firebase/firebaseManager";
  import { auth, authProvider } from "../scripts/firebase/firebase";
  import { signInWithPopup, signOut } from "firebase/auth";
  import UploadDialog from "./UploadDialog.svelte";
  import { localConfig } from "../scripts/localConfig";
  import { Screen } from "../scripts/screen";
  import { createEventDispatcher } from "svelte";


  $: signedId = $firebaseUser != null;

  let uploadDialog = false;

  const dispatch = createEventDispatcher();

  const signInOut = () => {
    if (signedId) {
      signOut(auth);
    } else {
      signInWithPopup(auth, authProvider)
    }
  }

  const upload = () => {
    uploadDialog = true;
  }

  const toggleNav = () => {
    $localConfig.navOpen = !$localConfig.navOpen;
  }

  const enterScreen = (screen: Screen) => {
    $localConfig.currentScreen = screen;
  }

  const screens = [
    {
      screen: Screen.GALLERY,
      name: "Gallery"
    },
    {
      screen: Screen.ALBUMS,
      name: "Albums"
    }
  ]
</script>

<div class="main">
  <div class="navigation">

    <button class="material toggle-nav" on:click={toggleNav}>
    <span class="material-icons">
      menu
    </span>
    </button>
    <div class="drop-down box-shadow"
         style="--num-items: 2;">

      {#each screens as {screen, name}}
        <button class="material text-button drop-down-item"
                class:active={screen === $localConfig.currentScreen}
                on:click={_=>enterScreen(screen)}>
          <span class="name">
            {name}
          </span>

        </button>
      {/each}
    </div>
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
  <div class="auth-section">
    <button class="sign-in-out-btn material text-button" on:click={signInOut}>
      {signedId ? "Sign out" : "Sign in"}
    </button>
  </div>
</div>

{#if uploadDialog}
  <UploadDialog on:close={()=>uploadDialog = false}/>
{/if}

<style>
  .main {
    width: 100%;
    height: 100%;
    background-color: #2c2c2c;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .auth-section {
    margin-left: auto;
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

  .navigation{
    position: relative;
  }

  .navigation button {
    pointer-events: all;
  }

  .navigation:not(:focus-within) .drop-down {
    height: 0;
  }

  .drop-down {
    pointer-events: all;
    position: absolute;
    top: 35px;
    left: 20px;
    width: 190px;

    background-color: rgba(91, 91, 91, 0.99);
    padding: 0;

    height: calc(var(--num-items) * 35px);

    display: flex;
    flex-direction: column;
    border-radius: 8px;

    overflow: hidden;
    z-index: 1;

    transition: height 0.2s ease-in-out;

  }

  .drop-down.collapsed {
    height: 0 !important;
  }

  .drop-down .drop-down-item{

    width: auto;
    height: 35px;
    padding: 0 10px;
    margin: 3px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border: none;
    background-color: transparent;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }

  .drop-down .drop-down-item.active {
    background-color: #12436b;
  }



</style>
