import type { FrontmatterSpec } from '../note-frontmatter';
import { Transient } from './transient';

export class Pad extends Transient {
    static isAbstract = false;
    static noteTypeStr = "pad";
    static noteTypeDisplayName = "Pad";
    static noteIcon = "✎";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "pad-in-writing": { default: true, type: "boolean", skipCreationIfAbsent: false, hideInCreationModal: true, description: "Whether the pad is in writing." },
        };
        spec.notetype.default = this.noteTypeStr;
        spec['is-hp-cons'].default = true;
        return spec;
    }

    get inWriting(): boolean {
        return this.frontmatter["pad-in-writing"];
    }

    get needsConsolidation(): boolean {
        return super.needsConsolidation && !this.consolidated && !this.inWriting;
    }

    getTitlePrefixDecoratorColor(): string {
        if (!this.validate()) {
            return 'var(--text-error)';
        } else {
            return this.inWriting ? 'var(--color-blue)' : 'var(--text-faint)';
        }
    }
}
