/**
 * Standardized API Response Handler
 *
 * This module provides utilities to consistently extract data from API responses.
 * The backend typically returns responses in the format:
 * { data: { data: T | { data: T } } }
 *
 * This utility handles the various response formats consistently.
 */

export interface ApiResponse<T = any> {
    data: T;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface WrappedResponse<T> {
    data: T;
}

/**
 * Extracts data from a typical API response structure.
 * Handles various response formats:
 * - response.data.data (standard format)
 * - response.data.data.data (nested format for paginated responses)
 * - response.data (direct format)
 *
 * @param response - The axios response object
 * @returns The extracted data
 *
 * @example
 * const response = await apiClient.get('/vacancies');
 * const vacancies = extractApiData(response); // Returns the array of vacancies
 *
 * @example
 * const response = await apiClient.get('/applications/me');
 * const applications = extractApiData<Application[]>(response); // Returns the array of applications
 */
export function extractApiData<T = any>(response: any): T {
    // Handle standard axios response structure
    const responseData = response?.data;

    if (!responseData) {
        return undefined as T;
    }

    // Case 1: responseData.data exists and is the actual data
    // Format: { data: { data: T } }
    if (responseData.data !== undefined) {
        // Case 2: responseData.data.data exists (nested/paginated format)
        // Format: { data: { data: { data: T[], meta: {...} } } }
        if (responseData.data.data !== undefined) {
            // If it's a paginated response with meta, return the data array
            if (Array.isArray(responseData.data.data)) {
                return responseData.data.data as T;
            }
            // If it's a wrapped single item response
            if (typeof responseData.data.data === 'object' && responseData.data.data !== null) {
                return responseData.data.data as T;
            }
        }

        // Direct data in responseData.data
        return responseData.data as T;
    }

    // Case 3: Direct data in responseData
    return responseData as T;
}

/**
 * Extracts paginated data from an API response.
 * This is specifically designed for endpoints that return paginated lists.
 *
 * @param response - The axios response object
 * @returns An object containing the data array and pagination metadata
 *
 * @example
 * const response = await apiClient.get('/vacancies?page=1&limit=10');
 * const { data, meta } = extractPaginatedData(response);
 * console.log(`Found ${meta.total} vacancies, showing ${data.length}`);
 */
export function extractPaginatedData<T = any>(
    response: any
): { data: T[]; meta?: PaginatedResponse<T>['meta'] } {
    const extracted = extractApiData<PaginatedResponse<T> | WrappedResponse<T[]> | T[]>(response);

    // Handle paginated format with meta
    if (extracted && typeof extracted === 'object' && !Array.isArray(extracted)) {
        const paginated = extracted as PaginatedResponse<T>;
        if (paginated.data && Array.isArray(paginated.data)) {
            return {
                data: paginated.data,
                meta: paginated.meta,
            };
        }

        // Handle wrapped array format
        const wrapped = extracted as WrappedResponse<T[]>;
        if (wrapped.data && Array.isArray(wrapped.data)) {
            return {
                data: wrapped.data,
            };
        }
    }

    // Handle direct array format
    if (Array.isArray(extracted)) {
        return {
            data: extracted,
        };
    }

    // Fallback to empty array
    return {
        data: [],
    };
}

/**
 * Safely extracts a single item from an API response.
 * Useful for endpoints that return a single object.
 *
 * @param response - The axios response object
 * @returns The extracted item or undefined
 *
 * @example
 * const response = await apiClient.get('/vacancies/123');
 * const vacancy = extractSingleItem(response);
 * console.log(`Vacancy: ${vacancy.title}`);
 */
export function extractSingleItem<T = any>(response: any): T | undefined {
    const extracted = extractApiData<T>(response);

    // Return undefined if no data
    if (extracted === null || extracted === undefined) {
        return undefined;
    }

    return extracted;
}

/**
 * A type-safe wrapper for React Query queryFn that extracts data automatically.
 *
 * @example
 * useQuery({
 *   queryKey: ['vacancies'],
 *   queryFn: () => apiClient.get('/vacancies').then(extractQueryData),
 * })
 */
export function extractQueryData<T = any>(response: any): T {
    return extractApiData<T>(response);
}

/**
 * A type-safe wrapper for React Query queryFn that extracts paginated data automatically.
 *
 * @example
 * useQuery({
 *   queryKey: ['vacancies', page],
 *   queryFn: () => apiClient.get(`/vacancies?page=${page}`).then(extractQueryPaginatedData),
 * })
 */
export function extractQueryPaginatedData<T = any>(
    response: any
): { data: T[]; meta?: PaginatedResponse<T>['meta'] } {
    return extractPaginatedData<T>(response);
}

/**
 * Ensures that the result is an array, handling various response formats.
 * Useful for list endpoints where the API might return different structures.
 *
 * @param data - The data to normalize
 * @returns An array of items
 *
 * @example
 * const result = await apiClient.get('/applications/me');
 * const applications = ensureArray(result.data);
 */
export function ensureArray<T>(data: any): T[] {
    if (Array.isArray(data)) {
        return data;
    }

    if (data && typeof data === 'object') {
        // Check for nested data property
        if (Array.isArray(data.data)) {
            return data.data;
        }
    }

    return [];
}

/**
 * A select function for React Query that normalizes array responses.
 * Use this in the select option of useQuery.
 *
 * @example
 * useQuery({
 *   queryKey: ['applications'],
 *   queryFn: fetchApplications,
 *   select: normalizeArraySelect,
 * })
 */
export function normalizeArraySelect<T>(data: any): T[] {
    return ensureArray<T>(data);
}
