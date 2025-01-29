<script lang="ts">
    import InternalLink from "./InternalLink.svelte";
    import { BasicNote } from "src/notes/basic-note";

    export let note: BasicNote;
    export let frontmatterKey: string | null = null;
    export let frontmatterEditFunction: (note: BasicNote, value: boolean) => void | null = null;

    function defaultFrontmatterEditFunction(note: BasicNote) {
        note.modifyFrontmatter(frontmatterKey, !note.frontmatter[frontmatterKey]);
    }

    if (!frontmatterEditFunction) {
        frontmatterEditFunction = defaultFrontmatterEditFunction;
    }

    let isChecked = note.frontmatter[frontmatterKey] || false;
    let isSlotEmpty = !$$slots.default;
</script>

<input
	type="checkbox"
	bind:checked={isChecked}
	on:change={() => frontmatterEditFunction(note, isChecked)}
/>

<label for={note.name}>
    {#if isSlotEmpty}
        <InternalLink note={note} displayTitleDecorator={true} />
    {:else}
        <slot></slot>
    {/if}
</label>
