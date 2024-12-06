import { TFile } from 'obsidian';
import Note from './note';
import { createInternalLinkElement } from '../utils';

export default class ObakoNote extends Note {
    constructor(file: TFile | string) {
        super(file);
    }

    createTopPanel(panel: HTMLElement) {
        super.createTopPanel(panel);

        panel.classList.add('obako-note-top-panel');

        const link = createInternalLinkElement("A link", "Autonomy Data Services");
        panel.appendChild(link);
    }
}