import { Zettel } from './zettel';
import type { FrontmatterSpec } from '../note-frontmatter';

export abstract class Transient extends Zettel {
    static noteTypeStr = "transient";

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: Transient.noteTypeStr, fixedValue: true },
    };
}
