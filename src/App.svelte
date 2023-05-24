<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import Header from "./lib/Header.svelte";
  import { gallery } from "./scripts/firebase/firebaseManager";
  import GalleryApp from "./lib/GalleryApp.svelte";

  $: console.log($gallery);
</script>

<main>
    <div class="header">
        <Header />
    </div>
    <div class="app-content">
        <GalleryApp />
    </div>
</main>

<style>
    main{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .header{
        flex: 0;
    }

    .app-content{
        flex: 1;
    }

    .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }

    .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
    }

    .logo.svelte:hover {
        filter: drop-shadow(0 0 2em #ff3e00aa);
    }

    .read-the-docs {
        color: #888;
    }
</style>
