<script lang="ts">
	export let isCollapsed = true;
	export let addCollapsibleIcon = true;

	let titleElement: HTMLElement;
	let contentElement: HTMLElement;

	export function getTitleElement(): HTMLElement {
		return titleElement;
	}

	export function getContentElement(): HTMLElement {
		return contentElement;
	}
</script>

<button
	class="collapsible-header"
	on:click={() => (isCollapsed = !isCollapsed)}
>
	{#if addCollapsibleIcon}
		{isCollapsed ? "▼" : "▲"}
	{/if}
	<span bind:this={titleElement}>
		<slot name="title"></slot>
	</span>
</button>

<div bind:this={contentElement} class:collapsed={isCollapsed}>
	<slot name="content"></slot>
</div>

<style>
	button {
		all: unset;
	}

	button:hover {
		cursor: pointer;
	}

	.collapsed {
		display: none;
	}
</style>
