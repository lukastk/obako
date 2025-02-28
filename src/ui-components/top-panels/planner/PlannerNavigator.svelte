<script lang="ts">
	import InternalLink from "src/ui-components/svelte-lib/InternalLink.svelte";
	import { Planner } from "src/notes/planner";
	import { getAllNotes, searchNotes } from "src/note-loader";
	import { arrayBufferToBase64 } from "obsidian";
	import {
		addDays,
		getDateStringFromDate,
		getWeekNumberStr,
		getFile,
	} from "src/utils";

	export let note: Planner;

	/* Either returns the path of a pre-existing planner, or a path to a new one (in the planner folder). */
	function getPlannerPath(plannerTitle: string) {
		const matchingPlanners = searchNotes(plannerTitle, Planner, true);
		if (matchingPlanners.length > 0) {
			return matchingPlanners[0].path;
		} else {
			const folder =
				_obako_plugin.settings.noteTypeFolders[Planner.noteTypeStr];
			return `${folder}/${plannerTitle}.md`;
		}
	}

	const plannerFolder =
		_obako_plugin.settings.noteTypeFolders[Planner.noteTypeStr];

	function getPrevOrNextPlanner(direction: "prev" | "next") {
		let date;
		let month;
		let year;
		switch (note.rangeType) {
			case "day":
				date = addDays(note.date, direction === "prev" ? -1 : 1);
				return `${plannerFolder}/${getDateStringFromDate(date)}`;
			case "week":
				date = addDays(note.date, direction === "prev" ? -7 : 7);
				const weekNumber = getWeekNumberStr(date);
				year = date.getFullYear();
				return `${plannerFolder}/${year} w${weekNumber}`;
			case "month":
				date = new Date(note.date);
				date.setMonth(
					date.getMonth() + (direction === "prev" ? -1 : 1),
				);
				year = date.getFullYear();
				month = String(date.getMonth() + 1).padStart(2, "0");
				return `${plannerFolder}/${year}-${month}`;
			case "quarter":
				date = new Date(note.date);
				date.setMonth(
					date.getMonth() + (direction === "prev" ? -3 : 3),
				);
				year = date.getFullYear();
				const quarter = String(Math.ceil((date.getMonth() + 1) / 3));
				return `${plannerFolder}/${year} Q${quarter}`;
			case "year":
				date = new Date(note.date);
				date.setFullYear(
					date.getFullYear() + (direction === "prev" ? -1 : 1),
				);
				return `${plannerFolder}/${date.getFullYear()}`;
			default:
				throw new Error(`Invalid range type: ${note.rangeType}`);
		}
	}

	function getVerticalPlanner(destDateRange: string) {
		switch (destDateRange) {
			case "day":
				return `${plannerFolder}/${getDateStringFromDate(note.date)}`;
			case "week":
				return `${plannerFolder}/${note.date.getFullYear()} w${getWeekNumberStr(note.date)}`;
			case "month":
				const month = String(note.date.getMonth() + 1).padStart(2, "0");
				return `${plannerFolder}/${note.date.getFullYear()}-${month}`;
			case "quarter":
				return `${plannerFolder}/${note.date.getFullYear()} Q${Math.ceil((note.date.getMonth() + 1) / 3)}`;
			case "year":
				return `${plannerFolder}/${note.date.getFullYear()}`;
			default:
				throw new Error(`Invalid range type: ${destDateRange}`);
		}
	}

	const usedPlannerStyle = "text-decoration: none; font-size: 1.5rem;";
	const unusedPlannerStyle =
		"text-decoration: none; color: var(--text-muted); font-size: 1.5rem;";
	const dateRangeToIndex = {
		day: 0,
		week: 1,
		month: 2,
		quarter: 3,
		year: 4,
	};
</script>

<table>
	<thead>
		<tr>
			<th>Day</th>
			<th>Week</th>
			<th>Month</th>
			<th>Quarter</th>
			<th>Year</th>
		</tr>
	</thead>

	<tbody>
		<tr>
			{#each Object.keys(dateRangeToIndex) as range}
				<td>
					{#if note.rangeType === range}
						<InternalLink
							note={getPrevOrNextPlanner("prev")}
							extraStyle={getFile(getPrevOrNextPlanner("prev"))
								? usedPlannerStyle
								: unusedPlannerStyle}
							text="◀︎"
						/>
						<InternalLink
							note={getPrevOrNextPlanner("next")}
							extraStyle={getFile(getPrevOrNextPlanner("next"))
								? usedPlannerStyle
								: unusedPlannerStyle}
							text="▶︎"
						/>
					{:else}
						<InternalLink
							note={getVerticalPlanner(range)}
							extraStyle={getFile(getVerticalPlanner(range))
								? usedPlannerStyle
								: unusedPlannerStyle}
							text={dateRangeToIndex[note.rangeType] >
							dateRangeToIndex[range]
								? "▼"
								: "▲"}
						/>
					{/if}
				</td>
			{/each}
		</tr>
	</tbody>
</table>

<style>
	table {
		table-layout: fixed; /* Ensures equispaced cells */
		width: 100%; /* Ensures the table takes full width */
	}

	th {
		padding: 0;
		text-align: center;
	}

	td {
		font-size: var(--font-small);
		padding: 0;
		vertical-align: top;
		text-align: center;
		width: 20%;
	}
</style>
