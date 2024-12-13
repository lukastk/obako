import { App } from "obsidian";
import type ObakoPlugin from "../plugin";
import type { ObakoSettingsTab } from "../settings";

export default abstract class PluginComponent {
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
}
