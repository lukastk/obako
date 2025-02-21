import type { FrontmatterSpec } from '../note-frontmatter';
import { Source } from './source';

export class Entity extends Source {
    static isAbstract = false;
    static noteTypeStr = "ent";
    static noteTypeDisplayName = "Entity";
    static noteIcon = "△";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "url": { default: null, type: "string", description: "The URL of the entity." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }
}
