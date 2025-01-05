import { createNote, getAllNotesOfType, type NoteCreationData } from 'src/note-loader';
import { CommandPluginComponent } from '../command-plugin-component';
import { getDateStringFromDate, getWeekNumberStr } from 'src/utils';
import { Planner } from 'src/notes/planner';
import { Notice } from 'obsidian';

abstract class OpenPlannerCommand extends CommandPluginComponent {
    abstract getDateStr(): string;

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                const allPlanners = getAllNotesOfType(Planner) as Planner[];
                const plannerDateStr = this.getDateStr();

                let selPlanner: Planner | null = null;
                for (const planner of allPlanners) {
                    if (planner.name === plannerDateStr) {
                        if (selPlanner) {
                            new Notice(`Warning: Multiple planners with title ${plannerDateStr}.`)
                        }
                        selPlanner = planner;
                    }
                }

                if (!selPlanner) {
                    const noteData: NoteCreationData = {
                        title: "",
                        noteType: 'planner',
                        extraData: {
                            dateRangeStr: this.getDateStr(),
                        },
                    };
                    createNote(noteData).then((file) => {
                        setTimeout(() => { // Wait a bit to allow the frontmatter cache to be loaded.
                            if (file)
                                this.app.workspace.openLinkText(file.path, "", true);
                        }, 10);
                    });
                } else {
                    selPlanner.open(true);
                }
            }
        });
    }
    
    unload() { }
}

export class Command_OpenTodayPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open today's planner";
    commandId = 'open-today-planner';
    commandName = "Open today's planner";

    getDateStr(): string {
        return getDateStringFromDate(new Date());
    }
};

export class Command_OpenYesterdaysPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open yesterday's planner";
    commandId = 'open-yesterdays-planner';
    commandName = "Open yesterday's planner";

    getDateStr(): string {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return getDateStringFromDate(date);
    }
};

export class Command_OpenTomorrowsPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open tomorrow's planner";
    commandId = 'open-tomorrows-planner';
    commandName = "Open tomorrow's planner";

    getDateStr(): string {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return getDateStringFromDate(date);
    }
};

export class Command_OpenThisWeeksPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open this week's planner";
    commandId = 'open-this-weeks-planner';
    commandName = "Open this week's planner";

    getDateStr(): string {
        return `${(new Date()).getFullYear()} w${getWeekNumberStr(new Date())}`;
    }
};

export class Command_OpenLastWeeksPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open last week's planner";
    commandId = 'open-last-weeks-planner';
    commandName = "Open last week's planner";

    getDateStr(): string {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return `${date.getFullYear()} w${getWeekNumberStr(date)}`;
    }
};

export class Command_OpenNextWeeksPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open next week's planner";
    commandId = 'open-next-weeks-planner';
    commandName = "Open next week's planner";

    getDateStr(): string {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return `${date.getFullYear()} w${getWeekNumberStr(date)}`;
    }
};


export class Command_OpenThisMonthsPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open this month's planner";
    commandId = 'open-this-months-planner';
    commandName = "Open this month's planner";

    getDateStr(): string {
        return getDateStringFromDate(new Date()).slice(0, 7);
    }
};

export class Command_OpenLastMonthsPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open last month's planner";
    commandId = 'open-last-months-planner';
    commandName = "Open last month's planner";

    getDateStr(): string {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return getDateStringFromDate(date).slice(0, 7);
    }
};

export class Command_OpenNextMonthsPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open next month's planner";
    commandId = 'open-next-months-planner';
    commandName = "Open next month's planner";

    getDateStr(): string {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return getDateStringFromDate(date).slice(0, 7);
    }
};

export class Command_OpenThisQuartersPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open this quarter's planner";
    commandId = 'open-this-quarters-planner';
    commandName = "Open this quarter's planner";

    getDateStr(): string {
        return `${(new Date()).getFullYear()} Q${Math.floor((new Date()).getMonth() / 3) + 1}`;
    }
};

export class Command_OpenLastQuartersPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open last quarter's planner";
    commandId = 'open-last-quarters-planner';
    commandName = "Open last quarter's planner";

    getDateStr(): string {
        const date = new Date();
        date.setMonth(date.getMonth() - 3);
        return `${date.getFullYear()} Q${Math.floor(date.getMonth() / 3) + 1}`;
    }
};

export class Command_OpenNextQuartersPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open next quarter's planner";
    commandId = 'open-next-quarters-planner';
    commandName = "Open next quarter's planner";

    getDateStr(): string {
        const date = new Date();
        date.setMonth(date.getMonth() + 3);
        return `${date.getFullYear()} Q${Math.floor(date.getMonth() / 3) + 1}`;
    }
};

export class Command_OpenThisYearsPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open this year's planner";
    commandId = 'open-this-years-planner';
    commandName = "Open this year's planner";

    getDateStr(): string {
        return `${(new Date()).getFullYear()}`;
    }
};

export class Command_OpenLastYearsPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open last year's planner";
    commandId = 'open-last-years-planner';
    commandName = "Open last year's planner";

    getDateStr(): string {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 1);
        return `${date.getFullYear()}`;
    }
};

export class Command_OpenNextYearsPlanner extends OpenPlannerCommand {
    componentName = "Cmd: Open next year's planner";
    commandId = 'open-next-years-planner';
    commandName = "Open next year's planner";

    getDateStr(): string {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return `${date.getFullYear()}`;
    }
};