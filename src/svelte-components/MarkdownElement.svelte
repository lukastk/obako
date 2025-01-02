<script lang="ts">
    import { renderMarkdown } from "src/utils";
    import { onMount } from "svelte";

    export let content: string;
    let container: HTMLElement;

    onMount(() => {
        renderMarkdown(content, container);
    });
</script>

<div bind:this={container}></div>