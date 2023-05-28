<script lang="ts">

  import { localConfig } from "../../scripts/localConfig";
  import { onMount } from "svelte";
  import type { ScrollObserver } from "../../scripts/util/scrollObserver";
  import { createScrollObserver } from "../../scripts/util/scrollObserver";
  import { Screen } from "../../scripts/screen";
  import { route } from "../../scripts/routeManager";

  $: navOpen = $localConfig.navOpen

  const SPEED_TO_OPEN_CLOSE = 0.8;
  const DISTANCE_TO_OPEN_CLOSE = 100;
  const NAV_WIDTH = 300;

  let dragBar: HTMLElement;
  let scrollObserver: ScrollObserver;

  onMount(() => {
    scrollObserver = createScrollObserver(dragBar, { uniDirectional: true });

    scrollObserver.onScrollEnd(([dx, dy], [speedX, speedY], _) => {
      const speed = Math.abs(speedX);
      const distance = Math.abs(dx);

      if (speed > SPEED_TO_OPEN_CLOSE || distance > DISTANCE_TO_OPEN_CLOSE) {
        $localConfig.navOpen = !navOpen;
      }
    });
  });

  $: offset = Math.min($scrollObserver?.deltaX || 0, NAV_WIDTH);
  $: sliding = $scrollObserver?.direction != null;

  const close = () => {
    $localConfig.navOpen = false
  }

  const enterPage = (screen: Screen) => {
    // close();
    route.setScreen(screen);
  }

  const pages = [
    {
      name: "Gallery",
      icon: "photo",
      screen: Screen.GALLERY
    },
    {
      name: "Albums",
      icon: "photo_library",
      screen: Screen.ALBUMS
    }
  ]
</script>

<div class="main" class:open={navOpen} on:click|self|stopPropagation={close} style="--width: {NAV_WIDTH}px;">
  <div class="nav" class:no-animation={sliding} style="--offset: {offset}px;">
    <button class="material close-btn" on:click={close}>
      <span class="material-icons">close</span>
    </button>

    <div class="page-selection">
      {#each pages as page}
        <button class="material text-button" on:click={() => enterPage(page.screen)}
                class:active={$route.screen === page.screen}>
          <span class="material-icons">{page.icon}</span>
          <span>{page.name}</span>
        </button>
      {/each}
    </div>


    <div bind:this={dragBar} class="drag-bar"></div>
  </div>
</div>

<style>

  .main {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
  }

  .open {
    background-color: rgba(0, 0, 0, 0.5);
    pointer-events: all;
  }

  .nav {
    position: absolute;
    top: 0;
    left: calc(var(--width) * -1 + var(--offset));
    width: var(--width);
    height: 100%;
    background-color: #414141;
    pointer-events: all;
    transition: all 0.3s ease-in-out;
  }

  .nav.no-animation {
    transition: none;
  }

  .open .nav {
    left: var(--offset);
  }

  .nav .drag-bar {
    position: absolute;
    top: 0;
    right: -20px;
    width: 20px;
    height: 100%;
    background-color: transparent;
    cursor: ew-resize;
  }

  .close-btn {
    position: relative;
    top: 5px;
    left: 10px;
  }

  .page-selection {

    position: relative;
    box-sizing: border-box;
    padding: 0 10px;

  }

  .page-selection button.material {
    width: 100%;
    height: 50px;
    background-color: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 20px;
    color: white;
    font-size: 20px;
    font-weight: 500;
    transition: all 0.3s ease-in-out;
  }

  .page-selection button.material .material-icons {
    margin-right: 10px;
  }

  .page-selection button.material.active {
    background-color: #646cff;
    border-radius: 100px;
  }

</style>
