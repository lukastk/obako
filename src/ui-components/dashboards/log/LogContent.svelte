<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { onMount } from "svelte";
	import { Log } from "src/notes/zettel-types/log";
	import InternalLink from "src/ui-components/svelte-lib/InternalLink.svelte";
	import MarkdownElement from "src/ui-components/svelte-lib/MarkdownElement.svelte";
	import { format } from "date-fns";

	export let log: Log;
	export let isCollapsed = false;
	export let selected = false;
	export let toggleCollapseOnOpen: boolean = true;

	let dateStr = format(log.date, "yyyy-MM-dd 'w'II EEE");
	let contentLoaded = false;
	let content: string = "";

	const dispatch = createEventDispatcher();

	function handleClick(event: MouseEvent, fromInternalLink: boolean = false) {
		dispatch("clicked", isCollapsed);
		
		let openedNote = false;
		if (
			((event.metaKey || event.ctrlKey) && !fromInternalLink) || // Open note if clicked on the main log content with meta or ctrl key pressed down
			(!(event.metaKey || event.ctrlKey) && fromInternalLink) // Open note if clicked on the internal link
		) {
			log.open(event.metaKey || event.ctrlKey);
			openedNote = true;
		}

		if (toggleCollapseOnOpen || !openedNote) {
			isCollapsed = !isCollapsed;
		}
	}

	onMount(async () => {
		content = await log.getContent();
		contentLoaded = true;
	});
</script>

<!-- Wrap the table in a button for better accessibility -->
<button
	style="width: 100%; border: none; background: none; padding: 0;"
	on:click={handleClick}
	aria-expanded={!isCollapsed}
>
	<table style="height: 1px;">
		<tr>
			<td class="content-collapser-col">
				<div
					class="content-collapser-vertical-line {selected
						? 'selected-collapser-col'
						: ''} {isCollapsed
						? 'content-collapser-col-collapsed'
						: ''}"
				></div>
			</td>

			<td>
				<h5 class="log-title">
					<span class="note-icon"
						>{log.getNoteIcon()}</span
					>
					<span class="log-date">{dateStr}</span>
					<span class={selected ? "selected-log-title" : ""}>
						<InternalLink
							note={log}
							text={log.logTitle}
							onClick={(event) => handleClick(event, true)}
							disableOpenOnClick={true}
						/>
					</span>
				</h5>

				{#if !isCollapsed && contentLoaded}
					<MarkdownElement {content} />
				{/if}
			</td>
		</tr>
	</table>
</button>

<style>
	button {
		width: 100%;
		height: auto;
		border: none;
		background: none;
		padding: 0;
		padding-top: 5px;
		padding-bottom: 5px;
		text-align: left;
		display: block;
		white-space: normal;
	}

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
	.note-icon {
		color: var(--text-accent);
	}

	.content-collapser-col {
		cursor: pointer;
		padding-left: 20px;
		padding-right: 20px;
		width: 4px;
		text-align: center;
		opacity: 0.6;
	}
	.content-collapser-col-collapsed {
		width: 6px !important;
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
