import { ItemView, WorkspaceLeaf } from "obsidian";
import PluginComponent from "../plugin-component";
import type { SvelteComponent } from "svelte";
import type ObakoPlugin from "src/plugin";
import { CommandPluginComponent } from "../command-plugin-component";

export interface SvelteViewSettings {
    viewType: string;
    displayName: string;
    viewCompClass: any;
}

export class SvelteView extends ItemView {
    static viewSettings: SvelteViewSettings;
    viewComp!: SvelteComponent;
    compArgs: any = {};

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    get viewSettings(): SvelteViewSettings {
        return this.constructor.viewSettings;
    }

    getViewType() {
        return this.viewSettings.viewType;
    }

    getDisplayText() {
        return this.viewSettings.displayName;
    }

    isInFocus() {
        return this.app.workspace.getActiveViewOfType(this.constructor) === this;
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        this.viewComp = new this.viewSettings.viewCompClass({
            target: container,
            props: {
                isInFocus: () => this.isInFocus(),
                currentView: this,
            },
        });
    }

    async onClose() {
        this.viewComp?.$destroy();
    }
}

export interface SvelteViewPluginComponentSettings {
    viewType: string;
    svelteViewClass: any;

    addRibbonIcon: boolean;
    ribbonIcon: string;
    ribbonIconTooltip: string;
}

export class SvelteViewPluginComponent extends PluginComponent {
    static viewPluginSettings: SvelteViewPluginComponentSettings;

    constructor(plugin: ObakoPlugin) {
        super(plugin);
    }

    get viewPluginSettings(): SvelteViewPluginComponentSettings {
        return this.constructor.viewPluginSettings;
    }

    load() {
        this.plugin.registerView(this.viewPluginSettings.viewType, (leaf) => new this.viewPluginSettings.svelteViewClass(leaf));

        if (this.viewPluginSettings.addRibbonIcon) {
            this.plugin.addRibbonIcon(this.viewPluginSettings.ribbonIcon, this.viewPluginSettings.ribbonIconTooltip, () => {
                this.activateView('right');
            });
        }
    }

    unload() {
        this.app.workspace.detachLeavesOfType(this.viewPluginSettings.viewType);
    }

    async activateView(openIn: string = 'current', viewState: any) {
        let leaf: WorkspaceLeaf;
        const leaves = this.app.workspace.getLeavesOfType(this.viewPluginSettings.viewType);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            switch (openIn) {
                case 'current':
                    leaf = this.app.workspace.getLeaf(false);
                    break;
                case 'new':
                    leaf = this.app.workspace.getLeaf(true);
                    break;
                case 'right':
                    leaf = this.app.workspace.getRightLeaf(false);
                    break;
                default:
                    throw new Error(`Invalid openIn value: ${openIn}`);
            }
        }

        await leaf.setViewState({
            type: this.viewPluginSettings.viewType,
            active: true,
            state: viewState,
        });

        this.app.workspace.revealLeaf(leaf);
    }
}

export abstract class OpenViewCommandPluginComponent extends CommandPluginComponent {
    private svelteViewPluginComponentName: string;

    constructor(plugin: ObakoPlugin, svelteViewPluginComponentName: string) {
        super(plugin);
        this.svelteViewPluginComponentName = svelteViewPluginComponentName;
    }

    async openCommandModal(launchView: (viewStateToSet: any) => void): Promise<any> {
        // No modal by default
        launchView({});
    }

    load() {
        const svelteViewPluginComponent: SvelteViewPluginComponent = this.plugin.pluginComponentLookup[this.svelteViewPluginComponentName] as SvelteViewPluginComponent;

        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                const viewStateToSet = await this.openCommandModal((viewStateToSet) => {
                    const openInNewTab = this.plugin.modifierKeyPressed.meta || this.plugin.modifierKeyPressed.ctrl;
                    const openInRightSidebar = openInNewTab && this.plugin.modifierKeyPressed.shift;

                    let openIn: string;
                    if (openInRightSidebar) openIn = 'right';
                    else if (openInNewTab) openIn = 'new';
                    else openIn = 'current';

                    svelteViewPluginComponent.activateView(openIn, viewStateToSet);
                });
            }
        });
    }
}