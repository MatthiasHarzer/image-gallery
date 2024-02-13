<script lang="ts">
  import isMobile from "../../scripts/util/isMobile";
  import { onMount } from "svelte";

  interface Item {
    name: string;
    value: any;
  }

  export let icon: string = "arrow_drop_down";
  export let options: Item[];
  export let value: any | null = null;
  export let animateIcon: boolean = false;

  let expanded = false;
  let itemHeight: number = 0;

  $: selected = options.find((option) => option.value === value);

  const toggle = () => {
    expanded = !expanded;
  };

  const select = (option: Item) => {
    value = option.value;
    expanded = false;
  };

  $: contentHeight = itemHeight * options.length;

  onMount(() => {
    const hideIfClickedOutside = (e: MouseEvent) => {
      if (expanded) {
        const target = e.target as HTMLElement;
        if (
          !target.closest(".drop-down-options") &&
          !target.closest(".drop-down-button")
        ) {
          expanded = false;
        }
      }
    };

    document.addEventListener("click", hideIfClickedOutside);

    return () => {
      document.removeEventListener("click", hideIfClickedOutside);
    };
  });
</script>

<div class="main" class:expanded class:animate-icon={animateIcon}>
  {#if isMobile}
    <select id="select" name="select" bind:value class="drop-down-button">
      {#each options as option (option.value)}
        <option value={option.value}>{option.name}</option>
      {/each}
    </select>
  {:else}
    <button class="material text-button drop-down-button" on:click={toggle}>
      {#if icon}
        <span class="material-icons-outlined">
          {icon}
        </span>
      {/if}
      <div class="label">
        <span class="material text-button__label">
          {selected ? selected.name : "Select"}
        </span>
        <div class="ghost-labels">
          {#each options as option (option.value)}
            <span class="ghost-label">{option.name}</span>
          {/each}
        </div>
      </div>
    </button>

    <div class="drop-down-options" style="--content-height: {contentHeight}px;">
      <div class="animation-content">
        {#each options as option (option.value)}
          <button
            class="material text-button option"
            on:click={() => select(option)}
            bind:clientHeight={itemHeight}
          >
            {option.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .main {
    position: relative;
    width: 100%;
  }
  .label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .ghost-labels {
    height: 0;
    overflow: hidden;
    //opacity: 0;
    //position: absolute;
  }
  .drop-down-button {
    width: 100%;
    padding: 5px 20px 5px 5px !important;
    background-color: #212121;
    box-shadow: 2px 2px 5px 0 rgba(0, 0, 0, 0.62);
    border-radius: 5px;
    border: none;

    .material-icons-outlined {
      transition: transform 0.2s ease-in-out;
    }
  }
  .drop-down-options {
    position: absolute;
    width: 100%;
    top: 100%;
    left: 0;
    flex-direction: column;
    background-color: #343434;
    box-shadow: 2px 2px 5px 0 rgba(0, 0, 0, 0.62);
    overflow: hidden;
    border-radius: 5px;

    .animation-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.2s ease-in-out;
      position: relative;
      top: 0;
    }

    .option {
      width: 100%;
      justify-content: start;
    }
  }

  .expanded {
    .drop-down-options {
      .animation-content {
        max-height: var(--content-height);
        transition: max-height 0.2s ease-in-out;
      }
    }

    &.animate-icon {
      .material-icons-outlined {
        transform: rotate(180deg);
      }
    }
  }
</style>
