import { MarkdownPreviewView, MarkdownView, Notice, TFile } from 'obsidian';
import * as chrono from 'chrono-node';
import BasicNote from './notes/basic-note';
import * as weeknumber from 'weeknumber';

export function getFile(file: TFile | string | null): TFile | null {
    if (typeof file === 'string') {
        if (file.includes('/') && !file.endsWith('.md')) {
            file = file + '.md';
        }
        let _file = app.vault.getAbstractFileByPath(file);
        if (!_file) {
            try {
                _file = app.metadataCache.getFirstLinkpathDest(file);
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
    const fileCache = app.metadataCache.getFileCache(getFile(file));
    return fileCache?.frontmatter;
}

export function getMarkdownFiles(filter_func: (note: TFile) => boolean = () => true): TFile[] {
    return app.vault.getMarkdownFiles().filter(filter_func);
}

export function getNotes(noteType: string, onlyValid: boolean = true): BasicNote[] {
    let notes = getMarkdownFiles().map(file => obako.noteLoader.loadNote(file));
    notes = notes.filter(note => note?.noteType === noteType);
    if (onlyValid)
        notes = notes.filter(note => note?.validate());
    return notes;
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
export function formatDateWithWeekNumber(dateString: string) {
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
export function getDateStringFromNaturalLanguage(text: string, includeWeekNumber: boolean = false) {
    const parsedDate = chrono.parseDate(text);
    if (!parsedDate) return null;
    if (includeWeekNumber)
        return formatDateWithWeekNumber(parsedDate.toISOString());
    else
        return getDateStringFromDate(parsedDate);
}

export function getDateFromWeekNumber(year: number, week: number): [Date, Date] {
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const firstDayOfYear = new Date(year, 0, 1);
    const firstDayOfWeek = firstDayOfYear.getDay();
    const daysOffset = (firstDayOfWeek <= 4 ? firstDayOfWeek - 1 : firstDayOfWeek - 8);
    const dayOfFirstWeek = new Date(firstDayOfYear.getTime() - daysOffset * oneDay);
    const startDate = new Date(dayOfFirstWeek.getTime() + (week - 1) * oneWeek);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return [startDate, endDate];
}

/**
 * Parses a date string and returns the start and end dates of the specified period.
 *
 * The function supports various date formats:
 * - "YYYY-MM-DD" for a specific day.
 * - "YYYY-MM" for a specific month.
 * - "YYYY wXX" for a specific week.
 * - "YYYY QX" for a specific quarter.
 * - "YYYY" for a specific year.
 *
 * If a year is not present in the date string, an optional default year can be provided.
 * The function will use this default year for formats like "MM-DD", "wXX", "QX", and "MM".
 *
 * @param {string} dateRangeStr - The date string to parse.
 * @param {string} [defaultYear] - An optional default year to use if the date string lacks a year.
 * @returns {[Date | null, Date | null]} - An array containing the start and end dates of the specified period.
 * @throws {Error} - Throws an error if the date string format is invalid.
 */
export function parseDateRangeStr(dateRangeStr: string, defaultYear?: string): [Date | null, Date | null, string] {
    const dateFormats = [
        /^\d{4}-\d{2}-\d{2}$/, // 2024-12-02
        /^\d{4} w\d{2}$/,      // 2024 w50
        /^\d{4}$/,             // 2024
        /^\d{4} Q[1-4]$/,      // 2024 Q1
        /^\d{4}-\d{2}$/        // 2011-10
    ];

    let startDate: Date | null;
    let endDate: Date | null;
    let rangeType: string;

    if (dateFormats[0].test(dateRangeStr)) {
        // Format: 2024-12-02
        startDate = new Date(dateRangeStr);
        endDate = null;
        rangeType = "day";
    } else if (dateFormats[1].test(dateRangeStr)) {
        // Format: 2024 w50
        const [year, week] = dateRangeStr.split(' ');
        [startDate, endDate] = getDateFromWeekNumber(parseInt(year), parseInt(week.slice(1)));
        rangeType = "week";
    } else if (dateFormats[2].test(dateRangeStr)) {
        // Format: 2024
        startDate = new Date(`${dateRangeStr}-01-01`);
        endDate = new Date(`${dateRangeStr}-12-31`);
        rangeType = "year";
    } else if (dateFormats[3].test(dateRangeStr)) {
        // Format: 2024 Q1
        const [year, quarter] = dateRangeStr.split(' ');
        const quarterStartMonth = (parseInt(quarter.slice(1)) - 1) * 3;
        startDate = new Date(`${year}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`);
        endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 3, 0));
        rangeType = "quarter";
    } else if (dateFormats[4].test(dateRangeStr)) {
        // Format: 2011-10
        const [year, month] = dateRangeStr.split('-');
        startDate = new Date(`${year}-${month}-01`);
        endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1, 0));
        rangeType = "month";
    } else if (defaultYear) {
        // Use default year if no year is present in dateStr
        if (/^\d{2}-\d{2}$/.test(dateRangeStr)) {
            // Format: MM-DD
            startDate = new Date(`${defaultYear}-${dateRangeStr}`);
            endDate = new Date(startDate);
            rangeType = "month";
        } else if (/^w\d{2}$/.test(dateRangeStr)) {
            // Format: w50
            const week = dateRangeStr.slice(1);
            [startDate, endDate] = getDateFromWeekNumber(parseInt(defaultYear), parseInt(week));
            rangeType = "week";
        } else if (/^Q[1-4]$/.test(dateRangeStr)) {
            // Format: Q1
            const quarter = dateRangeStr.slice(1);
            const quarterStartMonth = (parseInt(quarter) - 1) * 3;
            startDate = new Date(`${defaultYear}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`);
            endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 3, 0));
            rangeType = "quarter";
        } else if (/^\d{2}$/.test(dateRangeStr)) {
            // Format: MM
            startDate = new Date(`${defaultYear}-${dateRangeStr}-01`);
            endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1, 0));
            rangeType = "month";
        } else {
            startDate = null;
            endDate = null;
            rangeType = "Poorly formatted date string";
        }
    } else {
        startDate = null;
        endDate = null;
        rangeType = "Poorly formatted date string";
    }

    return [startDate, endDate, rangeType];
}

export function getWeekNumber(date: Date): number {
    return weeknumber.weekNumber(date);
}

export function generateRandomId(length: number = 8): string {
    return Math.random().toString(36).substr(2, length);
}

export function renderMarkdown(content: string, container: HTMLElement) {
    MarkdownPreviewView.render(app, content, container, '', _obako_plugin);
}

export function parseDatesInDateRangeTitle(datedTitleStr: string, defaultYear?: string) : {
    plannerTitle: string,
    date: Date | null,
    endDate: Date | null,
    rangeType: string
} {
    const plannerTitle = datedTitleStr.split('--')[1]?.trim() || '';
    const [startDateStr, endDateStr] = datedTitleStr.split('--')[0].split('..');

    const [startDate_start, startDate_end, startDate_rangeType] = parseDateRangeStr(startDateStr?.trim(), defaultYear);
    const [endDate_start, endDate_end, endDate_rangeType] = parseDateRangeStr(endDateStr?.trim(), defaultYear || startDate_start?.getFullYear());

    if (endDateStr) {
        return {
            plannerTitle: plannerTitle,
            date: startDate_start,
            endDate: endDate_end || endDate_start,
            rangeType: 'custom'
        }
    } else {
        return {
            plannerTitle: plannerTitle,
            date: startDate_start,
            endDate: startDate_end || startDate_start,
            rangeType: startDate_rangeType
        }
    }
}

export function getMarkdownViewMode(leaf: MarkdownView) {
    const state = leaf.getState();

    if (state.mode === 'preview') {
        return 'reader';
    } else if (state.mode === 'source' && state.source) {
        return 'source';
    } else if (state.mode === 'source' && !state.source) {
        return 'preview';
    } else {
        throw new Error('Unknown MarkdownView mode');
    }
}

export function addDays(date: Date, days: number) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

export function isDateValid(date: Date) {
    if (!date) return false;
    return !isNaN(date.getTime());
}

export function getDateStringFromDate(date: Date) {
    return date.toISOString().slice(0, 10);
}