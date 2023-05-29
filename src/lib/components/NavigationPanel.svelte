<!--suppress ALL -->
<script lang="ts">

  import { localConfig } from "../../scripts/localConfig";
  import { onMount } from "svelte";
  import type { ScrollObserver } from "../../scripts/util/scrollObserver";
  import { createScrollObserver } from "../../scripts/util/scrollObserver";
  import { Screen } from "../../scripts/screen";
  import { route } from "../../scripts/routeManager";
  import FlipSlider from "../util/FlipSlider.svelte";
  import TagSelectDialog from "../tag_select/TagSelectDialog.svelte";

  $: navOpen = $localConfig.navOpen

  // $localConfig.navOpen = true;

  const SPEED_TO_OPEN_CLOSE = 0.8;
  const DISTANCE_TO_OPEN_CLOSE = 100;
  const NAV_WIDTH = 300;

  let dragBar: HTMLElement;
  let scrollObserver: ScrollObserver;
  let tagSelectOpen = false;

  onMount(() => {
    scrollObserver = createScrollObserver(dragBar, { uniDirectional: true, disablePointerSupport: true });

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

  // $: console.log(offset)

  const close = () => {
    $localConfig.navOpen = false
  }

  const enterPage = (screen: Screen) => {
    // close();
    route.setScreen(screen);
  }

  const submitTags = ({detail: tagConfig}: CustomEvent<TagConfig>) => {
    $localConfig.tagConfig = tagConfig;
    tagSelectOpen = false;
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

  // $: console.log($localConfig.tagConfig)
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
    <hr/>

    <div class="filters">

      <label class="full-width-item toggle-option ripple" for="fav-only">
        <FlipSlider bind:active={$localConfig.favoritesOnly} id="fav-only"/>
        Show favorites only
      </label>
      <label class="full-width-item ripple" for="tags-enabled">
        <FlipSlider bind:active={$localConfig.tagConfig.enabled} id="tags-enabled" />
        Filter by tags
      </label>
      <div class="full-width-item">
        <button class="full-width-item material text-button select-tags-btn"
                disabled={!$localConfig.tagConfig.enabled}
                on:click={()=>tagSelectOpen = true}
        >
          <span class="material-icons">label</span>
          Select Tags
        </button>
      </div>

    </div>


    <div bind:this={dragBar} class="drag-bar"></div>
  </div>
</div>

{#if tagSelectOpen}
  <TagSelectDialog on:close={()=>tagSelectOpen = false}
                   on:submit={submitTags}
                   tagConfig={{...$localConfig.tagConfig}}/>
{/if}

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
    right: -17px;
    width: 17px;
    height: 100%;
    background-color: transparent;
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
    border-radius: 100px;
    margin: 2px 0;
  }

  hr {
    border: none;
    height: 1px;
    background-color: #a2a2a2;
    margin: 10px 0;
  }

  .page-selection button.material .material-icons {
    margin-right: 10px;
  }

  .page-selection button.material.active {
    background-color: #646cff;

  }

  .filters {
    margin-top: 20px;
  }



  .full-width-item {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    width: 100%;
    font-size: 20px;
    font-weight: 400;
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    user-select: none;
  }

  .full-width-item:active {
    /*background-color: #858585;*/
  }

  .select-tags-btn:disabled{
    color: #a2a2a2;
  }
  .select-tags-btn:disabled span {
    color: #a2a2a2;
  }





</style>
