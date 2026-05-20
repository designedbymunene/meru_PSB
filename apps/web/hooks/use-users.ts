'use client'

import { useQuery } from '@tanstack/react-query'
import * as usersApi from '@/lib/api/users'
import { toast } from 'sonner'

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => usersApi.getUsers(),
    })
}
