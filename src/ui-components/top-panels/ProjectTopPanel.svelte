<script lang="ts">
	import CollapsibleNoteTreeDisplay from "src/ui-components/svelte-lib/CollapsibleNoteTreeDisplay.svelte";
	import CollapsibleNoteList from "src/ui-components/svelte-lib/CollapsibleNoteList.svelte";
	import Collapsible from "src/ui-components/svelte-lib/Collapsible.svelte";
	import LogDashboard from "src/ui-components/dashboards/log/LogDashboard.svelte";
	import { Log } from "src/notes/zettel-types/log";
	import { Project } from "src/notes/zettel-types/project";
	import { Doc } from "src/notes/zettel-types/doc";
	import { Pad } from "src/notes/zettel-types/pad";
	export let note: Project;

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === Log.noteTypeStr);
</script>

<CollapsibleNoteTreeDisplay
	displayTitle="Active child projects"
	noteTree={note.getDescendantProjects()}
	isCollapsed={false}
	displayTitleDecorator={true}
	sortFunc={(a, b) => {
		if (a.note.status && b.note.status)
			return a.note.status.localeCompare(b.note.status);
		else return -1;
	}}
	filterFunc={(noteTree) =>
		[Project.statuses.active, Project.statuses.stream].includes(
			noteTree.note.status,
		)}
/>

<CollapsibleNoteList
	title="Modules"
	notes={note.getModules().sort((a, b) => {
		if (a.status && b.status) return a.status.localeCompare(b.status);
		else return -1;
	})}
	isCollapsed={false}
	groupByNoteType={false}
	displayTitleDecorator={true}
/>

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

<CollapsibleNoteTreeDisplay
	displayTitle="All child projects"
	noteTree={note.getDescendantProjects()}
	isCollapsed={true}
	displayTitleDecorator={true}
	sortFunc={(a, b) => {
		if (a.note.status && b.note.status)
			return a.note.status.localeCompare(b.note.status);
		else return -1;
	}}
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
