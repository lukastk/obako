/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView, TFile } from 'obsidian';
import { loadNote } from 'src/note-loader';
import BasicNote from 'src/notes/basic-note';
import PluginComponent from '../plugin-component';

export class Dashboard_Planner extends PluginComponent {
    load() {
    }

    unload() { }
};

