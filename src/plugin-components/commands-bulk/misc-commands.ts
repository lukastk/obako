import { Notice } from "obsidian";
import PluginComponent from "../plugin-component";
import { ObakoNote } from "src/notes/obako-note";
import { Planner } from "src/notes/planner";
import { getAllNotesOfType } from "src/note-loader";

export class Commands_Misc extends PluginComponent {
    load() {
        /*** Toggle consolidation ***/
        this.addCommand('Toggle consolidation', async () => {
            const note: ObakoNote | null = this.getCurrentNote(ObakoNote);
            if (!note) return;
            note.modifyFrontmatter('cons', !note.consolidated);
        });

        /*** Toggle linked/high priority consolidation ***/
        this.addCommand('Toggle linked/high priority consolidation (hp-cons/link-cons)', async () => {
            const note: ObakoNote | null = this.getCurrentNote(ObakoNote);
            if (!note) return;
            const isHpCons = note.isHighPriorityConsolidate;
            note.modifyFrontmatter('is-hp-cons', !isHpCons);
            note.modifyFrontmatter('is-link-cons', isHpCons);
        });

        /** Deactivate and consolidate planner **/
        this.addCommand('Deactivate and consolidate planner', async () => {
            const note: Planner | null = this.getCurrentNote(Planner);
            if (!note) return;
            note.modifyFrontmatter('planner-active', false);
            note.modifyFrontmatter('cons', true);
        });

        /** Open next high-priority consolidate **/
        this.addCommand('Open next high-priority consolidate', async () => {
            const obakoNotes = getAllNotesOfType(ObakoNote);
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const toBeCaptured = obakoNotes
                .filter(note => note.needsConsolidation && note.isHighPriorityConsolidate)
                .filter((note) => {
                    if (note.noteType === "plan") {
                        return note.endDate < startOfToday; // Don't include planners that haven't ended yet.
                    } else {
                        return true;
                    }
                });
            
            toBeCaptured.sort((a, b) => {
                if (a.createdAt && b.createdAt)
                    return b.createdAt.getTime() - a.createdAt.getTime();
                else if (!a.createdAt) return b;
                else return a;
            });
            const toBeCapturedPaths = toBeCaptured.map(note => note.filepath);

            const currNote = this.getCurrentNote();
            let idx = currNote ? toBeCapturedPaths.indexOf(currNote.filepath) : -1;
            if (idx == -1) {
                idx = 0;
            } else {
                idx = (idx + 1) % toBeCaptured.length;
            }

            if (toBeCaptured.length > 0) {
                toBeCaptured[idx].open(false);
            } else {
                new Notice('No high-priority consolidates to open.');
            }
        });
    }

    unload() { }
}
