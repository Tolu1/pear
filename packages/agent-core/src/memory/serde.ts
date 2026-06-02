import { RenderableContent, ObservableDataObject } from "./observation";
import { Image } from './image';

export type StoredMedia = {
    type: 'media',
    format: string,
    storage: 'base64',
    base64: string
}

export interface StoredPrimitive {
    type: 'primitive',
    content: string | boolean | number
}

type MultiMediaPrimitive = StoredMedia | StoredPrimitive | undefined | null;
type MultiMediaArray = Array<MultiMediaJson>;
export type MultiMediaObject = {
    [key: string]: MultiMediaJson;
};

export type MultiMediaJson = MultiMediaPrimitive | MultiMediaArray | MultiMediaObject;

export async function observableDataToJson(data: RenderableContent): Promise<MultiMediaJson> {
    if (data instanceof Image) {
        return await data.toJson();
    }

    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        return { type: "primitive", content: data };
    }

    if (data === undefined) {
        return undefined;
    }

    if (data === null) {
        return null;
    }

    if (Array.isArray(data)) {
        return Promise.all(data
            .filter(item => item !== undefined)
            .map(item => observableDataToJson(item))
        );
    }

    if (typeof data === 'object') {
        const processedObject: { [key: string]: any } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = (data as ObservableDataObject)[key];
                const processedValue = observableDataToJson(value);

                if (processedValue !== undefined) {
                    processedObject[key] = processedValue;
                }
            }
        }
        return processedObject;
    }

    return undefined;
}

export async function jsonToObservableData(data: MultiMediaJson): Promise<RenderableContent> {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return Promise.all(data.map(item => jsonToObservableData(item)));
    }

    if (typeof data === 'object') {
        if ('type' in data && typeof data.type === 'string') {
            switch (data.type) {
                case 'media':
                    const media = data as StoredMedia;
                    if (media.storage === 'base64') {
                        return Image.fromBase64(media.base64);
                    }
                    throw new Error(`Unsupported media storage type: ${media.storage}`);

                case 'primitive':
                    return (data as StoredPrimitive).content;
            }
        }

        const result: ObservableDataObject = {};
        const keys = Object.keys(data);

        const values = await Promise.all(
            keys.map(key => jsonToObservableData((data as MultiMediaObject)[key]))
        );

        keys.forEach((key, index) => {
            result[key] = values[index];
        });

        return result;
    }

    throw new Error(`Invalid MultiMediaJson format: Unexpected primitive value '${data}'.`);
}
