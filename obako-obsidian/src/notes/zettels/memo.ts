import Zettel from './zettel';
import type { FrontmatterSpec } from '../note-frontmatter';

export default abstract class Memo extends Zettel {
    static noteTypeStr = "memo";
    static titleDecoratorString = "◆";

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: Memo.noteTypeStr, fixedValue: true },
    };
}
