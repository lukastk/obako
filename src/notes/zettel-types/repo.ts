import type { FrontmatterSpec } from '../note-frontmatter';
import { Zettel } from '../zettel';

export class Repo extends Zettel {
    static isAbstract = false;
    static noteTypeStr = "repo";
    static noteTypeDisplayName = "Repo";
    static noteIcon = "∷";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "repo-creation-date": { default: "", type: "string", description: "The creation date of the repository." },
            "repo-last-modified-date": { default: "", type: "string", description: "The last modified date of the repository." },
            "repo-index-name": { default: "", type: "string", description: "The index name of the repository." },
            "repo-name": { default: "", type: "string", description: "The name of the repository." },
            "repo-groups": { default: [], type: "array", description: "The groups of the repository." },
            "repo-missing": { default: false, type: "boolean", description: "Whether the repository is missing from the repo index." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    validate(): boolean {
        return super.validate() && !this.frontmatter["repo-missing"];
    }
}


