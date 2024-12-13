<script lang="ts">
	export let title: string;
	export let disabled = false;
	export let isCollapsed = true;

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}
</script>

<button
	on:click={toggleCollapse}
	aria-expanded={!isCollapsed}
	style="cursor: pointer; color: {disabled
		? 'var(--text-muted)'
		: 'inherit'}"
>
	<b>{title}</b>&nbsp;{isCollapsed ? "▼" : "▲"}
</button>

{#if !isCollapsed}
	<slot></slot>
{/if}

<style>
	button {
		border: none;
		background: none;
		box-shadow: none;
		padding-left: 10px;
		padding-right: 5px;
		text-align: left;
		display: block;
		width: 100%;
	}
	button:hover {
		background-color: var(--background-primary);
	}
</style>
