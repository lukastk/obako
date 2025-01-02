import PluginComponent from "./plugin-component";

export abstract class CommandPluginComponent extends PluginComponent {
    commandId!: string;
    commandName!: string;

    static getDefaultSettings(): any {
        return {
            shortcode: "",
        };
    }

    getCommandName(): string {
        const globalPrefix = this.plugin.settings?.globalCommandPrefix;
        const shortcode = this.plugin.settings?.pluginComponentSettings[this.constructor.name]?.shortcode || '';
        const prefix = `${globalPrefix}${shortcode}`;
        if (prefix) 
            return `${prefix} ${this.commandName}`;
        else
            return this.commandName;
    }
}