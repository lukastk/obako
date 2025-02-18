import { TFile } from 'obsidian';
import { Zettel } from '../zettel';
import type { NoteTree } from '../parentable-note';
import type { FrontmatterSpec } from 'src/notes/note-frontmatter';
import { getDateFromDateString, getFile, parseObsidianLink } from 'src/utils';
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

    startDate: Date | null = null;
    endDate: Date | null = null;

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

        this.startDate = getDateFromDateString(this.frontmatter["proj-start-date"]);
        this.endDate = getDateFromDateString(this.frontmatter["proj-end-date"]);

        // If the date ranges are null, then we get them from its modules
        if (this.startDate === null || this.endDate === null) {
            let earliestStartDate: Date | null = null;
            let latestEndDate: Date | null = null;
            for (const module of this.getModules()) {
                if (earliestStartDate === null || (module.startDate !== null && module.startDate < earliestStartDate)) earliestStartDate = module.startDate;
                if (latestEndDate === null || (module.endDate !== null && module.endDate > latestEndDate)) latestEndDate = module.endDate;
            }

            if (earliestStartDate !== null)
                this.startDate = earliestStartDate;
            if (latestEndDate !== null)
                this.endDate = latestEndDate;
        }
    }

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "proj-status": { default: "unplanned", type: "string", description: "The status of the project." },
            "proj-start-date": { default: "", type: "string", description: "The start date of the project." },
            "proj-end-date": { default: "", type: "string", description: "The end date of the project." },
            "planner-dashboard-group": { default: '', type: "string", skipCreationIfAbsent: true, hideInCreationModal: false, description: "The group to display the project in the planner dashboard. If empty, the project will be displayed in the default group." },
            "hide-in-planner-dashboard": { default: false, type: "boolean", skipCreationIfAbsent: true, hideInCreationModal: false, description: "Whether the note should be hidden in the planner dashboard." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
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
        if (this.status === Project.statuses.active) // Active projects must have a start and end date
            dateValid = this.startDate && this.endDate;
        else if (this.status === Project.statuses.stream) // Streams are not time-bound
            dateValid = !this.startDate && !this.endDate;
        let statusValid = Object.values(Project.statuses).includes(this.status);
        let parentValid = (this.status === Project.statuses.stream) || (this.parent instanceof Project);
        return super.validate() && dateValid && statusValid && parentValid;
    }

    getDescendantProjects(): NoteTree {
        return this.getDescendantNotes([Project]);
    }

    getModules(): Module[] {
        // This is a major hack. Necessary because we have not yet cached the note loader.
        const modules: Module[] = [];
        const backlinks = app.metadataCache.getBacklinksForFile(this.file)?.data;
        for (const [filePath, _] of backlinks) {
            const file = getFile(filePath) as TFile;
            const fileCache = app.metadataCache.getFileCache(file);
            if (fileCache?.frontmatter['notetype'] !== Module.noteTypeStr) continue;
            if (!fileCache?.frontmatter['parent']) continue;
            const parentPath = parseObsidianLink(fileCache?.frontmatter['parent']);
            const parentFile = getFile(parentPath) as TFile;
            if (parentFile.path !== this.file.path) continue;
            modules.push(loadNote(filePath) as Module);
        }
        return modules;
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