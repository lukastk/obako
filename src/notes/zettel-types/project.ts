import { TFile } from 'obsidian';
import { Zettel } from '../zettel';
import type { NoteTree } from '../parentable-note';
import type { FrontmatterSpec } from 'src/notes/note-frontmatter';
import { getDateFromDateString, getDateStringFromDate, getFile, parseObsidianLink } from 'src/utils';
import { Module } from './module';
import { loadNote } from 'src/note-loader';


export class Project extends Zettel {
    static isAbstract = false;
    static noteTypeStr = "proj";
    static noteTypeDisplayName = "Project";
    static noteIcon = "❖";

    static statuses = {
        stream: "stream",
        idea: "idea",
        unconfirmed: "unconfirmed",
        unplanned: "unplanned",
        active: "active",
        paused: "paused",
        cancelled: "cancelled",
        done: "done"
    };

    static statusDecorators = {
        [Project.statuses.stream]: "🌀",
        [Project.statuses.idea]: "💡",
        [Project.statuses.unconfirmed]: "🤔",
        [Project.statuses.unplanned]: "❔",
        [Project.statuses.active]: "🟢",
        [Project.statuses.paused]: "⏸️",
        [Project.statuses.done]: "✅",
        [Project.statuses.cancelled]: "❌",
    }

    getTitlePrefixDecoratorColor(): string {
        if (!this.validate()) {
            return 'var(--text-error)';
        } else {
            switch (this.status) {
                /*
                case Project.statuses.stream:
                    return 'var(--color-purple)';
                case Project.statuses.idea:
                    return 'var(--color-yellow)';
                case Project.statuses.unconfirmed:
                    return 'var(--color-orange)';
                case Project.statuses.active:
                    return 'var(--color-blue)';
                case Project.statuses.paused:
                    return 'var(--color-muted)';
                case Project.statuses.cancelled:
                    return 'var(--color-muted)';;
                case Project.statuses.done:
                    return 'var(--color-green)';*/
                default:
                    return '';
            }
        }
    }

    constructor(file: TFile | string) {
        super(file);
    }

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "proj-status": { default: "unplanned", type: "string", description: "The status of the project." },
            "proj-start-date": { default: "", type: "string", description: "The start date of the project." },
            "proj-end-date": { default: "", type: "string", description: "The end date of the project." },
            "proj-completion-date": { default: "", type: "string", description: "The completion date of the project." },
            "planner-dashboard-group": { default: '', type: "string", skipCreationIfAbsent: true, hideInCreationModal: false, description: "The group to display the project in the planner dashboard. If empty, the project will be displayed in the default group." },
            "hide-in-planner-dashboard": { default: false, type: "boolean", skipCreationIfAbsent: true, hideInCreationModal: false, description: "Whether the note should be hidden in the planner dashboard." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get startDate(): Date | null {
        let startDate = getDateFromDateString(this.frontmatter["proj-start-date"]);
        if (startDate === null) {
            let earliestStartDate: Date | null = null;
            for (const module of this.getModules()) {
                if (earliestStartDate === null || (module.startDate !== null && module.startDate < earliestStartDate)) earliestStartDate = module.startDate;
            }
            startDate = earliestStartDate;
        }
        return startDate;
    }

    get endDate(): Date | null {
        let endDate = getDateFromDateString(this.frontmatter["proj-end-date"]);
        if (endDate === null) {
            let latestEndDate: Date | null = null;
            for (const module of this.getModules()) {
                if (latestEndDate === null || (module.endDate !== null && module.endDate > latestEndDate)) latestEndDate = module.endDate;
            }
            endDate = latestEndDate;
        }
        return endDate;
    }

    get status(): string {
        return this.frontmatter["proj-status"];
    }

    get modules(): Module[] {
        return this.getModules();
    }

    get plannerDashboardGroup(): string {
        return this.frontmatter['planner-dashboard-group'];
    }

    get hideInPlannerDashboard(): boolean {
        return this.frontmatter['hide-in-planner-dashboard'];
    }

    validate(): boolean {
        let dateValid = true;
        let completionDateValid = true;
        if (this.status === Project.statuses.active) // Active projects must have a start and end date
            dateValid = this.startDate && this.endDate;
        else if (this.status === Project.statuses.stream) // Streams are not time-bound
            dateValid = !this.frontmatter["proj-start-date"] && !this.frontmatter["proj-end-date"];
        if (this.status === Project.statuses.done)
            completionDateValid = this.frontmatter["proj-completion-date"];
        let statusValid = Object.values(Project.statuses).includes(this.status);
        let parentValid = (this.status === Project.statuses.stream) || (this.parent instanceof Project);
        return super.validate() && dateValid && completionDateValid && statusValid && parentValid;
    }

    getDescendantProjects(): NoteTree {
        return this.getDescendantNotes([Project]);
    }

    getModules(): Module[] {
        return this.getChildNotes().filter(note => note instanceof Module);
    }

    getModuleDateBreakdown() {
        const breakdown = [];
        const modules = this.getModules().sort((a, b) => a.startDate?.getTime() - b.startDate?.getTime());

        for (const module of modules) {
            const startDate = module.startDate ? getDateStringFromDate(module.startDate) : "?";
            const endDate = module.endDate ? getDateStringFromDate(module.endDate) : "?";
            const status = module.status;
            const name = module.name;

            breakdown.push(`**${name}** (${module.status})\n${startDate} - ${endDate}`);
        }

        return breakdown.join("\n\n");
    }

    async setTopPanel(panel: HTMLElement) {
        //super.setTopPanel(panel);

        const { default: ProjectTopPanel } = await import('src/ui-components/top-panels/ProjectTopPanel.svelte');
        new ProjectTopPanel({
            target: panel,
            props: {
                note: this,
            }
        });
    }

    setTitlePrefixDecorator(titleDecoratorEl: HTMLElement) {
        super.setTitlePrefixDecorator(titleDecoratorEl);
        if (!this.validate()) return;
        const statusDecorator = Project.statusDecorators[this.status];
        titleDecoratorEl.innerHTML = statusDecorator + titleDecoratorEl.innerHTML;
    }
}