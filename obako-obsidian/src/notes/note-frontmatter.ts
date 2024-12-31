export interface FrontmatterFieldSpec {
    default?: any;
    type: string;
    fixedValue?: boolean; // If true, the field is not editable.
    description?: string;
    hideInCreationModal?: boolean;
}

export interface FrontmatterSpec {
    [key: string]: FrontmatterFieldSpec;
}

export function processFrontmatter(frontmatter: any, frontmatterSpec: FrontmatterSpec) {
    const _frontmatter = { ...frontmatter };
    for (const [fieldName, fieldSpec] of Object.entries(frontmatterSpec)) {
        if (fieldName in _frontmatter && !fieldSpec.fixedValue) continue;
        _frontmatter[fieldName] = fieldSpec.default;
    }
    return _frontmatter;
}