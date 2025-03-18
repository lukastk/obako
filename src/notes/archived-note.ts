import type { FrontmatterSpec } from './note-frontmatter';
import { ObakoNote } from './obako-note'

export class ArchivedNote extends ObakoNote {
    static isAbstract = false;
    static noteTypeStr = "arch";
    static noteTypeDisplayName = "Archived";
    static noteIcon = "🗑️";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
        };
        spec.archived.default = true;
        spec.archived.skipCreationIfAbsent = false;
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }
}
