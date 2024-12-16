import { ItemView } from "obsidian";

import Component from "../../svelte/Example.svelte";
import PluginComponent from '../plugin-component';

import { Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";

const VIEW_TYPE_EXAMPLE = "example-view";

class ExampleView extends ItemView {
	timeline: Timeline | null = null;

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Example view";
	}

    async onOpen() {
        const container = this.contentEl;
        container.empty();  // Clear the view

        // Create a div for the timeline
        const timelineContainer = container.createDiv({
            cls: "timeline-container",
        });

        // Define timeline data and options
        const items = [
            { id: 1, content: "Item 1", start: "2023-12-01" },
            { id: 2, content: "Item 2", start: "2023-12-02" },
            { id: 3, content: "Item 3", start: "2023-12-03" },
        ];

        const options = {
            width: "100%",
            height: "400px",
            margin: {
                item: 10,
            },
            selectable: true,
            editable: false,
        };

        // Initialize the timeline
        this.timeline = new Timeline(timelineContainer, items, options);
    }

	async onClose() {
        if (this.timeline) {
            this.timeline.destroy();
            this.timeline = null;
        }
	}
}

export class View_Example extends PluginComponent {
	load() {
        this.plugin.registerView(
            VIEW_TYPE_EXAMPLE,
            (leaf) => new ExampleView(leaf)
        );

        // Add a command to open the dashboard
        this.plugin.addCommand({
            id: "open-dashboard",
            name: "Open Dashboard",
            callback: () => {
                this.activateView();
            },
        });
	}

	unload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
        // Cleanup the timeline if needed

	}

    async activateView() {
        // Close any existing dashboard views
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

        // Create a new leaf and set its view
        const leaf = this.app.workspace.getRightLeaf(false);
        await leaf.setViewState({
            type: VIEW_TYPE_EXAMPLE,
            active: true,
        });

        // Reveal the new leaf in the workspace
        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
        );
    }



    async onClose() {

    }
}