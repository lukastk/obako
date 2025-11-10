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
            "title": { default: "", type: "string", description: "The title of the reference. If not provided, the title of the note itself will be used." },
            "authors": { default: [], type: "array", description: "The authors of the reference." },
            "url": { default: null, type: "string", description: "The URL of the reference." },
            "ref-type": { default: "article", type: "string", description: "The type of the reference (e.g., article, book, etc.)." },
            "is-reproduction": { default: false, type: "boolean", skipCreationIfAbsent: false, hideInCreationModal: false, description: "Whether the note is a reproduction of the reference." },
            "read-date": { default: null, type: "date", description: "The date the reference was read." },
            "on-reading-list": { default: false, type: "boolean", skipCreationIfAbsent: false, hideInCreationModal: false, description: "Whether the note is on the reading list." },
            "reading-category": { default: "", type: "string", description: "The category of the reading (e.g., )." },
            "reading-status": { default: Reference.statuses.unread, type: "string", description: "The status of the reference." },
            "reading-priority": { default: 0, type: "number", skipCreationIfAbsent: false, hideInCreationModal: false, description: "The priority of the note on the reading list." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get title(): string {
        if (this.frontmatter["title"]) return this.frontmatter["title"];
        return this.name;
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
