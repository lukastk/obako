import { TFile } from 'obsidian';
import { Zettel } from '../zettel';
import type { NoteHierarchy } from '../zettel';
import type { FrontmatterSpec } from 'src/notes/note-frontmatter';
import ProjectTopPanel from 'src/top-panels/ProjectTopPanel.svelte';

export class Project extends Zettel {
    static noteTypeStr = "proj";
    static noteTypeDisplayName = "Project";
    static noteIcon = "●";

    constructor(file: TFile | string) {
        super(file);
    }

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "proj-status": { default: "incubation", type: "string", description: "The status of the project." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get status(): string {
        return this.frontmatter["proj-status"];
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