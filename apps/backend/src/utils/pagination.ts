export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 100

export const parsePagination = (
    pageRaw?: string | null,
    limitRaw?: string | null,
    defaults = { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT }
) => {
    const parsedPage = Number.parseInt(pageRaw || `${defaults.page}`, 10)
    const parsedLimit = Number.parseInt(limitRaw || `${defaults.limit}`, 10)

    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : defaults.page
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_LIMIT)
        : defaults.limit
    const offset = (page - 1) * limit

    return { page, limit, offset }
}

export const buildPagination = (total: number, page: number, limit: number) => ({
    total,
    page,
    limit,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit)
})
