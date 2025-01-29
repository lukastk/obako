<script lang="ts">
	import Collapsible from "./Collapsible.svelte";
	import ZettelHierarchyDisplay from "./ZettelHierarchyDisplay.svelte";
	import type { NoteHierarchy } from "src/notes/parentable-note";

	export let noteHierarchy: NoteHierarchy;
	export let displayTitle: string = "Zettel hierarchy";
	export let isCollapsed = true;
	export let displayTitleDecorator = false;
	export let sortByNoteType = false;
	export let sortFunction: null|((a: NoteHierarchy, b: NoteHierarchy) => number) = null;

	$: isEmpty = noteHierarchy.children.length == 0;
</script>

<Collapsible title={displayTitle} disabled={isEmpty} {isCollapsed}>
	<ZettelHierarchyDisplay
		{noteHierarchy}
		topLevel={true}
		{displayTitleDecorator}
		{sortByNoteType}
		{sortFunction}
	/>
</Collapsible>
