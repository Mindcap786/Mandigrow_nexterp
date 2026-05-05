"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { isNativePlatform, isMobileAppView } from "@/lib/capacitor-utils";
import { NativeMenuApp } from "@/components/mobile/NativeMenuApp";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MenuPage() {
    const router = useRouter();

    useEffect(() => {
        if (!isMobileAppView()) {
            router.replace("/dashboard");
        }
    }, [router]);

    if (!isMobileAppView()) return null;

    return (
        <ProtectedRoute>
            <NativeMenuApp />
        </ProtectedRoute>
    );
}
