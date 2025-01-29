<script lang="ts">
	import { BasicNote } from "src/notes/basic-note";
	import InternalLink from "./InternalLink.svelte";

	import { noteTypeToNoteClass } from "src/note-loader";

	export let notes: BasicNote[];
	export let groupByNoteType = true;
	export let includeNoteTypes: string[] = [];
	export let displayTitleDecorator = false;

	const notesByType: Record<string, BasicNote[]> = {};
	for (const note of notes) {
		if (!(note.noteType in notesByType)) notesByType[note.noteType] = [];
		notesByType[note.noteType].push(note);
	}
</script>

{#if groupByNoteType}
	{#each Object.entries(notesByType) as [noteType, noteTypeNotes]}
		{#if includeNoteTypes.includes(noteType) || includeNoteTypes.length == 0}
			<div>
				{noteTypeToNoteClass[noteType]?.noteIcon ?? "???"}
				<i>{noteType}s</i>
			</div>
			<ul>
				{#each noteTypeNotes as note}
					<li>
						<InternalLink
							text={note.file.basename}
							note={note.file.path}
							displayTitleDecorator={displayTitleDecorator}
						/>
					</li>
				{/each}
			</ul>
		{/if}
	{/each}
{:else}
	<ul>
		{#each notes as note}
			{#if includeNoteTypes.includes(note.noteType) || includeNoteTypes.length == 0}
				<li>
					<InternalLink
						text={note.file.basename}
						note={note.file.path}
						displayTitleDecorator={displayTitleDecorator}
					/>
				</li>
			{/if}
		{/each}
	</ul>
{/if}

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
