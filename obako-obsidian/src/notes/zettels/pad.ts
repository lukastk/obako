import Transient from './transient';
import type { FrontmatterSpec } from '../note-frontmatter';

export default class Pad extends Transient {
    static noteTypeStr = "pad";
    static titleDecoratorString = "✎";

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: Pad.noteTypeStr, fixedValue: true },
    };
}
