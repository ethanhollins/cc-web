import { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
    className?: string;
}>;

export const Card = ({ children, className }: CardProps) => {
    return (
        <section
            className={`ml-[5px] h-[48%] max-w-[400px] flex-1 overflow-x-hidden overflow-y-auto rounded-xl border border-gray-300 bg-white ${className || ""}`}
        >
            {children}
            {/* Spacer */}
            <div className="h-4" />
        </section>
    );
};
