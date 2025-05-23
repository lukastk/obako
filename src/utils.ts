import { Editor, MarkdownPreviewView, MarkdownView, TFile } from 'obsidian';
import * as chrono from 'chrono-node';
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
                return null;
            }
        }
        return _file;
    } else {
        return file;
    }
}

export function getFrontmatter(_file: TFile | string | null) {
    const file = getFile(_file);
    const fileCache = file ? app.metadataCache.getFileCache(file) : null;
    return fileCache?.frontmatter;
}

export function getMarkdownFiles(filter_func: (note: TFile) => boolean = () => true): TFile[] {
    return app.vault.getMarkdownFiles().filter(filter_func);
}

export function parseObsidianLink(link: string): string | null {
    // Check if the input is a string and matches the pattern of an Obsidian link
    if (typeof link !== 'string' || !link.startsWith('[[') || !link.endsWith(']]')) {
        return null; // Return null if it's not a proper link
    }

    const regex = /\[\[([^\]]+)\]\]/;
    const match = link.match(regex);
    if (match) {
        if (match[1].includes('|')) {
            return match[1].split('|')[0];
        } else {
            return match[1];
        }
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

export function getDateFromNaturalLanguage(text: string) {
    return chrono.parseDate(text);
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
    const parsedDate = getDateFromNaturalLanguage(text);
    if (!parsedDate) return null;
    if (includeWeekNumber)
        return formatDateWithWeekNumber(parsedDate.toISOString());
    else
        return getDateStringFromDate(parsedDate);
}

/**
 * Can be either in natural language or in a date string format.
 */
export function getDateFromText(dateStr: string): Date | null {
    let date: Date | null = new Date(dateStr);
    if (isDateValid(date)) return date;
    date = getDateFromNaturalLanguage(dateStr);
    if (!date) return null;
    return date;
}

export function getLeadingWhitespace(str: string) {
    const match = str.match(/^\s*/); // Matches all whitespace at the start of the string
    return match ? match[0] : "";   // Return the matched whitespace or an empty string if no match
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

export function getWeekNumberStr(date: Date): string {
    const weekNumber = getWeekNumber(date);
    if (weekNumber < 10)
        return `0${weekNumber}`;
    else
        return `${weekNumber}`;
}

export function getStartOfWeek(date: Date): Date {
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Adjust to get to the previous Monday
    
    const previousMonday = new Date(date);
    previousMonday.setDate(date.getDate() + diff);
    
    return previousMonday;
}

export function generateRandomId(length: number = 8): string {
    return Math.random().toString(36).substr(2, length);
}

export function renderMarkdown(content: string, container: HTMLElement) {
    MarkdownPreviewView.render(app, content, container, '', _obako_plugin);
}

export function parseDatesInDateRangeTitle(datedTitleStr: string, defaultYear?: string): {
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

export function compareDates(date1: Date, date2: Date) {
    // Create new dates with only the date part (time set to 00:00:00)
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    
    // Compare the timestamps
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
}

export function getDateStringFromDate(date: Date) {
    //return date.toISOString().slice(0, 10);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Returns the date in 'YYYY-MM-DD' format
}

export function getDateFromDateString(dateStr: string) {
    if (!dateStr || dateStr.trim() === '') return null;
    const date = new Date(dateStr);
    return isDateValid(date) ? date : null;
}

export function getSelectionPositions(editor: Editor | null) {
    if (!editor)
        editor = app.workspace.getActiveViewOfType(MarkdownView)?.leaf.view.editor;

    return {
        start: editor.getCursor('from'),
        end: editor.getCursor('to')
    }
}

export function isSelectionEmpty(editor: Editor | null) {
    const selectionPositions = getSelectionPositions(editor);
    return selectionPositions.start.line === selectionPositions.end.line && selectionPositions.start.ch === selectionPositions.end.ch;
}

export function getSelectionText(editor: Editor | null) {
    const selectionPositions = getSelectionPositions(editor);
    return editor.getRange(
        { line: selectionPositions.start.line, ch: 0 },
        { line: selectionPositions.end.line, ch: editor.getLine(selectionPositions.end.line).length }
    );
}

const __onNoteChange__leafFiles = {};
const __onNoteChange__leafCallbacks = {};
let __onNoteChange__eventCreated = false;
export function onMarkdownViewFileChange(leaf: MarkdownView, callback: (oldFile: TFile, newFile: TFile) => void) {
    if (!(leaf.leaf.id in __onNoteChange__leafFiles)) {
        __onNoteChange__leafFiles[leaf.leaf.id] = leaf.file;
        __onNoteChange__leafCallbacks[leaf.leaf.id] = [];
    }
    __onNoteChange__leafCallbacks[leaf.leaf.id].push(callback);

    if (!__onNoteChange__eventCreated) {
        _obako_plugin.registerEvent(
            app.workspace.on('layout-change', () => {
                for (const leafId of Object.keys(__onNoteChange__leafFiles)) {
                    const leaf = app.workspace.getLeafById(leafId);
                    if (!leaf) continue;
                    if (leaf?.view?.file?.path != __onNoteChange__leafFiles[leafId].path) {
                        for (const callback of __onNoteChange__leafCallbacks[leafId]) {
                            callback(__onNoteChange__leafFiles[leafId], leaf.view.file);
                        }
                        __onNoteChange__leafFiles[leafId] = leaf.view.file;
                    }
                }
            })
        )
        __onNoteChange__eventCreated = true;
    }
}

export async function getBlockEmbed(lineNumber: number, file: TFile) {
    const mdLines = (await app.vault.read(file)).split('\n');
    const line = mdLines[lineNumber];
    if (!line) throw new Error('Line not found');
    const lastPart = line.split(/\s+/).pop();

    let blockRef: string;
    if (lastPart.startsWith('^')) {
        blockRef = lastPart;
    } else {
        blockRef = `^${generateAlphaNumericId(6)}`;
        await app.vault.process(file, (data) => {
            const lines = data.split('\n');
            lines[lineNumber] = `${lines[lineNumber]} ${blockRef}`;
            return lines.join('\n');
        });
    }

    return `${file.path}#${blockRef}`;
}

export function trimBlockIdsFromText(text: string): string {
    const mdLines = text.split('\n');

    const trimmedLines = mdLines.map(line => {
        const lastPart = line.split(/\s+/).pop();

        if (lastPart && lastPart.startsWith('^')) {
            return line.slice(0, -lastPart.length);
        } else {
            return line;
        }
    });

    return trimmedLines.join('\n');
}

export function generateAlphaNumericId(length: number = 6): string {
    return Math.random().toString(36).slice(2, length + 2);
}

export function getPathParent(path: string) {
    const lastSlashIndex = path.lastIndexOf('/');
    if (lastSlashIndex === -1) return '';
    return path.slice(0, lastSlashIndex);
}

export function getPathBasename(path: string) {
    const lastSlashIndex = path.lastIndexOf('/');
    const lastDotIndex = path.lastIndexOf('.');
    if (lastSlashIndex === -1) return path;
    if (lastDotIndex === -1) return path.slice(lastSlashIndex + 1);
    return path.slice(lastSlashIndex + 1, lastDotIndex);
}