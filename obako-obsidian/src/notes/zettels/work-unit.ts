import { TFile } from 'obsidian';
import { ObakoNote } from '../obako-note';
import type { FrontmatterSpec } from '../note-frontmatter';
import type { NoteHierarchy } from '../note-hierarchy';

import CollapsibleNoteHierarchyDisplay from '../../svelte/CollapsibleNoteHierarchyDisplay.svelte';
import CollapsibleNoteList from 'src/svelte/CollapsibleNoteList.svelte';

export default abstract class WorkUnit extends ObakoNote {
    static noteTypeStr = "work-unit";
    static titleDecoratorString = "●";

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: WorkUnit.noteTypeStr, fixedValue: true },
    };

    constructor(file: TFile | string) {
        super(file);
    }

    getDescendantWorkUnits(): NoteHierarchy {
        return this.getDescendantNotes([WorkUnit]);
    }

    setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);

        new CollapsibleNoteHierarchyDisplay({
            target: panel,
            props: {
                displayTitle: "Child work units",
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

        // const link = createInternalLinkElement("A link 2", "Autonomy Data Services");
        // panel.appendChild(link);
    }
}
