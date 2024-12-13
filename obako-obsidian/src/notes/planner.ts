import type { FrontmatterSpec } from './note-frontmatter';
import { ObakoNote } from './obako-note';

export default class Planner extends ObakoNote {
    static noteTypeStr = "planner";
    static titleDecoratorString = "𝝣";

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: Planner.noteTypeStr, fixedValue: true },
    };
}
