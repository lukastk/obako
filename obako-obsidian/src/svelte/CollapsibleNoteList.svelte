<script lang="ts">
	import Collapsible from "./Collapsible.svelte";
	import BasicNote from "../notes/basic-note";
	
	import NoteList from "./NoteList.svelte";

	export let title: string;
	export let notes: BasicNote[];
	export let isCollapsed = true;
	export let groupByNoteType = true;

	const notesByType: Record<string, BasicNote[]> = {};
	for (const note of notes) {
		if (!(note.noteType in notesByType)) notesByType[note.noteType] = [];
		notesByType[note.noteType].push(note);
	}

	$: displayTitle = title + " (" + notes.length + ")";
	$: hasNoItems = notes.length == 0;
</script>

<Collapsible title={displayTitle} disabled={hasNoItems} {isCollapsed}>
	<NoteList notes={notes} groupByNoteType={groupByNoteType}/>
</Collapsible>
