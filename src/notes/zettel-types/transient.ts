import type { FrontmatterSpec } from '../note-frontmatter';
import { Zettel } from '../zettel';

export abstract class Transient extends Zettel {
    static isAbstract = true;
    static noteTypeStr = "transient";
    static noteTypeDisplayName = "Transient";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
        };
        spec.notetype.default = this.noteTypeStr;
        spec.cons.default = false;
        spec.cons.skipCreationIfAbsent = false;
        spec['is-hp-cons'].default = false;
        spec['is-hp-cons'].skipCreationIfAbsent = false;
        return spec;
    }
}
