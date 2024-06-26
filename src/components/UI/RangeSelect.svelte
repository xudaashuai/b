<script lang="ts">
import { createEventDispatcher } from 'svelte';

export let min = 0;
export let max = 100;
export let value = 10;

const dispatch = createEventDispatcher<{
  change: number;
}>();
</script>

<input
  type="range"
  {min}
  {max}
  {value}
  on:change={(e) => dispatch('change', +e?.target?.value ?? 0)}
  class="slider"
/>

<style>
.slider {
  margin: 20px 0;
  flex: 1;
}
</style>
