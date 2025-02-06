/**
 * RSVP lines
 * RSVP selection
 * RSVP clipboard
 */

import { WorkspaceLeaf } from "obsidian";
import type { ViewStateResult } from "obsidian";
import { SvelteView, SvelteViewPluginComponent, type SvelteViewPluginComponentSettings, type SvelteViewSettings } from "./svelte-view";
import type ObakoPlugin from "src/plugin";
import RapidSerialVisualPresenter from "src/ui-components/commands/rapid-serial-visual-presentation/RapidSerialVisualPresenter.svelte";


const viewSettings: SvelteViewSettings = {
    viewType: "rapid-serial-visual-presentation",
    displayName: "Rapid Serial Visual Presentation",
    viewCompClass: RapidSerialVisualPresenter,
}

class RapidSerialVisualPresentationView extends SvelteView {
	static viewSettings = viewSettings;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

    async setState(state: any, result: ViewStateResult): Promise<void> {
        this.viewComp.$set({
            rsvpElements: state.rsvpElements,
            wordsPerMinute: state.wordsPerMinute,
        });
        this.viewComp.stop();
        this.viewComp.play();
        return super.setState(state, result);
    }
}

const viewPluginSettings: SvelteViewPluginComponentSettings = {
    viewType: viewSettings.viewType,
    svelteViewClass: RapidSerialVisualPresentationView,

    addRibbonIcon: false,
}

export class View_RapidSerialVisualPresentation extends SvelteViewPluginComponent {
    componentName = 'View: Rapid Serial Visual Presentation';
	static viewPluginSettings = viewPluginSettings;

	constructor(plugin: ObakoPlugin) {
		super(plugin);
	}
}
