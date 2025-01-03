<script lang="ts">
	import clipboardy from "clipboardy";
	import { ObakoNote } from "src/notes/obako-note";
	import type { Planner } from "src/notes/planner";
	import CollapsibleNoteList from "src/svelte-components/CollapsibleNoteList.svelte";
	import { getTasks } from "src/task-utils";
	import Collapsible from "src/svelte-components/Collapsible.svelte";
	import CollapsibleTaskList from "src/svelte-components/CollapsibleTaskList.svelte";
	import PlannerHierarchy from "./PlannerHierarchy.svelte";
	import PlannerTimeline from "src/plugin-components/views/planner-dashboard/PlannerTimeline.svelte";
	import { addDays } from "src/utils";
	import { getAllNotes } from "src/note-loader";
	import type { ObakoTask } from "src/task-utils";
	import LogDashboard from "src/plugin-components/views/log-dashboard/LogDashboard.svelte";
	import { Log } from "src/notes/zettel-types/log";
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
		await clipboardy.write(markdown);
	}

	const incomingLinkedLogs = note
		.getIncomingLinkedNotes()
		.filter((note) => note.noteType === Log.noteTypeStr);

	let numScheduledTodos: number = tasks
		.filter(scheduledTasksFilter)
		.filter((task) => task.isTodo()).length;
	let numDueTodos: number = tasks
		.filter(dueTasksFilter)
		.filter((task) => task.isTodo()).length;
	let numReminders: number = tasks
		.filter(remindersFilter)
		.filter((task) => task.isTodo()).length;

	let notesCreatedDuringPlannerPeriod = getAllNotes().filter(
		(_note) =>
			!(_note.equals(note)) &&
			_note instanceof ObakoNote &&
			_note.createdAt &&
			_note.createdAt >= note.date &&
			_note.createdAt <= note.endDate,
	);
</script>

<Collapsible title="Overlapping Planners" isCollapsed={false}>
	<PlannerHierarchy {note} />
</Collapsible>

<Collapsible
	title={`Tasks (s${numScheduledTodos} d${numDueTodos} r${numReminders})`}
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
		highlightPlanners={[note]}
	/>
</Collapsible>

<Collapsible title="Logs" isCollapsed={true}>
	<LogDashboard
		initialLogGroupCollapse={false}
		initialLogCollapse={true}
		disableKeyboardNavigation={true}
		fullWidth={true}
		toggleCollapseOnOpen={false}
		noteFilter={(_note) => (_note.date >= note.date && _note.date <= note.endDate) && !note.equals(_note)}
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
