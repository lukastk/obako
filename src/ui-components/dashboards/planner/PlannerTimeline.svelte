<script lang="ts">
	import { onMount } from "svelte";
	import { Timeline, DataSet } from "vis-timeline/standalone";
	import "vis-timeline/styles/vis-timeline-graph2d.min.css";
	import { getAllNotesOfType } from "src/note-loader";
	import { BasicNote } from "src/notes/basic-note";
	import { Planner } from "src/notes/planner";
	import { Project } from "src/notes/zettel-types/project";
	import { Module } from "src/notes/zettel-types/module";
	import { getWeekNumber } from "src/utils";

	export let initialStart: Date | null = null;
	export let initialEnd: Date | null = null;
	export let highlightNotes: BasicNote[] = [];
	const highlightNotesFilePaths = highlightNotes.map((n) => n.filepath);

	if (!initialStart) {
		initialStart = new Date();
		const dayNumber = (initialStart.getDay() + 6) % 7;
		initialStart.setDate(initialStart.getDate() - dayNumber);
	}
	if (!initialEnd) {
		initialEnd = new Date();
		const dayNumber = (initialEnd.getDay() + 6) % 7;
		initialEnd.setDate(initialEnd.getDate() + (6 - dayNumber) + 1);
	}

	const items = new DataSet();

	const PLANNER_GROUP_ID = 'planner';
	const PLANNER_DAILY_GROUP_ID = 'planner-daily';
	const PLANNER_WEEKLY_GROUP_ID = 'planner-weekly';
	const PLANNER_MONTHLY_GROUP_ID = 'planner-monthly';
	const PLANNER_QUARTERLY_GROUP_ID = 'planner-quarterly';
	const PLANNER_YEARLY_GROUP_ID = 'planner-yearly';

	const PROJECTS_GROUP_ID = 'projects';
	const PROJECTS_SUBGROUPS_GROUP_ID = 'projects-subgroups';
	const MODULES_GROUP_ID = 'modules';
	const MODULES_SUBGROUPS_GROUP_ID = 'modules-subgroups';

	const itemMargin = 60 * 60 * 1000;
	const oneDay = 24 * 60 * 60 * 1000;

	const rangeTypeToGroupId = {
		day: PLANNER_DAILY_GROUP_ID,
		week: PLANNER_WEEKLY_GROUP_ID,
		month: PLANNER_MONTHLY_GROUP_ID,
		quarter: PLANNER_QUARTERLY_GROUP_ID,
		year: PLANNER_YEARLY_GROUP_ID,
	};


	const projectSubGroups = [];
	const moduleSubGroups = [];

	const groups = new DataSet([
		{
			id: PLANNER_GROUP_ID,
			content: "Planners",
			nestedGroups: [
				PLANNER_DAILY_GROUP_ID,
				PLANNER_WEEKLY_GROUP_ID,
				PLANNER_MONTHLY_GROUP_ID,
				PLANNER_QUARTERLY_GROUP_ID,
				PLANNER_YEARLY_GROUP_ID,
			],
		},
		{ id: PLANNER_DAILY_GROUP_ID, content: "Daily" },
		{ id: PLANNER_WEEKLY_GROUP_ID, content: "Weekly" },
		{ id: PLANNER_MONTHLY_GROUP_ID, content: "Monthly" },
		{ id: PLANNER_QUARTERLY_GROUP_ID, content: "Quarterly" },
		{ id: PLANNER_YEARLY_GROUP_ID, content: "Yearly" },

		{ id: PROJECTS_GROUP_ID, content: "Projects", nestedGroups: [PROJECTS_SUBGROUPS_GROUP_ID, MODULES_GROUP_ID] },
		{ id: PROJECTS_SUBGROUPS_GROUP_ID, content: "Project subgroups", nestedGroups: projectSubGroups },
		{ id: MODULES_GROUP_ID, content: "Modules", nestedGroups: [MODULES_SUBGROUPS_GROUP_ID] },
		{ id: MODULES_SUBGROUPS_GROUP_ID, content: "Module subgroups", nestedGroups: moduleSubGroups },

		//{ id: 4, content: "Group 4", nestedGroups: [1, 2] },
	]);

	let timeline: Timeline | null = null;
	let isWeekView = true;

	const options = {
		start: initialStart.toISOString().split("T")[0],
		end: initialEnd.toISOString().split("T")[0],
		width: "100%",
		//height: "600px",
		selectable: false,
		editable: false,
		zoomKey: "metaKey",
		zoomMin: 1000 * 60 * 60 * 24 * 3,
		zoomMax: 1000 * 60 * 60 * 24 * 365 * 14,
		horizontalScroll: true, // Enable horizontal scrolling
		showWeekScale: true,

		margin: {
			// Prevents non-overlapping items from stacking on top of each other
			item: {
				horizontal: -1,
			},
		},
		format: {
			minorLabels: {
				millisecond: "SSS",
				second: "s",
				minute: "HH:mm",
				hour: "HH:mm",
				weekday: "ddd D",
				day: "D ddd",
				week: "\\wWW",
				month: "MMM",
				year: "YYYY",
			},
			majorLabels: {
				millisecond: "HH:mm:ss",
				second: "D MMMM HH:mm",
				minute: "ddd D MMMM",
				hour: "ddd D MMMM",
				weekday: "MMMM YYYY",
				day: "MMMM YYYY",
				week: "\\'YY MMM",
				month: "YYYY",
				year: "",
			},
		},
	};

	function onItemSelect(properties: any) {
		if (properties.item) {
			const inNewPane =
				properties.event.metaKey || properties.event.ctrlKey;
			const selectedItem = items.get(properties.item);
			if (selectedItem) {
				selectedItem.note.open(inNewPane);
			}
		}
	}

	function centerOnToday() {
		if (timeline) {
			timeline.moveTo(new Date());
		}
	}

	function refreshItems() {
		items.clear();

		/* Planners */
		
		const planners = getAllNotesOfType(Planner.noteTypeStr).filter((note) =>
			note.validate(),
		) as Planner[];

		planners.forEach((planner) => {
			const startDate = new Date(planner.date.getTime() + itemMargin); // Add one hour to the start date to add a margin
			let endDate: Date;
			if (planner.endDate) {
				endDate = new Date(
					planner.endDate.getTime() + oneDay - itemMargin,
				);
			} else {
				endDate = new Date(
					planner.date.getTime() + oneDay - itemMargin,
				); // Remove one hour from the end date to add a margin
			}

			let itemContentPrefix: string;
			switch (planner.rangeType) {
				case "day":
					itemContentPrefix = planner.date
						.toLocaleDateString("en-US", { weekday: "short" })
						.slice(0, 2);
					break;
				case "week":
					itemContentPrefix = `w${getWeekNumber(planner.date).toString()}`;
					break;
				case "month":
					itemContentPrefix = `'${planner.date.getFullYear().toString().slice(-2)} ${planner.date.toLocaleDateString("en-US", { month: "short" })}`;
					break;
				case "quarter":
					itemContentPrefix = `${planner.date.getFullYear()} Q${Math.ceil((planner.date.getMonth() + 1) / 3)}`;
					break;
				case "year":
					itemContentPrefix = planner.date.getFullYear().toString();
					break;
				default:
					itemContentPrefix = "";
			}
			itemContentPrefix = `<b>${itemContentPrefix}</b>`;

			let itemContent;
			if (planner.plannerTitle) {
				itemContent = `${itemContentPrefix} ${planner.plannerTitle?.trim()}`;
			} else {
				itemContent = itemContentPrefix;
			}

			const item = {
				id: planner.file.path,
				content: itemContent,
				start: startDate.toISOString(),
				end: endDate.toISOString(),
				group: rangeTypeToGroupId[planner.rangeType] || PLANNER_GROUP_ID,
				className: [
					`planner-${planner.rangeType}`,
					planner.frontmatter["planner-active"] ? "active-note" : "inactive-note",
					highlightNotesFilePaths.includes(planner.filepath) ? "highlighted-item" : ""
				].filter(Boolean).join(" "),
				note: planner,
			};

			items.add(item);
		});

		/* Projects */

		const projects = (getAllNotesOfType(Project.noteTypeStr) as Project[])
			.filter((proj) => proj.validate())
			.filter((proj) => proj.startDate && proj.endDate);

		projects.forEach((proj) => {
			if (proj.hideInPlannerDashboard) return;

			let groupId = PROJECTS_GROUP_ID;
			if (proj.plannerDashboardGroup) {
				if (!groups.map((group) => group.id).includes(proj.plannerDashboardGroup)) {
					groups.add({ id: proj.plannerDashboardGroup, content: proj.plannerDashboardGroup });
					projectSubGroups.push(proj.plannerDashboardGroup);
				}
				groupId = proj.plannerDashboardGroup;
			}

			const item = {
				id: proj.file.path,
				content: proj.file.basename,
				start: proj.startDate.toISOString(),
				end: proj.endDate.toISOString(),
				group: groupId,
				className: [
					'project',
					proj.status === Project.statuses.active ? "active-note" : "inactive-note",
					highlightNotesFilePaths.includes(proj.filepath) ? "highlighted-item" : ""
				].filter(Boolean).join(" "),
				note: proj,
			};
			items.add(item);
		});

		/* Modules */

		const modules = (getAllNotesOfType(Module.noteTypeStr) as Module[])
			.filter((mod) => mod.validate())
			.filter((mod) => mod.startDate && mod.endDate);

		modules.forEach((mod) => {
			if (mod.hideInPlannerDashboard) return;

			let groupId = MODULES_GROUP_ID;
			if (mod.plannerDashboardGroup) {
				if (!groups.map((group) => group.id).includes(mod.plannerDashboardGroup)) {
					groups.add({ id: mod.plannerDashboardGroup, content: mod.plannerDashboardGroup });
					moduleSubGroups.push(mod.plannerDashboardGroup);
				}
				groupId = mod.plannerDashboardGroup;
			}

			const item = {
				id: mod.file.path,
				content: `<i>${mod.parent.file.basename}:</i> ${mod.file.basename}`,
				start: mod.startDate.toISOString(),
				end: mod.endDate.toISOString(),
				group: groupId,
				className: [
					'module',
					mod.status === Module.statuses.active ? "active-note" : "inactive-note",
					highlightNotesFilePaths.includes(mod.filepath) ? "highlighted-item" : ""
				].filter(Boolean).join(" "),
				note: mod,
			};
			items.add(item);
		});
	}

	let timelineContainer: HTMLElement | null = null;

	onMount(() => {
		const initializeTimeline = () => {
			if (timelineContainer) {
				refreshItems();

				timeline = new Timeline(
					timelineContainer as HTMLElement,
					items,
					groups,
					options,
				);

				timeline.on("click", onItemSelect);

				// registerVaultOn('all', (file) => {
				// 	setTimeout(() => { // This is a hack to make sure the items are refreshed after the file is modified.
				// 		refreshItems();
				// 		timeline.redraw();
				// 	}, 10);
				// });
			} else {
				// Retry after a short delay if the container is not found
				setTimeout(initializeTimeline, 10);
			}
		};

		initializeTimeline();
	});
</script>

<div bind:this={timelineContainer}></div>

<button on:click={centerOnToday}>Center on Today</button>

<style>
	button {
		cursor: pointer;
	}

	:global(.vis-text, .vis-label) {
		color: var(--text-normal) !important;
	}

	:global(.vis-item) {
		cursor: pointer;
		white-space: unset !important;
	}
	:global(.vis-item:hover) {
		/* opacity: 0.75;*/
		border: 2px solid var(--interactive-hover);
	}
	:global(.vis-item-content) {
		white-space: unset !important;
	}

	:global(.highlighted-item) {
		border: 3px solid var(--color-red);
	}

	:global(.vis-saturday),
	:global(.vis-sunday) {
		background: #666;
	}

	:global(.vis-today) {
		background: hsl(141, 38%, 51%);
	}

	:global(.vis-nesting-group) {
		background: var(--background-secondary) !important;
	}

	:global(.vis-nested-group) {
		background: var(--background-secondary) !important;
	}

	:global(.vis-group-level-unknown-but-gte1) {
		border: none;
	}

	:global(.vis-group-level-0) {
		background: var(--background-secondary) !important;
	}

	:global(.vis-background) {
		/* background: var(--background-secondary-alt) !important; */
	}

	:global(.planner-day) {
		background: var(--color-base-100);
	}

	:global(.planner-week) {
		background: var(--color-purple);
	}

	:global(.planner-month) {
		background: var(--color-blue);
	}

	:global(.planner-quarter) {
		background: var(--color-pink);
	}

	:global(.planner-year) {
		background: var(--color-green);
	}

	:global(.project) {
		background: #ddd;
	}

	:global(.module) {
		background: var(--color-orange);
	}

	/*:global(.active-note) { } */
	:global(.inactive-note) {
		opacity: 0.4;
	}
</style>
