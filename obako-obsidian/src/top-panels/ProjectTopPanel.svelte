<script lang="ts">
	import CollapsibleZettelHierarchyDisplay from "src/svelte-components/CollapsibleZettelHierarchyDisplay.svelte";
	import CollapsibleNoteList from "src/svelte-components/CollapsibleNoteList.svelte";
	import Collapsible from "src/svelte-components/Collapsible.svelte";
	import LogDashboard from "src/plugin-components/views/log-dashboard/LogDashboard.svelte";

    import type { Project } from 'src/notes/zettel-types/project';
    export let note: Project;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === Log.noteTypeStr);
</script>
    
<CollapsibleZettelHierarchyDisplay
    displayTitle="Child projects"
    noteHierarchy={note.getDescendantWorkUnits()}
    isCollapsed={false}
/>
<CollapsibleZettelHierarchyDisplay
    displayTitle="Zettel hierarchy"
    noteHierarchy={note.getDescendantZettels()}
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
		noteFilter={(log) => note.linkedBy(log)}
	/>
</Collapsible>