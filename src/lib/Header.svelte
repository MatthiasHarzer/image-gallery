<script lang="ts">

  import { firebaseUser } from "../scripts/firebase/firebaseManager";
  import { auth, authProvider } from "../scripts/firebase/firebase";
  import { signInWithPopup, signOut } from "firebase/auth";
  import UploadDialog from "./UploadDialog.svelte";
  import { localConfig } from "../scripts/localConfig";

  $: signedId = $firebaseUser != null;
  let uploadDialog = false;

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

  const toggleNav = () =>{
    $localConfig.navOpen = !$localConfig.navOpen;
  }
</script>

<div class="main">
  <button class="material toggle-nav" on:click={toggleNav}>
    <span class="material-icons" >
      menu
    </span>
  </button>
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

  button.toggle-nav{
    margin-left: 15px;
  }

  button.sign-in-out-btn {
    border: 1px solid #12436b;
  }

</style>
