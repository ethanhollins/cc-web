"use client";

import React from "react";
import { Bell01, Mail01, MessageTextSquare01, Ticket01 } from "@untitledui/icons";
import { Card } from "./Card";
import { CardHeader } from "./CardHeader";

type NotificationType = "ticket" | "chat" | "mail";

export type NotificationItem = {
    id: string;
    type: NotificationType;
    title: string;
    timeAgo: string; // e.g. "5 min ago"
    unread?: boolean; // blue dot on the right + light row bg
    href?: string; // optional link
};

type Props = {
    items: NotificationItem[];
    newCount?: number; // top-right "2 new" pill
};

export default function NotificationsCard({ items, newCount = items.filter((i) => i.unread).length }: Props) {
    function IconFor({ type }: { type: NotificationType }) {
        const base = "size-3";
        if (type === "ticket") return <Ticket01 className={`${base} text-orange-600`} />;
        if (type === "chat") return <MessageTextSquare01 className={`${base} text-green-600`} />;
        return <Mail01 className={`${base} text-blue-700`} />;
    }

    return (
        <Card className="mt-2 mb-2 flex-6">
            <CardHeader title="Recent Notifications" className="text-blue-950" headerIcon={<Bell01 className="size-5 text-blue-800" />}>
                {!!newCount && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900 select-none">{newCount} new</span>}
            </CardHeader>
            <ul>
                {items.map((n, idx) => {
                    const RowTag = n.href ? "a" : "div";
                    const content = (
                        <>
                            <div className="flex items-center gap-3">
                                <IconFor type={n.type} />
                                <p className="truncate text-xs font-medium whitespace-nowrap text-gray-900">{n.title}</p>
                            </div>

                            <div className="ml-4 flex items-center gap-3">
                                <span className="text-xs text-gray-500">{n.timeAgo}</span>
                                {n.unread && <span aria-label="unread" className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                            </div>
                        </>
                    );

                    return (
                        <li key={n.id}>
                            <RowTag
                                {...(n.href ? { href: n.href } : {})}
                                className={[
                                    "flex items-center justify-between gap-2 px-4 py-3",
                                    n.unread ? "bg-blue-50/30" : "",
                                    n.href ? "ring-0 outline-none hover:bg-gray-50/50 focus:bg-gray-50/50" : "",
                                ].join(" ")}
                            >
                                {content}
                            </RowTag>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}
