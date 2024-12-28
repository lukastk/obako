import { Transient } from './transient';
import type { FrontmatterSpec } from '../note-frontmatter';

export class Log extends Transient {
    static noteTypeStr = "log";
    static titleDecoratorString = "⁍";

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: Log.noteTypeStr, fixedValue: true },
    };
}
