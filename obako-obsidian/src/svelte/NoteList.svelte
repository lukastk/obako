<script lang="ts">
	import BasicNote from "../notes/basic-note";
	import InternalLink from "./InternalLink.svelte";

	import { noteTypeToNoteClass } from "../note-loader";

	export let notes: BasicNote[];
	export let groupByNoteType = true;
	export let includeNoteTypes: string[] = [];

	const notesByType: Record<string, BasicNote[]> = {};
	for (const note of notes) {
		if (!(note.noteType in notesByType)) notesByType[note.noteType] = [];
		notesByType[note.noteType].push(note);
	}
</script>

<div class="note-list-container">
	{#if groupByNoteType}
		{#each Object.entries(notesByType) as [noteType, noteTypeNotes]}
			{#if includeNoteTypes.includes(noteType) || includeNoteTypes.length == 0}
				<div>
					<i>{noteType}s</i>
					({noteTypeToNoteClass[noteType]?.titleDecoratorString ?? "???"})
				</div>
				<ul>
					{#each noteTypeNotes as note}
						<li>
							<InternalLink
								text={note.file.basename}
								note={note.file.path}
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
					<li><InternalLink text={note.file.basename} note={note.file.path} /></li>
				{/if}
			{/each}
		</ul>
	{/if}
</div>

<style>
	.note-list-container {
		margin-top: 5px;
		padding: 10px;
		padding-left: 20px;
		background-color: var(--background-primary);
		border-radius: 5px;
	}

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
