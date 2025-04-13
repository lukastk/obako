<script lang="ts">
	import MarkdownElement from "./MarkdownElement.svelte";
    import type { BasicNote } from "src/notes/basic-note";
    import { getNoteForegrounds } from "src/task-utils";
    export let note: BasicNote;

	let noteForegrounds: any[] = [];
	async function loadNoteForegrounds() {
		noteForegrounds = await getNoteForegrounds(note);
	}
	loadNoteForegrounds();
</script>

{#each noteForegrounds as fg}
    <div>
        <a class="internal-link" href={fg.blockLink}>▶️</a>
        {fg.description}
        {#if fg.subtext}
            <MarkdownElement content={fg.subtext} />
        {/if}
    </div>
{/each}
