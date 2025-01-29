import { TFile } from 'obsidian';
import { Zettel } from '../zettel';
import type { NoteHierarchy } from '../zettel';
import type { FrontmatterSpec } from 'src/notes/note-frontmatter';
import ProjectTopPanel from 'src/top-panels/ProjectTopPanel.svelte';
import { isDateValid } from 'src/utils';

export class Project extends Zettel {
    static noteTypeStr = "proj";
    static noteTypeDisplayName = "Project";
    static noteIcon = "❖";

    startDate: Date | null = null;
    endDate: Date | null = null;

    constructor(file: TFile | string) {
        super(file);

        this.startDate = new Date(this.frontmatter["proj-start-date"]);
        this.startDate = isDateValid(this.startDate) ? this.startDate : null;
        this.endDate = new Date(this.frontmatter["proj-end-date"]);
        this.endDate = isDateValid(this.endDate) ? this.endDate : null;
    }

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            /* stream, in-progress, paused, idea, incubation, cancelled, done */
            "proj-status": { default: "incubation", type: "string", description: "The status of the project." }, 
            "proj-start-date": { default: "", type: "string", description: "The start date of the project." },
            "proj-end-date": { default: "", type: "string", description: "The end date of the project." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get status(): string {
        return this.frontmatter["proj-status"];
    }

    getDescendantProjects(): NoteHierarchy {
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