<script>
  import {createEventDispatcher} from "svelte";

  const dispatch = createEventDispatcher();

  export let active = false;
  export let id;

  const toggle = () => {
    active = !active;
    dispatchToggle();
  }

  const dispatchToggle = () => {
    dispatch("toggle", active);
  }
</script>

<input hidden type="checkbox" bind:checked={active} on:change={dispatchToggle} id={id}/>

<button class="slider-outer" class:active on:click={toggle}>
  <div class="body">
    <div class="point"></div>
  </div>
</button>

<style>
  .slider-outer {
    width: 30px;
    /* height: 20px;  */
    margin: 10px 10px;
    position: relative;
    cursor: pointer;
    border: none;
    outline: none;
    background-color: transparent;
    padding: 0;
  }

  .body {
    background-color: rgb(95, 95, 95);
    height: 14px;
    width: 30px;
    border-radius: 10px;
    margin: 0;
    display: flex;
    align-items: center;
  }

  .point {
    background-color: rgb(144, 144, 144);
    width: 20px;
    height: 20px;
    border-radius: 100%;
    position: absolute;
    left: -10px;
    /* top: -3px; */
    transition: left 0.3s ease;
  }

  .slider-outer.active .point {
    left: 20px;
    background-color: #31a9ff;
  }

  .slider-outer.active .body {
    background-color: #4b5985;
  }
</style>
