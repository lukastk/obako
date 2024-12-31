import { ItemView, WorkspaceLeaf } from "obsidian";
import PluginComponent from "../plugin-component";
import type { SvelteComponent } from "svelte";
import type ObakoPlugin from "src/plugin";

export interface SvelteViewSettings {
    viewType: string;
    displayName: string;
    viewCompClass: any;
}

export class SvelteView extends ItemView {
    static viewSettings: SvelteViewSettings;
    viewComp!: SvelteComponent;

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

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        this.viewComp = new this.viewSettings.viewCompClass({
            target: container,
        });
    }

    async onClose() {
        this.viewComp?.$destroy();
    }
}

export interface SvelteViewPluginComponentSettings {
    viewType: string;
    svelteViewClass: any;

    addCommand: boolean;
    commandId: string;
    commandName: string;

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

        if (this.viewPluginSettings.addCommand) {
            this.plugin.addCommand({
                id: this.viewPluginSettings.commandId,
                name: this.viewPluginSettings.commandName,
                callback: async () => {
                    const openInNewTab = this.plugin.modifierKeyPressed.meta || this.plugin.modifierKeyPressed.ctrl;
                    const openInRightSidebar = openInNewTab && this.plugin.modifierKeyPressed.shift;

                    let openIn: string;
                    if (openInRightSidebar) {
                        openIn = 'right';
                    } else if (openInNewTab) {
                        openIn = 'new';
                    } else {
                        openIn = 'current';
                    }

                    this.activateView(openIn);
                }
            });
        }
    }

	unload() {
		this.app.workspace.detachLeavesOfType(this.viewPluginSettings.viewType);
	}

	async activateView(openIn: string = 'current') {
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
		});

		this.app.workspace.revealLeaf(leaf);
	}
}