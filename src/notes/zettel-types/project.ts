import { TFile } from 'obsidian';
import { Zettel } from '../zettel';
import type { NoteHierarchy } from '../zettel';

import ProjectTopPanel from 'src/top-panels/ProjectTopPanel.svelte';

export class Project extends Zettel {
    static noteTypeStr = "proj";
    static noteTypeDisplayName = "Project";
    static titleDecoratorString = "●";

    constructor(file: TFile | string) {
        super(file);
    }

    get status(): string {
        return this.frontmatter.status;
    }

    getDescendantWorkUnits(): NoteHierarchy {
        return this.getDescendantZettels([Project]);
    }

    setTopPanel(panel: HTMLElement) {
        //super.setTopPanel(panel);

        new ProjectTopPanel({
            target: panel,
            props: {
                note: this,
            }
        });
    }
}