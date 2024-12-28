import { TFile } from 'obsidian';
import { ObakoNote } from '../obako-note';
import type { FrontmatterSpec } from '../note-frontmatter';
import type { NoteHierarchy } from '../obako-note';

import ProjectTopPanel from 'src/top-panels/ProjectTopPanel.svelte';

export class Project extends ObakoNote {
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

        new ProjectTopPanel({
            target: panel,
            props: {
                note: this,
            }
        });
    }
}