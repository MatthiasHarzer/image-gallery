<script lang="ts">

import ImagesView from "./ImagesView.svelte";
import { gallery } from "../scripts/firebase/firebaseManager";
</script>

<div class="main">

  <div class="nav">
    NAV
  </div>

  <div class="all-images">
    <ImagesView images={$gallery?.images ?? []} />
  </div>


</div>
<style>

</style>
