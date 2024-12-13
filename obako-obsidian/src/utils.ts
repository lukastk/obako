import { TFile } from 'obsidian';
import * as chrono from 'chrono-node';

export function getFile(file: TFile | string | null) {
    if (typeof file === 'string') {
        if (file.includes('/') && !file.endsWith('.md')) {
            file = file + '.md';
        }
        let _file = _obako_plugin.app.vault.getAbstractFileByPath(file);
        if (!_file) {
            try {
                _file = _obako_plugin.app.metadataCache.getFirstLinkpathDest(file);
            } catch (e) {
                throw new Error(`File not found: ${file}`);
            }
        }
        return _file;
    } else {
        return file;
    }
}

export function getFrontmatter(file: TFile | string) {
    const fileCache = _obako_plugin.app.metadataCache.getFileCache(getFile(file));
    return fileCache?.frontmatter;
}

export function createInternalLinkElement(text: string, filePathOrName: string) {
    const link = document.createElement("a");
    link.className = "internal-link";
    link.href = filePathOrName;
    link.textContent = text;

    // Add click handler for internal links
    link.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent the default browser action
        const inNewPane = event.metaKey || event.ctrlKey;
        _obako_plugin.app.workspace.openLinkText(filePathOrName, "", inNewPane); // Use app.workspace to navigate
    });

    return link;
}

export function parseObsidianLink(link: string): string | null {
    // Check if the input is a string and matches the pattern of an Obsidian link
    if (typeof link !== 'string' || !link.startsWith('[[') || !link.endsWith(']]')) {
        return null; // Return null if it's not a proper link
    }

    const regex = /\[\[([^\]]+)\]\]/;
    const match = link.match(regex);
    if (match) {
        return match[1]; // This will return the content inside the brackets
    }
    return null; // Return null if no match is found
}

/**
 * Formats a given date string into the format "YYYY-MM-DD w{Week Number} ddd".
 *
 * The function takes an ISO date string (e.g., "2024-12-16T12:00:00.000Z"), 
 * extracts the year, month, day, and calculates the ISO week number 
 * along with the three-letter abbreviation for the day of the week.
 *
 * @param {string} dateString - An ISO-formatted date string (e.g., "2024-12-16T12:00:00.000Z").
 * 
 * @returns {string} - A formatted string in the format "YYYY-MM-DD w{Week Number} ddd".
 *                     Example: "2024-12-16 w51 Mon"
 *
 * @example
 * // Example with a specific date
 * formatDate("2024-12-16T12:00:00.000Z");
 * // Returns: "2024-12-16 w51 Mon"
 *
 * @example
 * // Example with a parsed date from chrono-node
 * const chrono = require('chrono-node');
 * const parsedDate = chrono.parseDate("next Monday");
 * const formattedDate = formatDate(parsedDate.toISOString());
 * console.log(formattedDate);
 */
export function formatDate(dateString: string) {
    const date = new Date(dateString);

    // Extract components
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    // Calculate ISO week number
    const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7);

    // Day of the week
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysOfWeek[date.getUTCDay()];

    // Format result
    return `${year}-${month}-${day} w${weekNumber} ${dayOfWeek}`;
}

/**
 * Parses a text string of date in natural language and returns a date string in the format "YYYY-MM-DD w{Week Number} ddd".
 * 
 * @param {string} text - A text string containing a date or date-related phrase.
 * 
 * @returns {string} - A formatted date string in the format "YYYY-MM-DD w{Week Number} ddd".
 *                     Example: "2024-12-16 w51 Mon"
 */
export function getDateStringFromText(text: string) {
    const parsedDate = chrono.parseDate(text);
    return formatDate(parsedDate.toISOString());
}