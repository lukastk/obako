import { Notice } from "obsidian";
import PluginComponent from "../plugin-component";
import { ObakoNote } from "src/notes/obako-note";
import { Planner } from "src/notes/planner";

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
    }

    unload() { }
}
