<script lang="ts">
    import type { Zettel } from 'src/notes/zettels/zettel';
    import CollapsibleNoteHierarchyDisplay from 'src/svelte-components/CollapsibleNoteHierarchyDisplay.svelte';
    import CollapsibleNoteList from 'src/svelte-components/CollapsibleNoteList.svelte';

    export let note: Zettel;

    export let collapsibleNoteHierarchyDisplay: boolean = true;
    export let collapsibleNoteList: boolean = true;
</script>

<CollapsibleNoteHierarchyDisplay 
    displayTitle="Note hierarchy"
    noteHierarchy={note.getDescendantNotes()}
    isCollapsed={collapsibleNoteHierarchyDisplay}
    displayTitleDecorator={true}
    sortByNoteType={true}
/>
<CollapsibleNoteList 
    title="Linked"
    notes={note.getIncomingLinkedNotes()}
    isCollapsed={collapsibleNoteList}
    groupByNoteType={true}
/>