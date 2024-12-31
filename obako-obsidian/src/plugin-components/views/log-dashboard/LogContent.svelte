<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { onMount } from "svelte";
	import { Log } from "src/notes/zettel-types/log";
	import InternalLink from "src/svelte-components/InternalLink.svelte";
	import MarkdownElement from "src/svelte-components/MarkdownElement.svelte";
	import { format } from "date-fns";

	export let log: Log;
	export let isCollapsed = false;

	export let selected = false;

	let dateStr = format(log.date, "'w'II EEE");
	let contentLoaded = false;
	let content: string = "";

	const dispatch = createEventDispatcher();

	function handleClick(event: MouseEvent) {
		dispatch("clicked", isCollapsed);
        isCollapsed = !isCollapsed;
		if (event.metaKey || event.ctrlKey) {
			log.open(event.shiftKey);
		}
	}

	onMount(async () => {
		content = await log.getContent();
		contentLoaded = true;
	});
</script>

<!-- Height is needed to make the vertical line visible -->
<table style="height: 1px;" on:click={handleClick}>
	<tr>
		<td
			class="content-collapser-col"
			on:click={() => (isCollapsed = !isCollapsed)}
		>
			<div
				class="content-collapser-vertical-line {selected
					? 'selected-collapser-col'
					: ''}"
			></div>
		</td>

		<td>
			<h5 class="log-title">
				<span class="log-date">{dateStr}</span>
				<span class={selected ? "selected-log-title" : ""}>
					<InternalLink note={log} text={log.logTitle} />
				</span>
			</h5>

			{#if !isCollapsed && contentLoaded}
				<MarkdownElement {content} />
			{/if}
		</td>
	</tr>
</table>

<style>
	.log-title {
		margin: 0;
	}
	.log-title:hover {
		background-color: var(--background-primary-alt);
	}

	.log-date {
		font-size: var(--font-small);
		color: var(--text-muted);
	}

	.content-collapser-col {
		cursor: pointer;
		padding-left: 20px;
		padding-right: 20px;
		width: 5px;
		text-align: center;
		opacity: 0.6;
	}

	.content-collapser-vertical-line {
		height: 100%;
		width: 3px;
		border-radius: 3px;
		background-color: var(--color-green);
	}
	.content-collapser-col:hover > .content-collapser-vertical-line {
		box-shadow: 0 0 5px var(--color-green);
	}

	.selected-collapser-col {
		background-color: white;
	}
	.content-collapser-col:hover > .selected-collapser-col {
		box-shadow: 0 0 5px white;
	}

	.selected-log-title {
		text-decoration: underline;
	}

	table {
		width: 100%;
	}
	table:hover {
		background-color: var(--background-primary-alt);
	}
</style>
