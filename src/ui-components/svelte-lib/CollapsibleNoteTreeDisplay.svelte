<script lang="ts">
	import Collapsible from "./Collapsible.svelte";
	import NoteTreeDisplay from "./NoteTreeDisplay.svelte";
	import type { NoteTree } from "src/notes/parentable-note";
	
	export let noteTree: NoteTree;
	export let displayTitle: string = "Zettel hierarchy";
	export let isCollapsed = true;
	export let displayTitleDecorator = false;
	export let sortByNoteType = false;
	export let disableOpenOnClick = false;
	export let sortFunc: null|((a: NoteTree, b: NoteTree) => number) = null;
	export let filterFunc: (noteTree: NoteTree) => boolean = () => true;

	$: isEmpty = noteTree.children.length == 0;
</script>

<Collapsible title={displayTitle} disabled={isEmpty} {isCollapsed}>
	<NoteTreeDisplay
		noteTree={noteTree}
		topLevel={true}
		displayTitleDecorator={displayTitleDecorator}
		sortByNoteType={sortByNoteType}
		sortFunc={sortFunc}
		filterFunc={filterFunc}
		disableOpenOnClick={disableOpenOnClick}
	/>
</Collapsible>