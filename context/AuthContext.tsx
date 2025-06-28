"use client"

import { createContext, useContext, ReactNode } from "react"
import { useUser } from "@/hooks/useUser"

interface AuthContextType {
    user: ReturnType<typeof useUser>["user"]
    loading: boolean
    error: Error | null
    isAuthenticated: boolean
    refreshUser: () => Promise<void>
    isAdmin: boolean
    isPremiumUser: boolean
    hasRole: (role: string) => boolean
    hasClaim: (claim: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    refreshUser: async () => { },
    isAdmin: false,
    isPremiumUser: false,
    hasRole: () => false,
    hasClaim: () => false
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useUser()

    return (
        <AuthContext.Provider value={{ ...auth, isPremiumUser: auth.isPremiumUser ?? false }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)