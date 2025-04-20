import type { FrontmatterSpec } from '../note-frontmatter';
import { Zettel } from '../zettel';

export class Repo extends Zettel {
    static isAbstract = false;
    static noteTypeStr = "repo";
    static noteTypeDisplayName = "Repo";
    static noteIcon = "∷";

    static statuses = {
        writing: "writing",
        done: "done",
        archived: "archived",
    };

    static statusOrder = {
        [Repo.statuses.writing]: 0,
        [Repo.statuses.done]: 1,
        [Repo.statuses.archived]: 2,
    };

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "repo-status": { default: "writing", type: "string", description: "The status of the repository." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get status(): string {
        return this.frontmatter["repo-status"];
    }

    validate(): boolean {
        return super.validate() && this.status in Repo.statuses;
    }

    getTitlePrefixDecoratorColor(): string {
        if (!this.validate()) {
            return 'var(--text-error)';
        } else {
            switch (this.status) {
                case Repo.statuses.writing:
                    return 'var(--color-blue)';
                case Repo.statuses.done:
                    return 'var(--color-green)';
                case Repo.statuses.archived:
                    return 'var(--text-faint)';
                default:
                    return '';
            }
        }
    }
}


