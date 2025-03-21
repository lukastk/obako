<script lang="ts">
	import Collapsible from "./Collapsible.svelte";
	import { BasicNote } from "src/notes/basic-note";

	import NoteList from "./NoteList.svelte";

	export let title: string;
	export let notes: BasicNote[];
	export let isCollapsed = true;
	export let groupByNoteType = true;
	export let displayTitleDecorator = false;
	export let disableOpenOnClick = false;

	$: displayTitle = title + " (" + notes.length + ")";
	$: hasNoItems = notes.length == 0;
</script>

<Collapsible title={displayTitle} disabled={hasNoItems} {isCollapsed}>
	<NoteList
		{notes}
		{groupByNoteType}
		{displayTitleDecorator}
		{disableOpenOnClick}
	/>
</Collapsible>
