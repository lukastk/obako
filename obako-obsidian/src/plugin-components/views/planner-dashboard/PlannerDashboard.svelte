<script lang="ts">
	import PlannerTimeline from "./PlannerTimeline.svelte";
	import FrontmatterCheckbox from "../../../svelte/FrontmatterCheckbox.svelte";
	import { writable } from "svelte/store";
	
	import { registerOn } from "../../../internal-utils";
	import { getNotes } from "../../../utils";
	import Planner from "../../../notes/planner";
	import InternalLink from "src/svelte/InternalLink.svelte";

	const planners = getNotes("planner") as Planner[];
	const invalidPlanners = getNotes("planner", false).filter(note => !note?.validate()) as Planner[];
	const reloadKey = writable(0); 
	
	function plannerActiveCheckboxChanged(planner: Planner) {
		planner.active = !planner.active;
	}
	
	registerOn('all', (file) => {
		// Refresh the active planners list
		setTimeout(() => {
			const updatedPlanners = getNotes("planner") as Planner[];
			planners.length = 0; 
			planners.push(...updatedPlanners);
			reloadKey.update(n => n + 1); // Update the key to trigger reload
		}, 10);
	});
</script>

{#key $reloadKey}
	<PlannerTimeline />
{/key}

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

{#if invalidPlanners.length > 0}
	<h2>Invalid planners</h2>
	<ul>
		{#each invalidPlanners as planner}
			<InternalLink note={planner} displayTitleDecorator={true} />
		{/each}
	</ul>
{/if}

<style>
	h2 {
		margin-top: 2em;
	}
</style>
