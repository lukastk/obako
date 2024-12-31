import type { FrontmatterSpec } from '../note-frontmatter';
import { Zettel } from '../zettel';

export class Capture extends Zettel {
    static noteTypeStr = "capture";
    static noteTypeDisplayName = "Capture";
    static titleDecoratorString = "﹅";
}
