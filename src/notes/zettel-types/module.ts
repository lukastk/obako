import { TFile } from 'obsidian';
import type { FrontmatterSpec } from 'src/notes/note-frontmatter';
import { getDateFromDateString } from 'src/utils';
import { Project } from './project';
import { ParentableNote } from '../parentable-note';

export class Module extends ParentableNote {
    static noteTypeStr = "mod";
    static noteTypeDisplayName = "Module";
    static noteIcon = "●";

    static statuses = {
        unplanned: "unplanned",
        active: "active",
        paused: "paused",
        done: "done",
        cancelled: "cancelled"
    };

    static statusDecorators = {
        [Module.statuses.unplanned]: "❔",
        [Module.statuses.active]: "",
        [Module.statuses.paused]: "",
        [Module.statuses.done]: "",
        [Module.statuses.cancelled]: "❌",
    }

    getTitlePrefixDecoratorColor(): string {
        if (!this.validate()) {
            return 'var(--text-error)';
        } else {
            switch (this.status) {
                case Module.statuses.unplanned:
                    return 'var(--color-red)';
                case Module.statuses.active:
                    return 'var(--color-blue)';
                case Module.statuses.paused:
                    return 'var(--color-muted)';
                case Module.statuses.done:
                    return 'var(--color-green)';
                case Module.statuses.cancelled:
                    return 'var(--text-muted)';
                default:
                    return '';
            }
        }
    }

    constructor(file: TFile | string) {
        super(file);
        this.startDate = getDateFromDateString(this.frontmatter["mod-start-date"]);
        this.endDate = getDateFromDateString(this.frontmatter["mod-end-date"]);
    }

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "mod-status": { default: Module.statuses.unplanned, type: "string", description: "The status of the module." }, 
            "mod-start-date": { default: "", type: "string", description: "The start date of the module." },
            "mod-end-date": { default: "", type: "string", description: "The end date of the module." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get status(): string {
        return this.frontmatter["mod-status"];
    }

    validate(): boolean {
        let dateValid = (this.startDate && this.endDate) || (this.status === Module.statuses.unplanned);
        let statusValid = Object.values(Module.statuses).includes(this.status);
        let parentValid = (this.parent instanceof Project);
        return super.validate() && dateValid && statusValid && parentValid;
    }

    async setTopPanel(panel: HTMLElement) {
        //super.setTopPanel(panel);

        const { default: ModuleTopPanel } = await import('src/ui-components/top-panels/ModuleTopPanel.svelte');
        new ModuleTopPanel({
            target: panel,
            props: {
                note: this,
            }
        });
    }

    setTitlePrefixDecorator(titleDecoratorEl: HTMLElement) {
        super.setTitlePrefixDecorator(titleDecoratorEl);
        if (!this.validate()) return;
        const statusDecorator = Module.statusDecorators[this.status];
        titleDecoratorEl.innerHTML =  statusDecorator + titleDecoratorEl.innerHTML;
    }
}