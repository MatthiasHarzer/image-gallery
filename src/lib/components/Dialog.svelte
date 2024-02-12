<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let title: string = "";

  const close = () => {
    dispatch("close");
  };

  const closeIfClickOnBackground = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      close();
    }
  };
</script>

<div class="blur-background" on:click={closeIfClickOnBackground}>
  <div class="dialog no-scroll-bar">
    <div class="dialog-header">
      <div class="actions left">
        <slot name="left-action" />
      </div>
      <slot name="title">
        <h3>
          {title}
        </h3>
      </slot>
      <div class="actions right">
        <button class="material" on:click={close}>
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>
    <div class="dialog-body discrete-scrollbar">
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;

    position: absolute;
    top: 5px;

    &.left {
      left: 10px;
    }
    &.right {
      right: 10px;
    }
  }

  .dialog-header {
    margin: 10px 0;
    flex: 0;
  }

  .dialog-body {
    flex: 1;
    overflow: hidden auto;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 10px;
  }
</style>
