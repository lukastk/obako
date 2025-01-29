<script lang="ts">
	import CollapsibleZettelHierarchyDisplay from "src/ui-components/svelte-lib/CollapsibleZettelHierarchyDisplay.svelte";
	import CollapsibleNoteList from "src/ui-components/svelte-lib/CollapsibleNoteList.svelte";
	import Collapsible from "src/ui-components/svelte-lib/Collapsible.svelte";
	import LogDashboard from "src/ui-components/dashboards/log/LogDashboard.svelte";
	import { Log } from "src/notes/zettel-types/log";

	import type { Project } from "src/notes/zettel-types/project";
	export let note: Project;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === Log.noteTypeStr);

	const modules = note.getModules().sort((a, b) => {
		if (a.status && b.status) return a.status.localeCompare(b.status);
		else return -1;
	});
</script>

<CollapsibleZettelHierarchyDisplay
	displayTitle="Child projects"
	noteHierarchy={note.getDescendantProjects()}
	isCollapsed={false}
	displayTitleDecorator={true}
	sortFunction={(a, b) => {
		if (a.note.status && b.note.status) return a.note.status.localeCompare(b.note.status);
		else return -1;
	}}
/>

<CollapsibleNoteList
	title="Modules"
	notes={modules}
	isCollapsed={false}
	groupByNoteType={false}
	displayTitleDecorator={true}
/>

<CollapsibleZettelHierarchyDisplay
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
		toggleCollapseOnOpen={false}
		noteFilter={(log) => note.linkedBy(log)}
	/>
</Collapsible>
