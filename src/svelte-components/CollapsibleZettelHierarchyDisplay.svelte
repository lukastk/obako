<script lang="ts">
	import Collapsible from "./Collapsible.svelte";
	import ZettelHierarchyDisplay from "./ZettelHierarchyDisplay.svelte";
	import type { NoteHierarchy } from "../notes/obako-note";

	export let noteHierarchy: NoteHierarchy;
	export let displayTitle: string = "Zettel hierarchy";
	export let isCollapsed = true;
	export let displayTitleDecorator = false;
	export let sortByNoteType = false;

	$: isEmpty = noteHierarchy.children.length == 0;
</script>

<Collapsible title={displayTitle} disabled={isEmpty} {isCollapsed}>
	<ZettelHierarchyDisplay
		{noteHierarchy}
		topLevel={true}
		{displayTitleDecorator}
		{sortByNoteType}
	/>
</Collapsible>
