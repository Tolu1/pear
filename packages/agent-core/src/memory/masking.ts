import { Observation } from './observation';

export async function maskObservations(observations: Observation[], freezeMask?: boolean[]): Promise<boolean[]> {
    const frozenCount = freezeMask?.length ?? 0;

    const mask = new Array(observations.length).fill(true);

    if (freezeMask) {
        for (let i = 0; i < frozenCount && i < observations.length; i++) {
            mask[i] = freezeMask[i];
        }
    }

    const observationsByType = new Map<string, {
        frozenIndices: number[];
        unfrozenIndices: number[];
        frozenObs: Observation[];
        unfrozenObs: Observation[];
        limit?: number;
        dedupe?: boolean;
    }>();

    observations.forEach((obs, index) => {
        if (obs.retention && obs.retention.type) {
            const type = obs.retention.type;
            if (!observationsByType.has(type)) {
                observationsByType.set(type, {
                    frozenIndices: [],
                    unfrozenIndices: [],
                    frozenObs: [],
                    unfrozenObs: [],
                    limit: obs.retention.limit,
                    dedupe: obs.retention.dedupe,
                });
            }
            const typeData = observationsByType.get(type)!;

            if (index < frozenCount) {
                typeData.frozenIndices.push(index);
                typeData.frozenObs.push(obs);
            } else {
                typeData.unfrozenIndices.push(index);
                typeData.unfrozenObs.push(obs);
            }
        }
    });

    for (const [type, data] of observationsByType.entries()) {
        let visibleUnfrozenIndices = [...data.unfrozenIndices];

        if (data.dedupe && data.unfrozenObs.length > 1) {
            const dedupedIndices: number[] = [];
            dedupedIndices.unshift(data.unfrozenIndices[data.unfrozenIndices.length - 1]);

            for (let i = data.unfrozenIndices.length - 2; i >= 0; i--) {
                const currentObs = data.unfrozenObs[i];
                const lastKeptIdx = dedupedIndices[0];
                const lastKeptObs = observations[lastKeptIdx];

                if (!(await currentObs.equals(lastKeptObs))) {
                    dedupedIndices.unshift(data.unfrozenIndices[i]);
                }
            }
            visibleUnfrozenIndices = dedupedIndices;
        }

        if (data.dedupe && freezeMask) {
            const frozenToPreserve = new Set<number>();

            for (let i = 0; i < data.frozenIndices.length; i++) {
                const frozenIdx = data.frozenIndices[i];
                if (mask[frozenIdx]) {
                    const frozenObs = data.frozenObs[i];

                    for (const unfrozenObs of data.unfrozenObs) {
                        if (await frozenObs.equals(unfrozenObs)) {
                            frozenToPreserve.add(frozenIdx);
                            break;
                        }
                    }
                }
            }

            frozenToPreserve.forEach(idx => {
                mask[idx] = true;
            });
        }

        if (data.limit !== undefined && data.limit >= 0) {
            if (data.limit === 0) {
                visibleUnfrozenIndices = [];
            } else {
                visibleUnfrozenIndices = visibleUnfrozenIndices.slice(-data.limit);
            }
        }

        const visibleSet = new Set(visibleUnfrozenIndices);
        data.unfrozenIndices.forEach(idx => {
            if (!visibleSet.has(idx)) {
                mask[idx] = false;
            }
        });
    }

    return mask;
}

export interface MaskedObservation {
    observation: Observation;
    index: number;
}

export function applyMask(observations: Observation[], mask: boolean[]): MaskedObservation[] {
    if (observations.length !== mask.length) {
        throw new Error(`Mask length (${mask.length}) must match observations length (${observations.length})`);
    }

    const result: MaskedObservation[] = [];
    observations.forEach((observation, index) => {
        if (mask[index]) {
            result.push({ observation, index });
        }
    });
    return result;
}
