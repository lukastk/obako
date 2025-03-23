import type { FrontmatterSpec } from '../note-frontmatter';
import { Zettel } from '../zettel';

export class Memo extends Zettel {
    static isAbstract = false;
    static noteTypeStr = "memo";
    static noteTypeDisplayName = "Memo";
    static noteIcon = "◆";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "memo-complete": { default: false, type: "boolean", skipCreationIfAbsent: false, hideInCreationModal: true, description: "Whether the memo is complete." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }
}
