"use client"

import { useState, useEffect, useCallback } from "react"
import { User } from "firebase/auth"
import { auth, onAuthStateChanged, getIdTokenResult } from "@/lib/firebase"

export interface AuthUser extends User {
    role?: string
    isPremium?: boolean
    customClaims?: Record<string, any>
}

export const useUser = () => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const handleAuthChange = useCallback(async (firebaseUser: User | null) => {
        try {
            if (firebaseUser) {
                // Get the ID token result to access custom claims
                const tokenResult = await getIdTokenResult(firebaseUser)

                const extendedUser: AuthUser = {
                    ...firebaseUser,
                    role: tokenResult.claims.role as string || undefined,
                    isPremium: tokenResult.claims.premium as boolean || false,
                    customClaims: tokenResult.claims
                }

                setUser(extendedUser)
            } else {
                setUser(null)
            }
        } catch (err) {
            setError(err as Error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, handleAuthChange)
        return () => unsubscribe()
    }, [handleAuthChange])

    const refreshUser = useCallback(async () => {
        try {
            setLoading(true)
            await auth.currentUser?.reload()
            const currentUser = auth.currentUser
            if (currentUser) {
                await handleAuthChange(currentUser)
            } else {
                setUser(null)
            }
        } catch (err) {
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [handleAuthChange])

    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        refreshUser,
        // Helper methods
        isAdmin: user?.role === 'admin',
        isPremiumUser: user?.isPremium,
        hasRole: (role: string) => user?.role === role,
        hasClaim: (claim: string) => user?.customClaims?.[claim]
    }
}