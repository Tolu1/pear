// @ts-nocheck — vendored, runtime-trusted (see docs/internal/lineage.md)
export type KeypressIndicator = '<enter>' | '<tab>';

export function parseTypeContent(content: string): (string | KeypressIndicator)[] {
    const regex = /<enter>|<tab>/g;
    const result: string[] = [];
    let lastIndex = 0;

    content.replace(regex, (match, offset) => {
        const text = content.slice(lastIndex, offset).trim();
        if (text) result.push(text);

        result.push(match);
        lastIndex = offset + match.length;
        return match;
    });

    const remaining = content.slice(lastIndex).trim();
    if (remaining) result.push(remaining);

    return result;
}

export function renderMinimalAccessibilityTree(node: any): string {
    const sanitize = (text: string | number | boolean): string => {
        return String(text).trim().replace(/\n/g, '\\n');
    }

    function recursiveFlatten(node: any, indent: string): string {
        const isTextLike = (n: any) =>
            n && (n.role === 'StaticText' || n.role === 'text') && n.name && n.name.trim();

        let childrenOutput = '';
        if (node.children) {
            const newChildren = [];
            let currentTextBuffer = [];

            for (const child of node.children) {
                if (isTextLike(child)) {
                    currentTextBuffer.push(sanitize(child.name));
                } else {
                    if (currentTextBuffer.length > 0) {
                        newChildren.push({ role: 'coalesced-text', name: currentTextBuffer.join(' ') });
                        currentTextBuffer = [];
                    }
                    newChildren.push(child);
                }
            }
            if (currentTextBuffer.length > 0) {
                newChildren.push({ role: 'coalesced-text', name: currentTextBuffer.join(' ') });
            }

            for (const child of newChildren) {
                if (child.role === 'coalesced-text') {
                    childrenOutput += `${indent}  ${child.name}\n`;
                } else {
                    childrenOutput += recursiveFlatten(child, indent + '  ');
                }
            }
        }

        const isBoringContainer = (node.role === 'generic' || node.role === 'div') && !node.name;
        if (isBoringContainer) {
            return childrenOutput;
        }

        let line = '';
        if (node.role && !['StaticText', 'text', 'RootWebArea'].includes(node.role)) {
            line = `${indent}[${node.role}]`;

            if (node.name && sanitize(node.name)) {
                line += ` ${sanitize(node.name)}`;
            }

            if (node.value !== undefined && sanitize(node.value)) {
                line += ` (value: ${sanitize(node.value)})`;
            }

            if (node.checked !== undefined) line += ` (checked: ${node.checked})`;
            if (node.disabled) line += ` (disabled)`;
            line += '\n';
        }

        return line + childrenOutput;
    }

    const rawFlattened = recursiveFlatten(node, '');
    return rawFlattened
        .split('\n')
        .filter((line) => line.trim() !== '')
        .join('\n');
}
