import { TFile } from 'obsidian';
import { Zettel } from '../zettel';
import type { NoteHierarchy } from '../zettel';
import type { FrontmatterSpec } from 'src/notes/note-frontmatter';
import ModuleTopPanel from 'src/top-panels/ModuleTopPanel.svelte';

export class Module extends Zettel {
    static noteTypeStr = "mod";
    static noteTypeDisplayName = "Module";
    static noteIcon = "◆";

    constructor(file: TFile | string) {
        super(file);
    }

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            /* not-started, in-progress, paused, done, cancelled */
            "mod-status": { default: "not-started", type: "string", description: "The status of the module." }, 
            "mod-start-date": { default: "", type: "string", description: "The start date of the module." },
            "mod-end-date": { default: "", type: "string", description: "The end date of the module." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get status(): string {
        return this.frontmatter["mod-status"];
    }

    setTopPanel(panel: HTMLElement) {
        //super.setTopPanel(panel);

        new ModuleTopPanel({
            target: panel,
            props: {
                note: this,
            }
        });
    }
}