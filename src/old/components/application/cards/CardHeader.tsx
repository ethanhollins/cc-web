import { PropsWithChildren, ReactNode } from "react";

type CardHeaderProps = PropsWithChildren<{
  title: string;
  className?: string;
  headerIcon?: ReactNode;
}>;

export const CardHeader = ({ title, className, headerIcon, children }: CardHeaderProps) => {
  return (
    <div className="sticky top-0 z-20 flex min-h-12 items-center justify-between bg-white px-5 py-3" role="banner" aria-hidden="false">
      <span className={`text-md mr-2 flex items-center gap-2 font-semibold ${className}`}>
        {headerIcon}
        {title}
      </span>
      {children}
    </div>
  );
};
