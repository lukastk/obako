<script lang="ts">
	import PlannerTimeline from "./PlannerTimeline.svelte";
	import FrontmatterCheckbox from "../../../svelte/FrontmatterCheckbox.svelte";

	import { registerOnModify } from "../../../internal-utils";
	import { getNotes } from "../../../utils";
	import Planner from "../../../notes/planner";

	const planners = getNotes("planner") as Planner[];

	function plannerActiveCheckboxChanged(planner: Planner) {
		planner.active = !planner.active;
	}
	
	registerOnModify((file) => {
		// Refresh the active planners list
		setTimeout(() => {
			const updatedPlanners = getNotes("planner") as Planner[];
			planners.length = 0; 
			planners.push(...updatedPlanners);
		}, 10);
	});
</script>

<PlannerTimeline />

<h2>Active planners</h2>

<ul>
	{#each planners as planner}
		{#if planner.active}
			<li>
				<FrontmatterCheckbox
					note={planner}
					frontmatterKey="planner-active"
				/>
			</li>
		{/if}
	{/each}
</ul>

<style>
	h2 {
		margin-top: 2em;
	}
</style>
