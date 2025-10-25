import { useEffect, useMemo, useRef, useState } from "react";
import { EventSourceInput } from "@fullcalendar/core/index.js";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { TicketEvent } from "@/app/home-screen";
import "@/styles/calendar.css";

interface DayCalendarProps {
    events: EventSourceInput;
    onDateChange?: (date: Date) => void;
    onEventClick?: (eventId: string) => void;
}

function weekOfMonth(d: Date) {
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const monday0 = (first.getDay() + 6) % 7;
    return Math.floor((d.getDate() + monday0 - 1) / 7) + 1;
}

export default function DayCalendar({ events = [], onDateChange, onEventClick }: DayCalendarProps) {
    const calRef = useRef<FullCalendar | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Track the selected date in the calendar
    const [selectedDate, setSelectedDate] = useState(() => new Date());

    const now = useMemo(() => new Date(), []);
    const weekday = selectedDate.toLocaleString("en-US", { weekday: "long" });

    // Calculate scroll time: current time minus 1 hour, minimum 00:00:00
    const scrollTime = useMemo(() => {
        const currentHour = now.getHours();
        const scrollHour = Math.max(0, currentHour - 1);
        return `${scrollHour.toString().padStart(2, "0")}:00:00`;
    }, [now]);

    // Handle clicks outside the calendar to unselect
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                const api = calRef.current?.getApi();
                api?.unselect();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} className="flex h-full w-full flex-col px-1 py-3">
            {/* Header */}
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Date badge */}
                    <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-gray-200 text-[11px] shadow-sm">
                        <div className="font-medium tracking-wide text-gray-500 uppercase">{selectedDate.toLocaleString("en-US", { month: "short" })}</div>
                        <div className="text-2xl leading-6 font-semibold">{selectedDate.getDate()}</div>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-semibold">{weekday}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            {selectedDate.toLocaleString("en-US", { month: "long" })} {selectedDate.getFullYear()}
                        </div>
                    </div>
                </div>

                {/* Right-side controls (no FC title, no overlap) */}
                <div className="flex items-center rounded-lg border border-gray-200 shadow-sm">
                    <button
                        className="cursor-pointer rounded-l-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                        onClick={() => {
                            const api = calRef.current?.getApi();
                            api?.prev();
                            // Update selected date to match the new calendar view
                            const newDate = api?.getDate();
                            if (newDate) {
                                setSelectedDate(new Date(newDate));
                                onDateChange?.(new Date(newDate));
                            }
                        }}
                    >
                        ‹
                    </button>
                    <button
                        className="cursor-pointer border-x border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                        onClick={() => {
                            const api = calRef.current?.getApi();
                            api?.today();
                            // Update selected date to today
                            setSelectedDate(new Date());
                            onDateChange?.(new Date());
                        }}
                    >
                        Today
                    </button>
                    <button
                        className="cursor-pointer rounded-r-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                        onClick={() => {
                            const api = calRef.current?.getApi();
                            api?.next();
                            // Update selected date to match the new calendar view
                            const newDate = api?.getDate();
                            if (newDate) {
                                setSelectedDate(new Date(newDate));
                                onDateChange?.(new Date(newDate));
                            }
                        }}
                    >
                        ›
                    </button>
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-1">
                <FullCalendar
                    ref={calRef}
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridDay"
                    /** hide built-in toolbar entirely so we control header layout */
                    headerToolbar={false}
                    height="100%"
                    expandRows
                    dayHeaders={false}
                    allDaySlot={false}
                    slotDuration="00:30:00"
                    snapDuration="00:05:00"
                    slotMinTime="00:00:00"
                    slotMaxTime="24:00:00"
                    slotLabelFormat={{ hour: "numeric", meridiem: "short" }} // 1 am
                    nowIndicator
                    scrollTime={scrollTime}
                    timeZone="Australia/Melbourne"
                    selectable
                    selectMirror
                    unselectAuto={false}
                    longPressDelay={200}
                    selectLongPressDelay={200}
                    events={events}
                    eventMinHeight={5}
                    // eventBackgroundColor="#F8DCE5"
                    // eventBorderColor="#EFC3D2"
                    // eventTextColor="#6F2A41"
                    eventClassNames={() => ["rounded-lg", "px-3", "py-1", "shadow-[inset_0_0_0_1px_#f1cad6]"]}
                    eventContent={(arg) => {
                        // Calculate event duration in minutes
                        const start = arg.event.start;
                        const end = arg.event.end;
                        const durationMinutes = start && end ? (end.getTime() - start.getTime()) / (1000 * 60) : 60;

                        // Use compact layout for events less than 30 minutes
                        const isShortEvent = durationMinutes < 30;

                        if (isShortEvent) {
                            const durationText = `${Math.round(durationMinutes)}m`;

                            return (
                                <div className="flex items-center justify-between gap-1 leading-4">
                                    <div className="flex-1 truncate text-xs font-medium">{arg.event.title}</div>
                                    <div className="text-xs whitespace-nowrap opacity-70">{durationText}</div>
                                </div>
                            );
                        }

                        // Default layout for longer events
                        return (
                            <div className="leading-5">
                                <div className="font-semibold">{arg.event.title}</div>
                                <div className="text-xs opacity-70">{arg.timeText}</div>
                            </div>
                        );
                    }}
                    datesSet={(dateInfo) => {
                        // Update selected date when calendar view changes
                        const newDate = new Date(dateInfo.start);
                        setSelectedDate(newDate);
                        onDateChange?.(newDate);
                    }}
                    select={(info) => console.log("selected", info.start, info.end)}
                    eventClick={(info) => onEventClick?.(info.event.id)}
                />
            </div>
        </div>
    );
}
