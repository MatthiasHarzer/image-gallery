<script lang="ts">
  import type { TagConfig } from "../../scripts/localConfig";
  import { localConfig, SortMode } from "../../scripts/localConfig";
  import { onMount } from "svelte";
  import type { ScrollObserver } from "../../scripts/util/scrollObserver";
  import { createScrollObserver } from "../../scripts/util/scrollObserver";
  import { Screen } from "../../scripts/screen";
  import { route } from "../../scripts/routeManager";
  import FlipSlider from "../util/FlipSlider.svelte";
  import TagSelectDialog from "../tag_select/TagSelectDialog.svelte";
  import DownloadCachedImagesDialog from "./dialogs/DownloadCachedImagesDialog.svelte";
  import CustomSelect from "./CustomSelect.svelte";

  $: navOpen = $localConfig.navOpen;

  const SPEED_TO_OPEN_CLOSE = 0.8;
  const DISTANCE_TO_OPEN_CLOSE = 100;
  const NAV_WIDTH = 300;

  let scrollObserver: ScrollObserver;
  let tagSelectOpen = false;
  let downloadDialogOpen = false;

  onMount(() => {
    scrollObserver = createScrollObserver(document.body, {
      uniDirectional: true,
      disablePointerSupport: true,
    });

    scrollObserver.onScrollEnd(([dx], [speedX], _) => {
      if (speedX > SPEED_TO_OPEN_CLOSE || dx > DISTANCE_TO_OPEN_CLOSE) {
        $localConfig.navOpen = true;
      } else if (
        speedX < -SPEED_TO_OPEN_CLOSE ||
        dx < -DISTANCE_TO_OPEN_CLOSE
      ) {
        $localConfig.navOpen = false;
      }
    });
  });

  $: offset = navOpen
    ? Math.min(($scrollObserver?.deltaX ?? 0) + NAV_WIDTH, NAV_WIDTH)
    : Math.min($scrollObserver?.deltaX ?? 0, NAV_WIDTH);

  $: sliding = $scrollObserver?.direction != null;
  $: noTouch = $scrollObserver?.deltaY !== 0;

  // $: if (scrollObserver) console.log($scrollObserver);
  // $: console.log(offset)

  const close = () => {
    $localConfig.navOpen = false;
  };

  const enterPage = (screen: Screen) => {
    // close();
    route.setScreen(screen);
  };

  const submitTags = ({ detail: tagConfig }: CustomEvent<TagConfig>) => {
    $localConfig.tagConfig = tagConfig;
    tagSelectOpen = false;
  };

  const pages = [
    {
      name: "Gallery",
      icon: "photo",
      screen: Screen.GALLERY,
    },
    {
      name: "Albums",
      icon: "photo_library",
      screen: Screen.ALBUMS,
    },
    {
      name: "Edit",
      icon: "edit",
      screen: Screen.EDIT,
    },
    {
      name: "Tags",
      icon: "label",
      screen: Screen.TAGS,
    },
  ];

  const cycleSortMode = () => {
    const current = $localConfig.sortMode;

    switch (current) {
      case SortMode.DATE_ASC:
        $localConfig.sortMode = SortMode.DATE_DESC;
        break;
      case SortMode.DATE_DESC:
        $localConfig.sortMode = SortMode.RANDOM;
        break;
      case SortMode.RANDOM:
        $localConfig.sortMode = SortMode.AUTO;
        break;
      case SortMode.AUTO:
        $localConfig.sortMode = SortMode.DATE_ASC;
        break;
    }
  };

  const shuffle = () => {
    $localConfig.randomSeed = Date.now();
  };

  const sortModeOptions = [
    {
      name: "Sort by date (asc)",
      value: SortMode.DATE_ASC,
    },
    {
      name: "Sort by date (desc)",
      value: SortMode.DATE_DESC,
    },
    {
      name: "Random",
      value: SortMode.RANDOM,
    },
    {
      name: "Auto",
      value: SortMode.AUTO,
    },
  ];

  let sortModeLabel: string;
  $: {
    switch ($localConfig.sortMode) {
      case SortMode.DATE_ASC:
        sortModeLabel = "Sort by date (asc)";
        break;
      case SortMode.DATE_DESC:
        sortModeLabel = "Sort by date (desc)";
        break;
      case SortMode.RANDOM:
        sortModeLabel = "Random";
        break;
      case SortMode.AUTO:
        sortModeLabel = "Auto";
        break;
    }
  }
</script>

<div
  class="main"
  class:open={navOpen}
  on:click|self|stopPropagation={close}
  style="--width: {NAV_WIDTH}px;--offset: {offset}px;"
  role="button"
  tabindex="0"
  on:keydown={close}
>
  <div class="background" style="--opacity: {offset / NAV_WIDTH};"></div>
  <div class="nav" class:no-animation={sliding}>
    <div class="button-bar">
      <button class="material close-btn" on:click={close}>
        <span class="material-icons">close</span>
      </button>

      <button
        class="material download-btn"
        on:click={() => (downloadDialogOpen = true)}
      >
        <span class="material-icons">download</span>
      </button>
    </div>

    <div class="page-selection">
      {#each pages as page}
        <button
          class="material text-button"
          on:click={() => enterPage(page.screen)}
          class:active={$route.screen === page.screen}
        >
          <span class="material-icons">{page.icon}</span>
          <span>{page.name}</span>
        </button>
      {/each}
    </div>
    <hr />

    <div class="filters group">
      <h5 class="group-header">FILTERS</h5>
      <!--suppress XmlInvalidId -->
      <label class="full-width-item toggle-option ripple" for="fav-only">
        <FlipSlider bind:active={$localConfig.favoritesOnly} id="fav-only" />
        Show favorites only
      </label>
      <!--suppress XmlInvalidId -->
      <label class="full-width-item ripple" for="tags-enabled">
        <FlipSlider
          bind:active={$localConfig.tagConfig.enabled}
          id="tags-enabled"
        />
        Filter by tags
      </label>
      <div class="full-width-item">
        <!--suppress HtmlWrongAttributeValue -->
        <button
          class="full-width-item material text-button select-tags-btn"
          disabled={!$localConfig.tagConfig.enabled}
          on:click={() => (tagSelectOpen = true)}
        >
          <span class="material-icons">label</span>
          Select Tags
        </button>
      </div>
    </div>
    <hr />
    <div class="group">
      <h5 class="group-header">SORTING</h5>
      <div class="sort-mode-button-wrapper">
        <CustomSelect
          options={sortModeOptions}
          bind:value={$localConfig.sortMode}
        />

        <!--        <button-->
        <!--          class="material text-button sort-mode-btn"-->
        <!--          on:click={cycleSortMode}-->
        <!--        >-->
        <!--          <span class="material-icons">sort</span>-->
        <!--          {sortModeLabel}-->
        <!--        </button>-->
        {#if $localConfig.sortMode === SortMode.RANDOM}
          <button class="material" on:click={shuffle}>
            <span class="material-icons">shuffle</span>
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

{#if tagSelectOpen}
  <TagSelectDialog
    on:close={() => (tagSelectOpen = false)}
    on:submit={submitTags}
    tagConfig={{ ...$localConfig.tagConfig }}
  />
{/if}

{#if downloadDialogOpen}
  <DownloadCachedImagesDialog on:close={() => (downloadDialogOpen = false)} />
{/if}

<style lang="scss">
  .main {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    //background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    background-color: rgba(0, 0, 0, calc((var(--offset) / var(--width)) * 0.5));

    .background {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: var(--opacity);
      transition: opacity 0.1s linear;
    }
  }

  .open {
    //background-color: rgba(0, 0, 0, 0.5);
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

  .drag-bar {
    position: absolute;
    top: 0;
    right: 0;
    pointer-events: all;
    //transform: translateX(100%);
    //right: -17px;
    width: 100vw;
    height: 100vh;
    background-color: transparent;

    &.no-touch {
      pointer-events: none;
    }
  }

  .button-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .close-btn {
      position: relative;
      top: 5px;
      left: 10px;
    }

    .download-btn {
      position: relative;
      top: 5px;
      right: 10px;
    }
  }

  .page-selection {
    position: relative;
    box-sizing: border-box;
    padding: 0 10px 0 0;
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
    border-radius: 0 100px 100px 0;
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

  .select-tags-btn {
    /*background-color: #5e5e5e;*/
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
  }

  .select-tags-btn:disabled {
    color: #a2a2a2;
    box-shadow: none;
  }

  .select-tags-btn:disabled span {
    color: #a2a2a2;
  }

  .group-header {
    color: #c5c5c5;
    font-size: 14px;
    font-weight: 500;
    margin: 0 20px;
  }

  .sort-mode-button-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 20px;
    padding: 10px 0;
  }

  .sort-mode-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #2f2f2f;
    box-shadow: 2px 2px 5px 0 rgba(0, 0, 0, 0.5);
  }

  .sort-mode-btn span {
    margin-right: 15px;
  }
</style>
