import { TFile } from 'obsidian';
import { BasicNote } from './basic-note';
import type { FrontmatterSpec } from './note-frontmatter';

export abstract class ObakoNote extends BasicNote {
    static noteTypeStr = "obako-note";
    static noteTypeDisplayName = "Obako Note";
    static titleDecoratorString = "?obako-note";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = super.getFrontmatterSpec();
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    constructor(file: TFile | string) {
        super(file);
    }

    setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);
    }
}