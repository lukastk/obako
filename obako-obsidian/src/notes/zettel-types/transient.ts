import type { FrontmatterSpec } from '../note-frontmatter';
import { Zettel } from '../zettel';

export abstract class Transient extends Zettel {
    static noteTypeStr = "transient";
    static noteTypeDisplayName = "Transient";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
        };
        spec.notetype.default = this.noteTypeStr;
        spec.cons.default = false;
        spec.cons.skipCreationIfAbsent = false;
        spec['cons-hp'].default = false;
        spec['cons-hp'].skipCreationIfAbsent = false;
        return spec;
    }
}
