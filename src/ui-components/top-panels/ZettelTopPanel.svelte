<script lang="ts">
	import CollapsibleNoteTreeDisplay from "src/ui-components/svelte-lib/CollapsibleNoteTreeDisplay.svelte";
	import CollapsibleNoteList from "src/ui-components/svelte-lib/CollapsibleNoteList.svelte";
	import Collapsible from "src/ui-components/svelte-lib/Collapsible.svelte";
	import LogDashboard from "src/ui-components/dashboards/log/LogDashboard.svelte";
	import { Log } from "src/notes/zettel-types/log";
	import { ObakoNote } from "src/notes/obako-note";
	import NoteForegrounds from "../svelte-lib/NoteForegrounds.svelte";

	export let note;

	export let collapsibleNoteTreeDisplay: boolean = true;
	export let collapsibleNoteList: boolean = true;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === Log.noteTypeStr);
</script>

<CollapsibleNoteTreeDisplay
	displayTitle="Zettel hierarchy"
	noteTree={note.getDescendantNotes()}
	isCollapsed={collapsibleNoteTreeDisplay}
	displayTitleDecorator={true}
	sortByNoteType={true}
/>
<CollapsibleNoteList
	title="Linked"
	notes={note.getIncomingLinkedNotes()}
	isCollapsed={collapsibleNoteList}
	groupByNoteType={true}
/>

<CollapsibleNoteList
	title="Linked captures"
	notes={note
		.getIncomingLinkedNotes()
		.filter((note) => note instanceof ObakoNote)
		.filter((note) => note.needsConsolidation)}
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
