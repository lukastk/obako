<script lang="ts">
	import InternalLink from "src/svelte-components/InternalLink.svelte";
	import type { Planner } from "src/notes/planner";
	import { getAllNotes } from "src/note-loader";
	export let note: Planner;

	const allPlannerNotes: Planner[] = getAllNotes().filter(
		(note) => (note.noteType === Planner.noteTypeStr) && note.validate(),
	) as Planner[];

	const supersetPlanners: Planner[] = [];
	const overlappingPlanners: Planner[] = [];
	const subsetPlanners: Planner[] = [];
	const beforePlanners: Planner[] = [];
	const afterPlanners: Planner[] = [];

	for (const planner of allPlannerNotes) {
		if (planner.equals(note)) continue;

		if (planner.date <= note.date && planner.endDate >= note.endDate) {
			supersetPlanners.push(planner);
		} else if (
			planner.date >= note.date &&
			planner.endDate <= note.endDate
		) {
			subsetPlanners.push(planner);
		} else if (
			(planner.date <= note.date && planner.endDate >= note.date) ||
			(planner.date >= note.date && planner.date <= note.endDate)
		) {
			overlappingPlanners.push(planner);
		} else if (planner.endDate < note.date) {
			beforePlanners.push(planner);
		} else if (planner.date > note.endDate) {
			afterPlanners.push(planner);
		}
	}

	supersetPlanners.sort((a, b) => a.date - b.date);
	subsetPlanners.sort((a, b) => a.date - b.date);
	overlappingPlanners.sort((a, b) => a.date - b.date);
	beforePlanners.sort((a, b) => a.endDate - b.endDate);
	afterPlanners.sort((a, b) => a.date - b.date);

	const closestBeforeDate = new Date(
		Math.max(...beforePlanners.map((planner) => planner.endDate.getTime())),
	);
	const closestAfterDate = new Date(
		Math.min(...afterPlanners.map((planner) => planner.date.getTime())),
	);

	const nearestBeforePlanners = beforePlanners.filter(
		(planner) => planner.endDate.getTime() === closestBeforeDate.getTime(),
	);
	const nearestAfterPlanners = afterPlanners.filter(
		(planner) => planner.date.getTime() === closestAfterDate.getTime(),
	);
</script>

<table>
	<thead>
		<tr>
			<th>Superset <span class="superset-icon">▲</span></th>
			<th>Subset <span class="subset-icon">▼</span></th>
			<th>Before <span class="before-icon">◀︎</span></th>
			<th>After <span class="after-icon">▶︎</span></th>
		</tr>
	</thead>

	<tbody>
		<tr>
		<td>
			<ul>
				{#each supersetPlanners as planner}
					<li>
						<InternalLink
							note={planner}
							displayTitleDecorator={true}
						/>
					</li>
				{/each}
			</ul>
		</td>

		<td>
			<ul>
				{#each subsetPlanners as planner}
					<li>
						<InternalLink
							note={planner}
							displayTitleDecorator={true}
						/>
					</li>
				{/each}
			</ul>
		</td>

		<td>
			<ul>
				{#each nearestBeforePlanners as planner}
					<li>
						<InternalLink
							note={planner}
							displayTitleDecorator={true}
						/>
					</li>
				{/each}
			</ul>
		</td>

		<td>
			<ul>
				{#each nearestAfterPlanners as planner}
					<li>
						<InternalLink
							note={planner}
							displayTitleDecorator={true}
						/>
					</li>
				{/each}
			</ul>
		</td>
	</tr>
</table>


<style>
	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	.superset-icon {
		color: var(--color-cyan);
	}

	.subset-icon {
		color: var(--color-green);
	}

	.before-icon {
		color: var(--color-blue);
	}

	.after-icon {
		color: var(--color-orange);
	}

    th {
        font-size: var(--font-small);
        padding: 0;
        text-align: left;
    }

	td {
        font-size: var(--font-smaller);
		padding: 0.5rem;
        vertical-align: top;
        width: 25%;
	}

    li:hover {
        background-color: var(--background-primary-alt);
    }
</style>
