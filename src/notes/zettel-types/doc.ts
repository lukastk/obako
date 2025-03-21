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
    };

    static statusOrder = {
        [Doc.statuses.writing]: 0,
        [Doc.statuses.done]: 1,
        [Doc.statuses.archived]: 2,
    };

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

    getTitlePrefixDecoratorColor(): string {
        if (!this.validate()) {
            return 'var(--text-error)';
        } else {
            switch (this.status) {
                case Doc.statuses.writing:
                    return 'var(--color-blue)';
                case Doc.statuses.done:
                    return 'var(--color-green)';
                case Doc.statuses.archived:
                    return 'var(--text-faint)';
                default:
                    return '';
            }
        }
    }
}
