import type { FrontmatterSpec } from '../note-frontmatter';
import { Source } from './source';

export class Reference extends Source {
    static isAbstract = false;
    static noteTypeStr = "ref";
    static noteTypeDisplayName = "Reference";
    static noteIcon = "⊞";

    static statuses = {
        unread: "unread",
        reading: "reading",
        read: "read",
        archived: "archived",
    };

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "author": { default: "", type: "string", description: "The author of the reference." },
            "url": { default: null, type: "string", description: "The URL of the reference." },
            "ref-status": { default: Reference.statuses.unread, type: "string", description: "The status of the reference." },
            "ref-type": { default: "article", type: "string", description: "The type of the reference (e.g., article, book, etc.)." },
            "read-date": { default: null, type: "date", description: "The date the reference was read." },
            "is-reproduction": { default: false, type: "boolean", skipCreationIfAbsent: false, hideInCreationModal: false, description: "Whether the note is a reproduction of the reference." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get status(): string {
        return this.frontmatter["ref-status"];
    }

    get refType(): string {
        return this.frontmatter["ref-type"];
    }

    validate(): boolean {
        if (this.status === Reference.statuses.read && !this.frontmatter["read-date"]) return false;
        if (this.refType === undefined) return false;
        return true;
    }
}
