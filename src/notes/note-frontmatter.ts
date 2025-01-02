export interface FrontmatterFieldSpec {
    default?: any;
    type: string;
    fixedValue?: boolean; // If true, the field is not editable.
    description?: string;
    hideInCreationModal?: boolean;
    skipCreationIfAbsent?: boolean;
}

export interface FrontmatterSpec {
    [key: string]: FrontmatterFieldSpec;
}

/**
 * If `forNoteCreation` is true, then fields that are not present in the frontmatter whose specs
 * specify that they should be skipped if absent, are not added to the frontmatter.
 */
export function processFrontmatter(frontmatter: any, frontmatterSpec: FrontmatterSpec, forNoteCreation: boolean = false) {
    const _frontmatter = { ...frontmatter };
    for (const [fieldName, fieldSpec] of Object.entries(frontmatterSpec)) {
        if (fieldName in _frontmatter && !fieldSpec.fixedValue) continue;
        if (forNoteCreation && fieldSpec.skipCreationIfAbsent && !(fieldName in _frontmatter)) continue;
        _frontmatter[fieldName] = fieldSpec.default;
    }
    return _frontmatter;
}