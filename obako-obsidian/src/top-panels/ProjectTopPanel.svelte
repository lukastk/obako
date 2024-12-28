<script lang="ts">
    import CollapsibleNoteHierarchyDisplay from 'src/svelte/CollapsibleNoteHierarchyDisplay.svelte';
    import CollapsibleNoteList from 'src/svelte/CollapsibleNoteList.svelte';

    import type { Project } from 'src/notes/zettels/project';
    export let note: Project;
</script>

<CollapsibleNoteHierarchyDisplay
    displayTitle="Child projects"
    noteHierarchy={note.getDescendantWorkUnits()}
    isCollapsed={false}
/>
<CollapsibleNoteHierarchyDisplay
    displayTitle="Note hierarchy"
    noteHierarchy={note.getDescendantNotes()}
    isCollapsed={true}
    sortByNoteType={true}
    displayTitleDecorator={true}
/>
<CollapsibleNoteList
    title="Linked"
    notes={note.getIncomingLinkedNotes()}
    isCollapsed={true}
    groupByNoteType={true}
/>