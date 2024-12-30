<script lang="ts">
	import clipboardy from "clipboardy";
	import type { Planner } from "src/notes/planner";
	import ZettelTopPanel from "src/top-panels/ZettelTopPanel.svelte";
	import { getTasks } from "src/task-utils";
	import Collapsible from "src/svelte-components/Collapsible.svelte";
	import CollapsibleTaskList from "src/svelte-components/CollapsibleTaskList.svelte";
	import PlannerHierarchy from "./PlannerHierarchy.svelte";
	import PlannerTimeline from "src/plugin-components/views/planner-dashboard/PlannerTimeline.svelte";
	import { addDays } from "src/utils";
	
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
</script>

<Collapsible title="Overlapping Planners" isCollapsed={false}>
	<PlannerHierarchy {note} />
</Collapsible>

<Collapsible title="Tasks" isCollapsed={true}>
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

<ZettelTopPanel
	{note}
	collapsibleNoteHierarchyDisplay={true}
	collapsibleNoteList={true}
/>
