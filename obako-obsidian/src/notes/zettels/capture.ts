import type { FrontmatterSpec } from '../note-frontmatter';
import Zettel from './zettel';

export default class Capture extends Zettel {
    static noteTypeStr = "capture";
    static titleDecoratorString = "﹅";

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: Capture.noteTypeStr, fixedValue: true },
    };
}
