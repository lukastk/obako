import type ObakoPlugin from "../plugin";
import PluginComponent from "./plugin-component";

export abstract class ObakoCommandPluginComponent extends PluginComponent {
    commandId!: string;
    commandName!: string;

    constructor(plugin: ObakoPlugin) {
        super(plugin);

        this.commandName = `${plugin.settings?.commandPrefix} ${this.commandName}`;
        console.log(this.commandName);
    }
}