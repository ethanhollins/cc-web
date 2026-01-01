import { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export const Card = ({ children, className }: CardProps) => {
  return (
    <section className={`ml-2 h-[48%] max-w-[400px] flex-1 overflow-y-auto overflow-x-hidden ${className || ""}`}>
      {children}
      {/* Spacer */}
      <div className="h-4" />
    </section>
  );
};
