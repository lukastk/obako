import type { FrontmatterSpec } from '../note-frontmatter';
import { Zettel } from '../zettel';

export class Box extends Zettel {
    static isAbstract = false;
    static noteTypeStr = "box";
    static noteTypeDisplayName = "Box";
    static noteIcon = "∷";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "box-creation-date": { default: "", type: "string", description: "The creation date of the box." },
            "box-last-modified-date": { default: "", type: "string", description: "The last modified date of the box." },
            "box-index-name": { default: "", type: "string", description: "The index name of the box." },
            "box-name": { default: "", type: "string", description: "The name of the box." },
            "box-groups": { default: [], type: "array", description: "The groups of the box." },
            "box-missing": { default: false, type: "boolean", description: "Whether the box is missing from the box index." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    validate(): boolean {
        return super.validate() && !this.frontmatter["box-missing"];
    }
}


