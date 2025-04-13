<script lang="ts">
	import CollapsibleNoteTreeDisplay from "src/ui-components/svelte-lib/CollapsibleNoteTreeDisplay.svelte";
	import CollapsibleNoteList from "src/ui-components/svelte-lib/CollapsibleNoteList.svelte";
	import Collapsible from "src/ui-components/svelte-lib/Collapsible.svelte";
	import LogDashboard from "src/ui-components/dashboards/log/LogDashboard.svelte";
	import { Log } from "src/notes/zettel-types/log";
	import { Doc } from "src/notes/zettel-types/doc";
	import { Pad } from "src/notes/zettel-types/pad";
	import { ObakoNote } from "src/notes/obako-note";
	import NoteForegrounds from "src/ui-components/svelte-lib/NoteForegrounds.svelte";

    import type { Module } from 'src/notes/zettel-types/module';
    export let note: Module;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === Log.noteTypeStr);
</script>

<CollapsibleNoteList
	title="Docs"
	notes={note
		.getIncomingLinkedNotes()
		.filter((note) => note instanceof Doc)
		.sort((a, b) => {
			if (a.status && b.status)
				return Doc.statusOrder[a.status] - Doc.statusOrder[b.status];
			else return -1;
		})}
	isCollapsed={false}
	groupByNoteType={false}
	displayTitleDecorator={true}
/>

<CollapsibleNoteList
	title="Pads"
	notes={note
		.getIncomingLinkedNotes()
		.filter((note) => note instanceof Pad)
		.sort((a, b) => {
			if (a.inWriting && !b.inWriting) return -1;
			else if (!a.inWriting && b.inWriting) return 1;
			else return 0;
		})}
	isCollapsed={false}
	groupByNoteType={false}
	displayTitleDecorator={true}
/>

<CollapsibleNoteList
	title="Linked captures"
	notes={note
		.getIncomingLinkedNotes()
		.filter((note) => note instanceof ObakoNote)
		.filter((note) => note.needsConsolidation)}
	isCollapsed={false}
	groupByNoteType={true}
/>

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


<Collapsible title="Foregrounds" isCollapsed={false}>
	<NoteForegrounds note={note} />
</Collapsible>