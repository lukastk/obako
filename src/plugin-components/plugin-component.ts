import { App, MarkdownView, Notice } from "obsidian";
import type ObakoPlugin from "../plugin";
import type { ObakoSettingsTab } from "../settings";
import { loadNote } from "src/note-loader";
import type { BasicNote } from "src/notes/basic-note";

export default abstract class PluginComponent {
    componentName!: string;

    plugin: ObakoPlugin;
    app: App;

    constructor(plugin: ObakoPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
    }

    abstract load(): void;
    abstract unload(): void;

    static getDefaultSettings(): any { return {}; }

    displaySettings(settingTab: ObakoSettingsTab, containerEl: HTMLElement): void { }

    get settings(): any {
        if (!this.plugin.settings.pluginComponentSettings)
            this.plugin.settings.pluginComponentSettings = {};
        return this.plugin.settings.pluginComponentSettings[this.constructor.name];
    }

    addCommand(commandName: string, callback: () => void) {
        const globalPrefix = this.plugin.settings?.globalCommandPrefix;
        const commandId = commandName.toLowerCase().replace(' ', '-');

        if (globalPrefix) {
            commandName = `${globalPrefix} ${commandName}`;
        }

        this.plugin.addCommand({
            id: commandId,
            name: commandName,
            callback: callback
        });
    }

    getCurrentNote(noteType): BasicNote | null {
        const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
        const editor = leaf?.leaf?.view?.editor;
        const notePath = leaf?.path;

        const note: BasicNote|null = notePath ? loadNote(notePath) : null;
        if (!note) return null;

        if (noteType && !(note instanceof noteType)) {
            new Notice('Incorrect note type. Expected ' + noteType.noteTypeDisplayName + ', got ' + note.noteTypeDisplayName);
            return null;
        }
        return note;
    }
}
