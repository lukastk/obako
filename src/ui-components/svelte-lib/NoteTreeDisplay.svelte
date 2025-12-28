<script lang="ts">
	import type { BasicNote } from "src/notes/basic-note";
	import InternalLink from "./InternalLink.svelte";
	
	import type { NoteTree } from "src/notes/parentable-note";

	export let noteTree: NoteTree;
	export let topLevel = true;
	export let displayTitleDecorator = false;
	export let sortByNoteType = false;
	export let disableOpenOnClick = false;
	export let sortFunc: null|((a: NoteTree, b: NoteTree) => number) = null;
	export let filterFunc: (note: NoteTree) => boolean = () => true;
	export let filterKeepIfAnyChildMatches: boolean = false;

	if (sortByNoteType) {
		noteTree.children.sort((a, b) => {
			return a.note.noteType.localeCompare(b.note.noteType);
		});
	}

	if (sortFunc) {
		noteTree.children.sort(sortFunc);
	}

	function _filterFunc(noteTree: NoteTree) {
		if (filterKeepIfAnyChildMatches) {
			return noteTree.children.some(_filterFunc) || filterFunc(noteTree);
		} else {
			return filterFunc(noteTree);
		}
	}
</script>

<div class:top-level-note-list-container={topLevel}>
	{#if topLevel}
		{#if noteTree.note.parent}
			<InternalLink
				text={noteTree.note.parent.name}
				note={noteTree.note.parent}
				displayTitleDecorator={displayTitleDecorator}
				disableOpenOnClick={disableOpenOnClick}
			/>
			&gt;
		{/if}
		<InternalLink
			text={noteTree.note.name}
			note={noteTree.note}
			displayTitleDecorator={displayTitleDecorator}
			disableOpenOnClick={disableOpenOnClick}
		/>
	{:else}
		<li>
			<InternalLink
				text={noteTree.note.name}
				note={noteTree.note}
				displayTitleDecorator={displayTitleDecorator}
				disableOpenOnClick={disableOpenOnClick}
			/>
		</li>
	{/if}

	{#if noteTree.children.length > 0}
		<ul>
			{#each noteTree.children.filter(_filterFunc) as child}
				<svelte:self noteTree={child} topLevel={false} displayTitleDecorator={displayTitleDecorator} filterFunc={filterFunc} sortFunc={sortFunc} disableOpenOnClick={disableOpenOnClick} filterKeepIfAnyChildMatches={filterKeepIfAnyChildMatches}/>
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
