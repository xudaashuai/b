<script lang="ts">
import type { ILayoutLine } from '../../service/ReaderLayoutService';

export let page: ILayoutLine[] | undefined;
</script>

<div>
  {#if page}
    {#each page as line, index}
      {#if line.isTitle}
        <div class={`title ${line.titleLast && 'title-last'}`}>{line.text}</div>
      {:else}
        <div class={`${line.center && 'center'} ${line.pFirst && index !== 0 && 'p-top'} line`}>
          {#each line.text.split('') as char, index}
            <span class={index === 0 && line.pFirst ? 'indent' : ''}>{char}</span>
          {/each}
        </div>
      {/if}
    {/each}
  {/if}
</div>

<style>
.hide {
  opacity: 0;
}
.title {
  font-size: var(--title-font-size);
  line-height: var(--title-font-height);
  font-weight: var(--title-weight);
}
.title-last {
  margin-bottom: var(--title-gap);
}
.line {
  font-size: var(--font-size);
  line-height: var(--font-height);
  display: flex;
}
.center {
  justify-content: space-between;
}
.indent {
  text-indent: 2em;
}
.p-top {
  margin-top: var(--p-gap);
}
</style>
