import { loadNote } from 'src/note-loader';
import { CommandPluginComponent } from '../command-plugin-component';
import { Planner } from 'src/notes/planner';
import { Notice } from 'obsidian';
import { addDays, getWeekNumberStr } from 'src/utils';
import { getDateStringFromDate } from 'src/utils';

export class Command_GetPlannerTemplate extends CommandPluginComponent {
    componentName = 'Cmd: Get Planner Template';
    commandId = 'get-planner-template';
    commandName = 'Get Planner Template';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                const file = this.plugin.app.workspace.getActiveFile();
                const planner = loadNote(file) as Planner;

                if (planner.noteType !== Planner.noteTypeStr) {
                    new Notice('This is not a planner note');
                    return;
                }

                const plannerFolder = this.plugin.settings.noteTypeFolders[Planner.noteTypeStr];
                const breakdowns: any[] = [];

                if (planner.rangeType === 'week') {
                    let currentDay = 0;

                    for (let i = 0; i < 7; i++) {
                        const date = addDays(planner.date, i);
                        const dateStr = getDateStringFromDate(date);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

                        breakdowns.push({
                            link: `${plannerFolder}/${dateStr}`,
                            title: `${dayName}`,
                        });
                    }
                } else if (planner.rangeType === 'month') {
                    let currentDate = planner.date;
                    while (currentDate <= planner.endDate) {
                        const weekPlannerLink = `${plannerFolder}/${currentDate.getFullYear()} w${getWeekNumberStr(currentDate)}`;
                        const weeksInMonth = breakdowns.map(b => b.link);
                        if (!weeksInMonth.includes(weekPlannerLink)) {
                            breakdowns.push({
                                link: weekPlannerLink,
                                title: `Week ${getWeekNumberStr(currentDate)}`,
                            });
                        }
                        currentDate = addDays(currentDate, 1);
                    }
                } else if (planner.rangeType === 'quarter') {
                    const currentDate = planner.date;
                    for (let i = 0; i < 3; i++) {
                        const year = currentDate.getFullYear();
                        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                        const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
                        breakdowns.push({
                            link: `${plannerFolder}/${year}-${month}`,
                            title: `${monthName}`,
                        });
                        currentDate.setMonth(currentDate.getMonth() + 1);
                    }
                } else if (planner.rangeType === 'year') {
                    const year = planner.date.getFullYear();
                    for (let i = 0; i < 4; i++) {
                        breakdowns.push({
                            link: `${plannerFolder}/${year} Q${i + 1}`,
                            title: `Q${i + 1}`,
                        });
                    }
                }

                const md_breakdown = breakdowns.map(b => `## [[${b.link}|${b.title}]]\n![[${b.link}#Plan]]`).join('\n\n');
                const md = `# Plan\n\n# Breakdown\n\n${md_breakdown}`.trim();
                navigator.clipboard.writeText(md);
            }
        });
    }

    unload() { }
};
