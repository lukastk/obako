import { TFile } from "obsidian";

export function registerOnModify(callback: (file: TFile) => void) {
    _obako_plugin.registerEvent(
        app.vault.on("modify", callback),
    );
}
