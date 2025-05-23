<script lang="ts">
	import { getAllNotes } from "src/note-loader";
	import { Log } from "src/notes/zettel-types/log";
	import { Planner } from "src/notes/planner";
	import { onMount } from "svelte";
	import LogContent from "./LogContent.svelte";
	import LogGroup from "./LogGroup.svelte";
	import { format } from "date-fns";
	import { getDateFromWeekNumber } from "src/utils";

	export let noteFilter: (note: Log | Planner) => boolean = () => true;
	export let initialLogGroupCollapse: boolean = false;
	export let initialLogCollapse: boolean = false;
	export let disableKeyboardNavigation: boolean = false;
	export let fullWidth: boolean = false;
	export let includeFutureDates: boolean = false;
	export let onlyDailyAndWeeklyPlanners: boolean = true;
	export let toggleCollapseOnOpen: boolean = true;

	export let isInFocus: () => boolean = () => true;

	let notes: (Log | Planner)[] = getAllNotes()
		.filter((note) => note.date)
		.filter((note) => {
			if (onlyDailyAndWeeklyPlanners && note instanceof Planner)
				return note.rangeType === "day" || note.rangeType === "week";
			return true;
		})
		.filter(
			(note) =>
				note.noteType === Log.noteTypeStr ||
				note.noteType === Planner.noteTypeStr,
		)
		.filter((note) => includeFutureDates || note.date <= new Date())
		.filter(noteFilter);

	notes.sort((a, b) => b.date.getTime() - a.date.getTime());
	const logKeyToNote: Record<string, Log> = Object.fromEntries(
		notes.map((log) => [`log-${log.filepath}`, log]),
	);

	const logsByDate: Record<string, Log[]> = notes.reduce((acc, log) => {
		const dateStr = format(log.date, "yyyy-MM-dd 'w'II EEE");
		acc[dateStr] = acc[dateStr] || [];
		acc[dateStr].push(log);
		return acc;
	}, {});
	const logGroupDates = Object.keys(logsByDate).sort().reverse();

	// Find where to put separators to separate logs of different weeks
	const logGroupIsNewWeek = [];
	let lastWeek = null;
	for (const dateStr of logGroupDates) {
		const yearStr = dateStr.slice(0,4);
		const weekStr = dateStr.slice(12,14);
		if (weekStr !== lastWeek) {
			const [weekStartDate, weekEndDate] = getDateFromWeekNumber(parseInt(yearStr), parseInt(weekStr));
			const weekMonthName = format(weekStartDate, "MMM");
			logGroupIsNewWeek.push(`${yearStr} ${weekMonthName} w${weekStr}`);
			lastWeek = weekStr;
		} else {
			logGroupIsNewWeek.push(null);
		}
	}

	const selectHTMLElems: HTMLElement[] = [];
	const selectStatus: Record<string, boolean> = {};
	const collapseStatus: Record<string, boolean> = {};

	for (const dateStr of logGroupDates)
		collapseStatus[`date-${dateStr}`] = initialLogGroupCollapse;
	for (const log of notes)
		collapseStatus[`log-${log.filepath}`] = initialLogCollapse;

	let selectedLogGroupIndex = -1;
	let selectedLogIndex = 0;

	const orderedSelectableItems: string[] = [];
	for (const dateStr of logGroupDates) {
		orderedSelectableItems.push(`date-${dateStr}`);
		for (const log of logsByDate[dateStr]) {
			orderedSelectableItems.push(`log-${log.filepath}`);
		}
	}

	function getSelectedItem() {
		if (selectedLogIndex != -1) {
			return `log-${notes[selectedLogIndex]?.filepath}`;
		} else {
			return `date-${logGroupDates[selectedLogGroupIndex]}`;
		}
	}

	function setSelectStatus(item: string) {
		orderedSelectableItems.forEach((item) => (selectStatus[item] = false));
		if (!item) return;
		selectStatus[item] = true;

		if (item.startsWith("date")) {
			selectedLogGroupIndex = logGroupDates.indexOf(
				item.substring("date-".length),
			);
		} else {
			selectedLogIndex = notes.indexOf(logKeyToNote[item]);
		}
	}

	function updateSelectStatuses() {
		const item = getSelectedItem();
		setSelectStatus(item);
		selectStatus[item] = true;
		selectHTMLElems[item].scrollIntoView({
			behavior: "instant",
			block: "start",
			inline: "nearest",
		});
	}

	function handleClick(item: string) {
		setSelectStatus(item);
	}

	function moveItem(direction: number) {
		// if (selectedLogIndex != -1) {
		// 	selectedLogIndex =
		// 		(notes.length + selectedLogIndex + direction) %
		// 		notes.length;
		// } else {
		// 	selectedLogGroupIndex =
		// 		(logGroupDates.length + selectedLogGroupIndex + direction) %
		// 		logGroupDates.length;
		// }
		selectedLogIndex += direction;
		selectedLogIndex = Math.min(notes.length - 1, selectedLogIndex);
		selectedLogIndex = Math.max(0, selectedLogIndex);
		updateSelectStatuses();
	}

	onMount(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isInFocus()) {
				return;
			}

			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				const direction = event.key === "ArrowDown" ? 1 : -1;
				moveItem(direction);
			} else if (
				event.key === "ArrowLeft" ||
				event.key === "ArrowRight"
			) {
				event.preventDefault();
				if (selectedLogIndex != -1) {
					const selectedLog = notes[selectedLogIndex];
					for (const dateStr of Object.keys(logsByDate)) {
						if (logsByDate[dateStr].includes(selectedLog)) {
							selectedLogGroupIndex =
								logGroupDates.indexOf(dateStr);
							break;
						}
					}
					selectedLogIndex = -1;
				} else {
					selectedLogIndex = notes.indexOf(
						logsByDate[logGroupDates[selectedLogGroupIndex]][0],
					);
					selectedLogGroupIndex = -1;
				}
				updateSelectStatuses();
			} else if (event.key === "Enter") {
				event.preventDefault();
				collapseStatus[getSelectedItem()] = true;
				moveItem(1);
			} else if (event.key === "s") {
				event.preventDefault();
				collapseStatus[getSelectedItem()] = true;
				if (selectedLogIndex != -1) notes[selectedLogIndex].open();
				moveItem(1);
			} else if (event.key === " ") {
				event.preventDefault();
				collapseStatus[getSelectedItem()] =
					!collapseStatus[getSelectedItem()];
			}
		};

		if (!disableKeyboardNavigation) {
			window.addEventListener("keydown", handleKeyDown);
			updateSelectStatuses();
		} else {
			selectedLogIndex = -1;
			selectedLogGroupIndex = -1;
			setSelectStatus(null);
		}

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	});
</script>

<div class:narrow-width={!fullWidth}>
	{#each logGroupDates as dateStr, index}

		{#if logGroupIsNewWeek[index]}
			<div class="log-group-separator">
				{logGroupIsNewWeek[index]}
				<hr>
			</div>
		{/if}

		<div class="log-group" bind:this={selectHTMLElems[`date-${dateStr}`]}>
			<LogGroup
				title={dateStr}
				bind:selected={selectStatus[`date-${dateStr}`]}
				bind:isCollapsed={collapseStatus[`date-${dateStr}`]}
				on:clicked={() => handleClick(`date-${dateStr}`)}
			>
				<ul>
					{#each logsByDate[dateStr] as log}
						<li class="log-item" bind:this={selectHTMLElems[`log-${log.filepath}`]}>
							<LogContent
								{log}
								bind:selected={selectStatus[
									`log-${log.filepath}`
								]}
								bind:isCollapsed={collapseStatus[
									`log-${log.filepath}`
								]}
								on:clicked={() =>
									handleClick(`log-${log.filepath}`)}
								toggleCollapseOnOpen={toggleCollapseOnOpen}
							/>
						</li>
					{/each}
				</ul>
			</LogGroup>
		</div>
	{/each}
</div>

<style>
	.narrow-width {
		margin: 0 auto;
		width: 60%;
	}

	/* Add a media query to disable .narrow-width on small screens */
	@media (max-width: 800px) {
		.narrow-width {
			width: 100%;
		}
	}

	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin-bottom: 5px;
	}

	.log-group-separator {
		margin-top: 20px;
		font-weight: bold;
		font-size: 2em;
	}
	.log-group-separator > hr {
		margin: 0;
		border-width: 3px; /* Change HR thickness */
	}

	.log-group {
		margin-bottom: 10px;
	}

	.log-item {
		margin-bottom: 20px;
	}
</style>
