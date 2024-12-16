<script lang="ts">
	import { loadNote } from "src/note-loader";
	import type { BasicNote } from "src/notes/basic-note";
	import { TFile } from "obsidian";
	import { onMount } from "svelte";
	import { generateRandomId } from "src/utils";

	export let text: string | null = null;
	export let note: string | TFile | BasicNote;
	export let displayTitleDecorator = false;

	const linkId = generateRandomId();

	if (typeof note === "string" || note instanceof TFile) {
		note = loadNote(note);
	}

	if (!text) {
		text = note.file.basename;
	}

	const filePath = note.file.path;

	function handleClick(event: MouseEvent) {
		event.preventDefault(); // Prevent the default browser action
		const inNewPane = event.metaKey || event.ctrlKey;
		note.open(inNewPane);
	}

	onMount(() => {
		if (displayTitleDecorator) {
			const prefixDecorator = document.querySelector(`#inline-title-prefix-decorator-${linkId}`);
			if (prefixDecorator) {
				note.setTitlePrefixDecorator(prefixDecorator);
			}
			const suffixDecorator = document.querySelector(`#inline-title-suffix-decorator-${linkId}`);
			if (suffixDecorator) {
				note.setTitleSuffixDecorator(suffixDecorator);
			}
		}
	});
</script>

<a class="internal-link" href={filePath} on:click={handleClick}>
	<div class="inline-title-prefix-decorator" id={`inline-title-prefix-decorator-${linkId}`}></div>
	
	{text}

	<div class="inline-title-suffix-decorator" id={`inline-title-suffix-decorator-${linkId}`}></div>
</a>

<style>
	.inline-title-prefix-decorator, .inline-title-suffix-decorator {
		display: inline;
	}
</style>
