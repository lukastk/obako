<script lang="ts">
	import CollapsibleNoteHierarchyDisplay from "src/svelte-components/CollapsibleNoteHierarchyDisplay.svelte";
	import CollapsibleNoteList from "src/svelte-components/CollapsibleNoteList.svelte";
	import Collapsible from "src/svelte-components/Collapsible.svelte";
	import LogDashboard from "src/plugin-components/views/log-dashboard/LogDashboard.svelte";

    import type { Project } from 'src/notes/zettels/project';
    export let note: Project;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === "log");
</script>
    
<CollapsibleNoteHierarchyDisplay
    displayTitle="Child projects"
    noteHierarchy={note.getDescendantWorkUnits()}
    isCollapsed={false}
/>
<CollapsibleNoteHierarchyDisplay
    displayTitle="Note hierarchy"
    noteHierarchy={note.getDescendantNotes()}
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
		logFilter={(log) => note.linkedBy(log)}
	/>
</Collapsible>