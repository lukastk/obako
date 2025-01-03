<script lang="ts">
	import PlannerTimeline from "./PlannerTimeline.svelte";
	import { writable } from "svelte/store";

	import { registerVaultOn, getReloadKey } from "src/internal-utils";
	import { getAllNotesOfType } from "src/note-loader";
	import { Planner } from "src/notes/planner";
	import InternalLink from "src/svelte-components/InternalLink.svelte";

	//export let isInFocus: () => boolean = () => true;

	const planners = getAllNotesOfType(Planner.noteTypeStr) as Planner[];
	planners.sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
	const invalidPlanners = getAllNotesOfType(Planner.noteTypeStr, false).filter(
		(note) => !note?.validate(),
	) as Planner[];
	const reloadKey = writable(0);

	function plannerActiveCheckboxChanged(planner: Planner) {
		planner.active = !planner.active;
	}

	registerVaultOn("all", (file) => {
		// Refresh the active planners list
		setTimeout(() => {
			const updatedPlanners = getAllNotesOfType(Planner.noteTypeStr) as Planner[];
			planners.length = 0;
			planners.push(...updatedPlanners);
		}, 10);
	});
</script>

{#key $reloadKey}
	<PlannerTimeline />
{/key}

<button on:click={() => reloadKey.update((n) => n + 1)}>Reload</button>

<h2>Active planners</h2>

<ul>
	{#each planners as planner}
		{#if planner.active}
			<li>
				<!--<FrontmatterCheckbox
					note={planner}
					frontmatterKey="planner-active"
				/>-->
				<InternalLink note={planner} displayTitleDecorator={true} />
			</li>
		{/if}
	{/each}
</ul>

{#if invalidPlanners.length > 0}
	<h2>Invalid planners</h2>
	<ul>
		{#each invalidPlanners as planner}
			<li>
				<InternalLink note={planner} displayTitleDecorator={true} />
			</li>
		{/each}
	</ul>
{/if}

<style>
	h2 {
		margin-top: 2em;
	}
</style>
