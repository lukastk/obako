import type { FrontmatterSpec } from '../note-frontmatter';
import { Zettel } from '../zettel';

export class Doc extends Zettel {
    static isAbstract = false;
    static noteTypeStr = "doc";
    static noteTypeDisplayName = "Doc";
    static noteIcon = "❐";

    static statuses = {
        writing: "writing",
        done: "done",
        archived: "archived",
    }

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "doc-status": { default: "writing", type: "string", description: "The status of the document." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get status(): string {
        return this.frontmatter["doc-status"];
    }

    validate(): boolean {
        return super.validate() && this.status in Doc.statuses;
    }
}
