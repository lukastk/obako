import { TFile } from 'obsidian';
import { ObakoNote } from '../obako-note';
import type { FrontmatterSpec } from '../note-frontmatter';
import type { NoteHierarchy } from '../note-hierarchy';

import CollapsibleNoteHierarchyDisplay from '../../svelte/CollapsibleNoteHierarchyDisplay.svelte';
import CollapsibleNoteList from 'src/svelte/CollapsibleNoteList.svelte';

export default abstract class Project extends ObakoNote {
    static noteTypeStr = "project";
    static titleDecoratorString = "●";

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: Project.noteTypeStr, fixedValue: true },
    };

    constructor(file: TFile | string) {
        super(file);
    }

    getDescendantWorkUnits(): NoteHierarchy {
        return this.getDescendantNotes([Project]);
    }

    setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);

        new CollapsibleNoteHierarchyDisplay({
            target: panel,
            props: {
                displayTitle: "Child projects",
                noteHierarchy: this.getDescendantWorkUnits(),
                isCollapsed: false,
            }
        });

        new CollapsibleNoteHierarchyDisplay({
            target: panel,
            props: {
                displayTitle: "Note hierarchy",
                noteHierarchy: this.getDescendantNotes(),
                isCollapsed: true,
                sortByNoteType: true,
                displayTitleDecorator: true,
            }
        });

        new CollapsibleNoteList({
            target: panel,
            props: {
                title: "Linked",
                notes: this.getIncomingLinkedNotes(),
                isCollapsed: true,
                groupByNoteType: true,
            }
        });
    }
}
