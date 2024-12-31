<script lang="ts">
	import type { Zettel } from "src/notes/zettels/zettel";
	import CollapsibleNoteHierarchyDisplay from "src/svelte-components/CollapsibleNoteHierarchyDisplay.svelte";
	import CollapsibleNoteList from "src/svelte-components/CollapsibleNoteList.svelte";
	import Collapsible from "src/svelte-components/Collapsible.svelte";
	import LogDashboard from "src/plugin-components/views/log-dashboard/LogDashboard.svelte";

	export let note: Zettel;

	export let collapsibleNoteHierarchyDisplay: boolean = true;
	export let collapsibleNoteList: boolean = true;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === "log");
</script>

<CollapsibleNoteHierarchyDisplay
	displayTitle="Note hierarchy"
	noteHierarchy={note.getDescendantNotes()}
	isCollapsed={collapsibleNoteHierarchyDisplay}
	displayTitleDecorator={true}
	sortByNoteType={true}
/>
<CollapsibleNoteList
	title="Linked"
	notes={note.getIncomingLinkedNotes()}
	isCollapsed={collapsibleNoteList}
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
		logFilter={(log) => note.linkedBy(log)}
	/>
</Collapsible>
