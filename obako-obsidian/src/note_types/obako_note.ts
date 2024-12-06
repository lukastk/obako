import { TFile } from 'obsidian';
import Note from './note';
import { createInternalLinkElement } from '../utils';

import Example from '../svelte/Example.svelte';

export default class ObakoNote extends Note {
    constructor(file: TFile | string) {
        super(file);
    }

    createTopPanel(panel: HTMLElement) {
        super.createTopPanel(panel);

        panel.classList.add('obako-note-top-panel');

        // Create a new div element
        const newDiv = document.createElement('div');
        panel.appendChild(newDiv); // Append the new div to the panel

        // Target the Component into the new div
        new Example({
            target: newDiv, // Change target to newDiv
            props: { }
        });

        const link = createInternalLinkElement("A link 2", "Autonomy Data Services");
        panel.appendChild(link);
    }
}