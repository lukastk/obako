<script lang="ts">
	import Collapsible from "./Collapsible.svelte";
	import NoteHierarchyDisplay from "./NoteHierarchyDisplay.svelte";
	import type { NoteHierarchy } from "../notes/obako-note";

	export let noteHierarchy: NoteHierarchy;
	export let displayTitle: string = "Note hierarchy";
	export let isCollapsed = true;
	export let displayTitleDecorator = false;
	export let sortByNoteType = false;

	$: isEmpty = noteHierarchy.children.length == 0;
</script>

<Collapsible title={displayTitle} disabled={isEmpty} {isCollapsed}>
	<NoteHierarchyDisplay
		{noteHierarchy}
		topLevel={true}
		{displayTitleDecorator}
		{sortByNoteType}
	/>
</Collapsible>
