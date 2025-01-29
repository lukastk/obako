<script lang="ts">
	import InternalLink from "./InternalLink.svelte";
	
	import type { NoteHierarchy } from "src/notes/parentable-note";

	export let noteHierarchy: NoteHierarchy;
	export let topLevel = true;
	export let displayTitleDecorator = false;
	export let sortByNoteType = false;
	export let sortFunction: null|((a: NoteHierarchy, b: NoteHierarchy) => number) = null;

	if (sortByNoteType) {
		noteHierarchy.children.sort((a, b) => {
			return a.note.noteType.localeCompare(b.note.noteType);
		});
	}

	if (sortFunction) {
		noteHierarchy.children.sort(sortFunction);
	}
</script>

<div class:top-level-note-list-container={topLevel}>
	{#if topLevel}
		{#if noteHierarchy.note.parent}
			<InternalLink
				text={noteHierarchy.note.parent.file.basename}
				note={noteHierarchy.note.parent.file.path}
				displayTitleDecorator={displayTitleDecorator}
			/>
			&gt;
		{/if}
		<InternalLink
			text={noteHierarchy.note.file.basename}
			note={noteHierarchy.note.file.path}
			displayTitleDecorator={displayTitleDecorator}
		/>
	{:else}
		<li>
			<InternalLink
				text={noteHierarchy.note.file.basename}
				note={noteHierarchy.note.file.path}
				displayTitleDecorator={displayTitleDecorator}
			/>
		</li>
	{/if}

	{#if noteHierarchy.children.length > 0}
		<ul>
			{#each noteHierarchy.children as child}
				<svelte:self noteHierarchy={child} topLevel={false} displayTitleDecorator={displayTitleDecorator}/>
			{/each}
		</ul>
	{/if}
</div>

<style>
	ul {
		margin: 0;
		padding-inline-start: 20px;
	}

	li {
		list-style-type: none;
		margin-bottom: 0px;
		padding-top: 0;
		padding-bottom: 0;
		line-height: 1.4em;
	}
</style>
