<script lang="ts">
	export let title: string | null = null;
	export let disabled = false;
	export let isCollapsed = true;
	export let reloadButton = false;
	export let secondLevel = false;

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	let reloadKey = 0;
	function reload() {
		reloadKey += 1; // Increment the key to trigger re-render
	}
</script>

<div class="collapsible-header-container">
	<button
		class="collapsible-header"
		on:click={toggleCollapse}
		aria-expanded={!isCollapsed}
		style="cursor: pointer; color: {disabled
			? 'var(--text-muted)'
			: 'inherit'}"
	>
		{#if title}
			<b>{title}</b>&nbsp;{isCollapsed ? "▼" : "▲"}
		{/if}
	</button>

	{#if reloadButton}
		<button class="reload-button" on:click={reload}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-refresh-ccw"
				><path
					d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
				/><path d="M3 3v5h5" /><path
					d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"
				/><path d="M16 16h5v5" /></svg
			>
		</button>
	{/if}
</div>

{#if !isCollapsed}
	<div class="collapsible-content {secondLevel ? 'second-level-collapsible' : ''}" key={reloadKey}>
		<slot></slot>
	</div>
{/if}

<style>
	.collapsible-header-container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.collapsible-header {
		border: none;
		background: none;
		box-shadow: none;
		padding-left: 10px;
		padding-right: 5px;
		text-align: left;
		display: block;
		flex-grow: 1;
	}
	.collapsible-header:hover {
		background-color: var(--background-primary);
	}

	.collapsible-content {
		margin-top: 5px;
		padding: 10px;
		padding-left: 20px;
		background-color: var(--background-primary);
		border-radius: 5px;
	}

	.second-level-collapsible {
		padding: 2px;
		padding-left: 5px;
		border-radius: 0px;
		margin-top: 2px;
	}

	.reload-button {
		border: none;
		background: none;
		box-shadow: none;
		text-align: left;
		display: inline;
		cursor: pointer;
	}
	.reload-button:hover {
		background-color: var(--background-primary);
	}
</style>
