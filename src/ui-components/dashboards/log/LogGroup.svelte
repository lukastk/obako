<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let title: string;
	export let isCollapsed = false;
    export let selected = false;

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch("clicked", isCollapsed);
		isCollapsed = !isCollapsed;
	}
</script>

<button class="log-group-title {selected ? 'selected' : ''}" on:click={handleClick}>{title}</button>

{#if !isCollapsed}
	<div class="log-group-content">
		<slot></slot>
	</div>
{/if}

<style>
	button {
		width: 100%;
		border: none;
		background: none;
		text-align: left;
		vertical-align: initial;
		display: block;
		border: 0;
		box-shadow: none;
	}

	.log-group-title {
		font-size: 1.2em;
		font-weight: bold;
		margin-top: 10px;
		margin-bottom: 10px;
	}
    .log-group-title:hover {
        background-color: var(--background-primary-alt);
    }

	.log-group-content {
	}

    .selected {
        text-decoration: underline;
        background-color: var(--background-secondary);
    }
</style>
