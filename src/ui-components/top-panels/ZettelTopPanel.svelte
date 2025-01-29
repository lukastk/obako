<script lang="ts">
	import CollapsibleZettelHierarchyDisplay from "src/ui-components/svelte-lib/CollapsibleZettelHierarchyDisplay.svelte";
	import CollapsibleNoteList from "src/ui-components/svelte-lib/CollapsibleNoteList.svelte";
	import Collapsible from "src/ui-components/svelte-lib/Collapsible.svelte";
	import LogDashboard from "src/ui-components/dashboards/log/LogDashboard.svelte";
	import { Log } from "src/notes/zettel-types/log";

	export let note;

	export let collapsibleZettelHierarchyDisplay: boolean = true;
	export let collapsibleNoteList: boolean = true;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === Log.noteTypeStr);
</script>

<CollapsibleZettelHierarchyDisplay
	displayTitle="Zettel hierarchy"
	noteHierarchy={note.getDescendantNotes()}
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
		toggleCollapseOnOpen={false}
		noteFilter={(log) => note.linkedBy(log)}
	/>
</Collapsible>
