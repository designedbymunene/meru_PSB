import { getNormalizedApiError } from '@meru/shared';
import { isRetryableApiError } from '@/lib/retry-policy';
import { enqueueOfflineMutation } from './outbox';
import type { EnqueueOfflineMutationInput } from './types';

export type OfflineMutationResult<T> =
    | { queued: false; data: T }
    | { queued: true; queueEntryId: string };

interface RunOfflineMutationInput<T> extends EnqueueOfflineMutationInput {
    request: () => Promise<T>;
}

export async function runOfflineCapableMutation<T>(input: RunOfflineMutationInput<T>): Promise<OfflineMutationResult<T>> {
    try {
        const response = await input.request();
        return { queued: false, data: response };
    } catch (error) {
        const normalizedError = getNormalizedApiError(error);

        if (!isRetryableApiError(normalizedError)) {
            throw error;
        }

        const queuedEntry = await enqueueOfflineMutation({
            method: input.method,
            path: input.path,
            body: input.body,
            headers: input.headers,
            dedupeKey: input.dedupeKey,
            allowDuplicate: input.allowDuplicate,
        });

        return {
            queued: true,
            queueEntryId: queuedEntry.id,
        };
    }
}
