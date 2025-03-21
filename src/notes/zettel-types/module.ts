import { TFile } from 'obsidian';
import type { FrontmatterSpec } from 'src/notes/note-frontmatter';
import { getDateFromDateString } from 'src/utils';
import { Project } from './project';
import { ParentableNote } from '../parentable-note';

export class Module extends ParentableNote {
    static isAbstract = false;
    static noteTypeStr = "mod";
    static noteTypeDisplayName = "Module";
    static noteIcon = "●";
    
    startDate: Date | null = null;
    endDate: Date | null = null;

    static statuses = {
        unplanned: "unplanned",
        active: "active",
        paused: "paused",
        done: "done",
        cancelled: "cancelled"
    };

    static statusOrder = {
        [Module.statuses.unplanned]: 0,
        [Module.statuses.active]: 1,
        [Module.statuses.paused]: 2,
        [Module.statuses.done]: 3,
        [Module.statuses.cancelled]: 4,
    }

    static statusDecorators = {
        [Module.statuses.unplanned]: "❔",
        [Module.statuses.active]: "⏩️",
        [Module.statuses.paused]: "❄️",
        [Module.statuses.done]: "✅",
        [Module.statuses.cancelled]: "❌",
    }

    getTitlePrefixDecoratorColor(): string {
        if (!this.validate()) {
            return 'var(--text-error)';
        } else {
            switch (this.status) {
                // case Module.statuses.unplanned:
                //     return 'var(--color-red)';
                // case Module.statuses.active:
                //     return 'var(--color-blue)';
                // case Module.statuses.paused:
                //     return 'var(--color-muted)';
                // case Module.statuses.done:
                //     return 'var(--color-green)';
                // case Module.statuses.cancelled:
                //     return 'var(--text-muted)';
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
            "planner-dashboard-group":  { default: '', type: "string", skipCreationIfAbsent: true, hideInCreationModal: false, description: "The group to display the module in the planner dashboard. If empty, the module will be displayed in the default group." },
            "hide-in-planner-dashboard": { default: false, type: "boolean", skipCreationIfAbsent: true, hideInCreationModal: false, description: "Whether the note should be hidden in the planner dashboard." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get status(): string {
        return this.frontmatter["mod-status"];
    }

    get plannerDashboardGroup(): string {
        return this.frontmatter['planner-dashboard-group'];
    }

    get hideInPlannerDashboard(): boolean {
        return this.frontmatter['hide-in-planner-dashboard'];
    }

    get needsAction(): boolean {
        const conds = [
            !this.validate(),
            this.status === Module.statuses.unplanned,
            this.status === Module.statuses.active && this.endDate && (this.endDate < new Date()),
        ];
        return conds.some(cond => cond);
    }

    get isRelevantToMe(): boolean {
        return !('relevant-to-me' in this.frontmatter) || this.frontmatter['relevant-to-me'];
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