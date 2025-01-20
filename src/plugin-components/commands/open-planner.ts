import { App, Modal } from "obsidian";

import { createNote, getAllNotesOfType, type NoteCreationData } from 'src/note-loader';
import { CommandPluginComponent } from '../command-plugin-component';
import { getDateStringFromDate, getDateStringFromNaturalLanguage, getWeekNumberStr } from 'src/utils';
import { Planner } from 'src/notes/planner';
import { Notice, Setting } from 'obsidian';

export class Command_OpenPlanner extends CommandPluginComponent {
    componentName = "Cmd: Open planner";
    commandId = 'open-planner';
    commandName = "Open planner";

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new DatePickerModal(this.app, (plannerDateStr) => {
                    const allPlanners = getAllNotesOfType(Planner) as Planner[];

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
                                dateRangeStr: plannerDateStr,
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
                }).open();
            }
        });
    }

    unload() { }
}

class DatePickerModal extends Modal {
    constructor(app: App, onSubmit: (dateStr: string) => void) {
        super(app);
        this.setTitle('Set date');

        let dateStr = '';
        new Setting(this.contentEl)
            .setName('Date')
            .addText((text) =>
                text
                    .setValue(dateStr)
                    .onChange((value) => {
                        dateStr = getDateStringFromNaturalLanguage(value);
                    }));

        // Add event listener for ENTER key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.close();
                onSubmit(dateStr);
            }
        });
    }
}