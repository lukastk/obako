<script lang="ts">
	import { loadNote } from "src/note-loader";
	import type { BasicNote } from "src/notes/basic-note";
	import { TFile } from "obsidian";
	import { onMount } from "svelte";
	import { generateRandomId } from "src/utils";

	export let text: string | null = null;
	export let note: string | TFile | BasicNote;
	export let displayTitleDecorator = false;
	export let extraStyle: string = '';

	export let disableOpenOnClick = false;
	export let onClick: (event: MouseEvent) => void = () => {};

	const linkId = generateRandomId();

	if (typeof note === "string" || note instanceof TFile) {
		note = loadNote(note);
	}

	if (!text) text = note.name;

	const filePath = note.filepath;

	function handleClick(event: MouseEvent) {
		if (!disableOpenOnClick) {
			event.preventDefault(); // Prevent the default browser action
			const inNewPane = event.metaKey || event.ctrlKey;
			note.open(inNewPane);
		}
		onClick(event);
	}

	let prefixDecorator: HTMLElement | null = null;
	let suffixDecorator: HTMLElement | null = null;

	onMount(() => {
		if (displayTitleDecorator) {
			if (prefixDecorator) {
				note.setTitlePrefixDecorator(prefixDecorator);
			}
			if (suffixDecorator) {
				note.setTitleSuffixDecorator(suffixDecorator);
			}
		}
	});
</script>

<a class="internal-link" style={extraStyle} href={filePath} on:click={handleClick}>
	<div
		class="inline-title-prefix-decorator"
		bind:this={prefixDecorator}
	></div>

	{text}

	<div
		class="inline-title-suffix-decorator"
		bind:this={suffixDecorator}
	></div>
</a>

<style>
	.inline-title-prefix-decorator,
	.inline-title-suffix-decorator {
		display: inline;
	}

	.internal-link:hover {
		cursor: pointer;
	}
</style>
