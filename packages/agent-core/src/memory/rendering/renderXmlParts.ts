import { Image as BamlImage } from '@boundaryml/baml';
import { RenderableContent, ObservableDataObject } from '@/memory/observation';
import { Image } from '@/memory/image';

export type MultiMediaContentPart = BamlImage | string;

async function buildXmlPartsRecursive(
    data: RenderableContent,
    indentLevel: number,
    partsList: MultiMediaContentPart[],
    isInsideList: boolean = false
): Promise<void> {
    const indent = '  '.repeat(indentLevel);

    if (data instanceof Image) {
        const bamlImg = await data.toBaml();
        if (bamlImg) {
            partsList.push(bamlImg);
        }
        return;
    }
    if (data instanceof BamlImage) {
        partsList.push(data);
        return;
    }
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' || data === null) {
        partsList.push(String(data));
        return;
    }
    if (data === undefined) {
        return;
    }

    if (Array.isArray(data)) {
        for (let index = 0; index < data.length; index++) {
            await buildXmlPartsRecursive(data[index], indentLevel, partsList, true);
            if (index < data.length - 1) {
                partsList.push("\n");
            }
        }
        return;
    }

    if (typeof data === 'object' && data !== null) {
        const objectEntries = Object.entries(data as ObservableDataObject).filter(([, val]) => val !== undefined);

        objectEntries.forEach(async ([key, value], entryIndex) => {
            const tagName = key;
            const currentValueParts: MultiMediaContentPart[] = [];

            await buildXmlPartsRecursive(value, indentLevel + 1, currentValueParts, false);

            const mergedValueParts: MultiMediaContentPart[] = [];
            let currentStr = "";
            for (const part of currentValueParts) {
                if (typeof part === 'string') {
                    currentStr += part;
                } else {
                    if (currentStr) mergedValueParts.push(currentStr);
                    currentStr = "";
                    mergedValueParts.push(part);
                }
            }
            if (currentStr) mergedValueParts.push(currentStr);

            if (mergedValueParts.length === 1 && mergedValueParts[0] instanceof BamlImage) {
                partsList.push(`${indent}<${tagName}>`);
                partsList.push(mergedValueParts[0]);
                partsList.push(`</${tagName}>`);
            } else if (mergedValueParts.length === 1 && typeof mergedValueParts[0] === 'string') {
                const contentStr = mergedValueParts[0] as string;
                if (contentStr.includes('\n')) {
                    partsList.push(`${indent}<${tagName}>\n${contentStr}\n${indent}</${tagName}>`);
                } else {
                    partsList.push(`${indent}<${tagName}>${contentStr}</${tagName}>`);
                }
            } else {
                partsList.push(`${indent}<${tagName}>\n`);
                mergedValueParts.forEach((part, partIdx) => {
                    partsList.push(part);
                    if (partIdx < mergedValueParts.length - 1) {
                        partsList.push("\n");
                    }
                });
                partsList.push(`\n${indent}</${tagName}>`);
            }

            if (entryIndex < objectEntries.length - 1) {
                partsList.push("\n");
            }
        });
        return;
    }

    throw new Error(`Object type not supported for LLM context: ${typeof data}`);
}

export async function renderXmlParts(data: RenderableContent): Promise<MultiMediaContentPart[]> {
    const rawList: MultiMediaContentPart[] = [];
    await buildXmlPartsRecursive(data, 0, rawList);

    if (rawList.length === 0) {
        return [];
    }

    const mergedList: MultiMediaContentPart[] = [];
    let currentString = "";

    for (const item of rawList) {
        if (typeof item === 'string') {
            currentString += item;
        } else {
            if (currentString.length > 0) {
                mergedList.push(currentString);
            }
            currentString = "";
            mergedList.push(item);
        }
    }
    if (currentString.length > 0) {
        mergedList.push(currentString);
    }

    return mergedList;
}
