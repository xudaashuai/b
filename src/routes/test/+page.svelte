<script lang="ts">
import { onMount } from 'svelte';
import {
  fetchChapterContent,
  fetchChapterContents
} from '../../service/dataStrategy/remoteDataStrategy';
import type { IChapter } from '../../db/types';
import { fetchChapters } from '../../utils/extractContentFromHTML';
let result: IChapter | undefined = undefined;
let contents: {
  title: string;
  id: string;
}[] = [];
onMount(async () => {
  result = await fetchChapterContent('45525', 40711514);
  contents = await fetchChapters('45525');
  console.log(result);
});
</script>

<div>
  {#each contents as content}
    <div>{content.title} {content.id}</div>
  {/each}
</div>
