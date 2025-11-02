import React from "react";

interface LoadingSkeletonProps {
    className?: string;
    height?: string;
}

export function LoadingSkeleton({ className = "", height = "h-4" }: LoadingSkeletonProps) {
    return <div className={`animate-pulse rounded bg-gray-200 ${height} ${className}`} />;
}

export function LoadingSpinner({ size = "6" }: { size?: string }) {
    return (
        <div className="flex items-center justify-center">
            <div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-gray-600`}></div>
        </div>
    );
}

export function TicketDataSkeleton() {
    return (
        <div className="space-y-4">
            {/* Header skeleton */}
            <div className="flex items-center gap-2">
                <LoadingSkeleton className="h-6 w-16" />
                <LoadingSkeleton className="h-6 w-20" />
            </div>

            {/* Title skeleton */}
            <LoadingSkeleton className="h-6 w-3/4" />

            {/* Description skeleton */}
            <div className="space-y-2">
                <LoadingSkeleton className="h-4 w-full" />
                <LoadingSkeleton className="h-4 w-5/6" />
                <LoadingSkeleton className="h-4 w-4/5" />
            </div>
        </div>
    );
}

export function DescriptionContentSkeleton() {
    return (
        <div className="space-y-2">
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-11/12" />
            <LoadingSkeleton className="h-4 w-4/5" />
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-3/4" />
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="space-y-4">
            {/* Status skeleton */}
            <LoadingSkeleton className="h-8 w-24" />

            {/* Assignee skeleton */}
            <div className="flex items-center gap-3">
                <LoadingSkeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                    <LoadingSkeleton className="h-4 w-24" />
                    <LoadingSkeleton className="h-3 w-16" />
                </div>
            </div>

            {/* Details skeleton */}
            <div className="space-y-2">
                <LoadingSkeleton className="h-4 w-full" />
                <LoadingSkeleton className="h-4 w-5/6" />
                <LoadingSkeleton className="h-4 w-4/5" />
            </div>
        </div>
    );
}
