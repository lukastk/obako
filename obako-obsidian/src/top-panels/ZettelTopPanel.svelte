<script lang="ts">
	import CollapsibleZettelHierarchyDisplay from "src/svelte-components/CollapsibleZettelHierarchyDisplay.svelte";
	import CollapsibleNoteList from "src/svelte-components/CollapsibleNoteList.svelte";
	import Collapsible from "src/svelte-components/Collapsible.svelte";
	import LogDashboard from "src/plugin-components/views/log-dashboard/LogDashboard.svelte";

	export let note;

	export let collapsibleZettelHierarchyDisplay: boolean = true;
	export let collapsibleNoteList: boolean = true;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === "log");
</script>

<CollapsibleZettelHierarchyDisplay
	displayTitle="Zettel hierarchy"
	noteHierarchy={note.getDescendantZettels()}
	isCollapsed={collapsibleZettelHierarchyDisplay}
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
