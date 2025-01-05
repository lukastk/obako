import { createNote, getAllNotesOfType, type NoteCreationData } from 'src/note-loader';
import { CommandPluginComponent } from '../command-plugin-component';
import { getDateStringFromDate } from 'src/utils';
import { Planner } from 'src/notes/planner';
import { Notice } from 'obsidian';

export class Command_OpenTodaysPlanner extends CommandPluginComponent {
    componentName = "Cmd: Open today's planner";
    commandId = 'open-todays-planner';
    commandName = "Open today's planner";

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                const allPlanners = getAllNotesOfType(Planner) as Planner[];
                const todayDateStr = getDateStringFromDate(new Date());

                let todaysPlanner: Planner | null = null;
                for (const planner of allPlanners) {
                    if (planner.name === todayDateStr) {
                        if (todaysPlanner) {
                            new Notice(`Warning: Multiple planners with title ${todayDateStr}.`)
                        }
                        todaysPlanner = planner;
                    }
                }

                if (!todaysPlanner) {
                    const noteData: NoteCreationData = {
                        title: "",
                        noteType: 'planner',
                        extraData: {
                            dateRangeStr: 'today',
                        },
                    };
                    createNote(noteData).then((file) => {
                        setTimeout(() => { // Wait a bit to allow the frontmatter cache to be loaded.
                            if (file)
                                this.app.workspace.openLinkText(file.path, "", true);
                        }, 10);
                    });
                } else {
                    todaysPlanner.open();
                }
            }
        });
    }

    unload() { }
};
