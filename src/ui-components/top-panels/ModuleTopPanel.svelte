<script lang="ts">
	import CollapsibleNoteTreeDisplay from "src/ui-components/svelte-lib/CollapsibleNoteTreeDisplay.svelte";
	import CollapsibleNoteList from "src/ui-components/svelte-lib/CollapsibleNoteList.svelte";
	import Collapsible from "src/ui-components/svelte-lib/Collapsible.svelte";
	import LogDashboard from "src/ui-components/dashboards/log/LogDashboard.svelte";
	import { Log } from "src/notes/zettel-types/log";

    import type { Module } from 'src/notes/zettel-types/module';
    export let note: Module;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === Log.noteTypeStr);
</script>

<CollapsibleNoteTreeDisplay
    displayTitle="Note hierarchy"
    noteTree={note.getDescendantNotes()}
    isCollapsed={true}
    sortByNoteType={true}
    displayTitleDecorator={true}
/>

<CollapsibleNoteList
    title="Linked"
    notes={note.getIncomingLinkedNotes()}
    isCollapsed={true}
    groupByNoteType={true}
/>

<Collapsible
	title={`Linked logs (${incomingLinkedLogs.length})`}
	isCollapsed={true}
	disabled={incomingLinkedLogs.length === 0}
>
	<LogDashboard
		initialLogGroupCollapse={false}
		initialLogCollapse={true}
		disableKeyboardNavigation={true}
		fullWidth={true}
		toggleCollapseOnOpen={false}
		noteFilter={(log) => note.linkedBy(log)}
	/>
</Collapsible>