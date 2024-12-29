<script lang="ts">
	/**
	 * - [ ] Add a copy to clipboard button
	 */

	import { renderMarkdown } from "src/utils";
	import { getTasks } from "src/task-utils";
	import { onMount } from "svelte";

	export let filter_func: (task: any) => boolean = () => true;

	let tasks: ObakoTask[] = getTasks().filter(filter_func);
	let taskContainers: HTMLElement[] = [];

	let loaded = false;

	onMount(() => {
		updateTasks();
	});

	function updateTasks() {
		tasks = getTasks().filter(filter_func);

		tasks.forEach(async (task, index) => {
			const container = taskContainers[index];
			if (container) {
				container.innerHTML = "";
				const markdown = task.originalMarkdown.trim();
				const _container = document.createElement("div");
				renderMarkdown(markdown, _container);
				const taskElem = _container.querySelector("li");
				container.innerHTML = taskElem?.innerHTML;
				const checkboxInputElem = container.querySelector(
					"input[type='checkbox']",
				);
				checkboxInputElem?.disabled = true;
			}
		});

		loaded = true;
	}

	// function toggleTask(task: any) {
	// 	task.toggle();
	// }

	function openTask(task: any, event: any) {
		const inNewPane = event.metaKey || event.ctrlKey;
		task.note.open(inNewPane);
}
</script>

<ul id="task-list">
	{#each tasks as task, index}
		<li class="task-list-item-container">
			<button type="button" 
				class="task-list-item" 
				on:click={(event) => openTask(task, event)}>
				<span bind:this={taskContainers[index]}></span>
			</button>

			<span class="task-list-item-path">
				{task.filePath}
			</span>
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	button {
		border: none;
		background: none;
		box-shadow: none;
		padding: 0;
		margin: 0;
		text-align: left;
		display: inline;
		height: auto;
	}

	button:hover {
		background-color: var(--background-primary-alt);
		cursor: pointer;
	}

	.task-list-item-path {
		font-size: var(--font-smaller);
		color: var(--text-muted);
	}

	.task-list-item-container {
		padding: 0;
	}
	.task-list-item-container:hover {
		background-color: var(--background-primary-alt);
		cursor: pointer;
	}
</style>