<script lang="ts">
	import { loadNote } from "src/note-loader";
	import type { BasicNote } from "src/notes/basic-note";
	import { TFile } from "obsidian";

	export let text;
	export let note: string | TFile | BasicNote;
	export let displayTitleDecorator = false;

	if (typeof note === "string" || note instanceof TFile) {
		note = loadNote(note);
	}

	const decorator = note.getTitleDecoratorString();
	const filePath = note.file.path;

	function handleClick(event) {
		event.preventDefault(); // Prevent the default browser action
		const inNewPane = event.metaKey || event.ctrlKey;
		_obako_plugin.app.workspace.openLinkText(filePath, "", inNewPane); // Use app.workspace to navigate
	}
</script>

<a class="internal-link" href={filePath} on:click={handleClick}>
	{#if displayTitleDecorator}
		{decorator}
	{/if}
	{text}
</a>