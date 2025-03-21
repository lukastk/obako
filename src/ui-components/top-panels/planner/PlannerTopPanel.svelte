<script lang="ts">
	import { ObakoNote } from "src/notes/obako-note";
	import type { Planner } from "src/notes/planner";
	import CollapsibleNoteList from "src/ui-components/svelte-lib/CollapsibleNoteList.svelte";
	import { getTasks } from "src/task-utils";
	import Collapsible from "src/ui-components/svelte-lib/Collapsible.svelte";
	import CollapsibleTaskList from "src/ui-components/svelte-lib/CollapsibleTaskList.svelte";
	import PlannerHierarchy from "./PlannerHierarchy.svelte";
	import PlannerTimeline from "src/ui-components/dashboards/planner/PlannerTimeline.svelte";
	import { addDays } from "src/utils";
	import { getAllNotes } from "src/note-loader";
	import type { ObakoTask } from "src/task-utils";
	import LogDashboard from "src/ui-components/dashboards/log/LogDashboard.svelte";
	import { Log } from "src/notes/zettel-types/log";
	import PlannerNavigator from "./PlannerNavigator.svelte";

	export let note: Planner;

	const tasks = getTasks();

	const scheduledTasksFilter = (task: ObakoTask) =>
		task.isScheduledInDateRange(note.date, note.endDate);
	const dueTasksFilter = (task: ObakoTask) =>
		task.isDueInDateRange(note.date, note.endDate) &&
		!task.tags.includes("reminder");
	const remindersFilter = (task: ObakoTask) =>
		task.isDueInDateRange(note.date, note.endDate) &&
		task.tags.includes("reminder");
	const doneTasksFilter = (task: ObakoTask) =>
		task.isDoneInDateRange(note.date, note.endDate);

	function formatTaskList(
		scheduledTasks: ObakoTask[],
		dueTasks: ObakoTask[],
		reminders: ObakoTask[],
		doneTasks: ObakoTask[],
	) {
		let markdown = "";

		markdown += "**Scheduled**\n";
	}

	async function copyTasksToClipboard() {
		const scheduledTasks = tasks.filter(scheduledTasksFilter);
		const dueTasks = tasks.filter(dueTasksFilter);
		const reminders = tasks.filter(remindersFilter);
		const doneTasks = tasks.filter(doneTasksFilter);

		const markdown = scheduledTasks
			.map((task) => task.originalMarkdown)
			.join("\n");
		navigator.clipboard.writeText(markdown);
	}

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === Log.noteTypeStr);

	const numScheduledTodos: number = tasks
		.filter(scheduledTasksFilter)
		.filter((task) => task.isTodo()).length;
	const numDueTodos: number = tasks
		.filter(dueTasksFilter)
		.filter((task) => task.isTodo()).length;
	const numReminders: number = tasks
		.filter(remindersFilter)
		.filter((task) => task.isTodo()).length;

	const numScheduledTodosOutsideOfNote: number = tasks
		.filter(scheduledTasksFilter)
		.filter((task) => task.isTodo())
		.filter((task) => note.filepath !== task.filePath).length;
	const numDueTodosOutsideOfNote: number = tasks
		.filter(dueTasksFilter)
		.filter((task) => task.isTodo())
		.filter((task) => note.filepath !== task.filePath).length;
	const numRemindersOutsideOfNote: number = tasks
		.filter(remindersFilter)
		.filter((task) => task.isTodo())
		.filter((task) => note.filepath !== task.filePath).length;

	let notesCreatedDuringPlannerPeriod = getAllNotes().filter(
		(_note) =>
			!_note.equals(note) &&
			_note instanceof ObakoNote &&
			_note.createdAt &&
			_note.createdAt >= note.date &&
			_note.createdAt <= note.endDate,
	);

</script>

{#if ['day', 'week', 'month', 'quarter', 'year'].includes(note.rangeType)}
	<Collapsible title="Navigator" isCollapsed={false}>
		<PlannerNavigator {note} />
	</Collapsible>
{/if}

<Collapsible title="Overlapping Planners" isCollapsed={true}>
	<PlannerHierarchy {note} />
</Collapsible>

<Collapsible
	title={`Tasks`}
	postTitleText={`(scheduled: ${numScheduledTodos}[${numScheduledTodosOutsideOfNote}] due: ${numDueTodos}[${numDueTodosOutsideOfNote}] reminders: ${numReminders}[${numRemindersOutsideOfNote}])`}
	isCollapsed={true}
>
	<CollapsibleTaskList
		title="Scheduled"
		secondLevel={true}
		filter_func={scheduledTasksFilter}
	/>
	<CollapsibleTaskList
		title="Due"
		secondLevel={true}
		filter_func={dueTasksFilter}
	/>
	<CollapsibleTaskList
		title="Reminders"
		secondLevel={true}
		filter_func={remindersFilter}
	/>
	<CollapsibleTaskList
		title="Done"
		secondLevel={true}
		filter_func={doneTasksFilter}
		isCollapsed={true}
	/>
</Collapsible>

<Collapsible title="Planner timeline" isCollapsed={true}>
	<PlannerTimeline
		initialStart={addDays(note.date, -3)}
		initialEnd={addDays(note.endDate, 4)}
		highlightNotes={[note]}
	/>
</Collapsible>

<Collapsible title="Logs" isCollapsed={true}>
	<LogDashboard
		initialLogGroupCollapse={false}
		initialLogCollapse={true}
		disableKeyboardNavigation={true}
		fullWidth={true}
		toggleCollapseOnOpen={false}
		noteFilter={(_note) =>
			_note.date >= note.date &&
			_note.date <= note.endDate &&
			!note.equals(_note)}
	/>
</Collapsible>

<CollapsibleNoteList
	title="Created notes"
	notes={notesCreatedDuringPlannerPeriod}
	isCollapsed={true}
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
