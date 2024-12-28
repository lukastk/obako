<script lang="ts">
	import { onMount } from "svelte";
	import { Timeline, DataSet } from "vis-timeline/standalone";
	import "vis-timeline/styles/vis-timeline-graph2d.min.css";
	import { getNotes } from "../../../utils";
	import { Planner } from "../../../notes/planner";
	import { getWeekNumber } from "../../../utils";
	import { registerVaultOn } from "../../../internal-utils";

	const items = new DataSet();

	const PLANNER_GROUP_ID = 1;
	const PLANNER_DAILY_GROUP_ID = 2;
	const PLANNER_WEEKLY_GROUP_ID = 3;
	const PLANNER_MONTHLY_GROUP_ID = 4;
	const PLANNER_QUARTERLY_GROUP_ID = 5;
	const PLANNER_YEARLY_GROUP_ID = 6;
	const PROJECT_GROUP_ID = 7;

	const itemMargin = 60 * 60 * 1000;
	const oneDay = 24 * 60 * 60 * 1000;

	const rangeTypeToGroupId = {
		day: PLANNER_DAILY_GROUP_ID,
		week: PLANNER_WEEKLY_GROUP_ID,
		month: PLANNER_MONTHLY_GROUP_ID,
		quarter: PLANNER_QUARTERLY_GROUP_ID,
		year: PLANNER_YEARLY_GROUP_ID,
	};

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

		{ id: PROJECT_GROUP_ID, content: "Projects" },
		//{ id: 4, content: "Group 4", nestedGroups: [1, 2] },
	]);

	let timeline: Timeline | null = null;
	let isWeekView = true;

	const options = {
		width: "100%",
		//height: "600px",
		selectable: false,
		editable: false,
		zoomKey: "metaKey",
		zoomMin: 1000 * 60 * 60 * 24 * 10,
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

		// format: {
		// 	minorLabels: function (date: Date, scale: Number, step: Number) {
		// 		console.log(date, scale, step);
		// 		return "www";
		// 	},
		// 	majorLabels: function (date: Date, scale: Number, step: Number) {
		// 		return "www";
		// 	},
		// },
	};

	function onItemSelect(properties: any) {
		console.log(properties);
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

	function updateVisibleItems() {
		if (timeline) {
			const visibleRange = timeline.getWindow();
			const visibleItems = items.get({
				filter: (item) => {
					const itemStart = new Date(item.start).getTime();
					const itemEnd = item.end
						? new Date(item.end).getTime()
						: itemStart;
					return (
						itemEnd >= visibleRange.start.getTime() &&
						itemStart <= visibleRange.end.getTime()
					);
				},
			});

			// Determine which groups have visible items
			const visibleGroupIds = new Set();
			visibleItems.forEach((item) => {
				visibleGroupIds.add(item.group);
			});

			// Hide all groups first
			groups.forEach((group) => {
				group.visible = false;
			});

			// Show only groups with visible items
			visibleGroupIds.forEach((groupId) => {
				const group = groups.get(groupId);
				if (group) group.visible = true;
			});

			// Refresh the timeline to apply visibility changes
			timeline.setGroups(groups);
			timeline.redraw();
		}
	}

	function refreshItems() {
		items.clear();

		const planners = getNotes("planner").filter((note) =>
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
				id: planner.file.basename,
				content: itemContent,
				start: startDate.toISOString(),
				end: endDate.toISOString(),
				group:
					rangeTypeToGroupId[planner.rangeType] || PLANNER_GROUP_ID,
				className: `planner-${planner.rangeType} ${planner.frontmatter["planner-active"] ? "active-planner" : "inactive-planner"}`,
				note: planner,
			};

			items.add(item);
		});
	}

	onMount(() => {
		const initializeTimeline = () => {
			const timelineContainer = document.querySelector(
				".timeline-container",
			);
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

<div class="timeline-container"></div>

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

	:global(.inactive-planner) {
		opacity: 0.6;
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
</style>
