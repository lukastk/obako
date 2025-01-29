<script lang="ts">
	import CollapsibleZettelHierarchyDisplay from "src/svelte-components/CollapsibleZettelHierarchyDisplay.svelte";
	import CollapsibleNoteList from "src/svelte-components/CollapsibleNoteList.svelte";
	import Collapsible from "src/svelte-components/Collapsible.svelte";
	import LogDashboard from "src/plugin-components/views/log-dashboard/LogDashboard.svelte";
	import { Log } from "src/notes/zettel-types/log";

    import type { Module } from 'src/notes/zettel-types/module';
    export let note: Module;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === Log.noteTypeStr);
</script>
    
Hello