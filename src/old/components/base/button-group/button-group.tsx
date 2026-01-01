"use client";

import { type FC, type PropsWithChildren, type ReactNode, type RefAttributes, createContext, isValidElement, useContext } from "react";
import {
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "react-aria-components";
import { cx, sortCx } from "@/old/utils/cx";
import { isReactComponent } from "@/old/utils/is-react-component";

export const styles = sortCx({
  common: {
    root: [
      "group/button-group bg-primary text-secondary shadow-skeumorphic ring-primary outline-brand inline-flex h-max cursor-pointer items-center whitespace-nowrap font-semibold ring-1 ring-inset transition duration-100 ease-linear",
      // Hover and focus styles
      "hover:bg-primary_hover hover:text-secondary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
      // Disabled styles
      "disabled:bg-primary disabled:text-disabled disabled:cursor-not-allowed",
      // Selected styles
      "selected:bg-active selected:text-secondary_hover selected:disabled:bg-disabled_subtle",
    ].join(" "),
    icon: "text-fg-quaternary group-hover/button-group:text-fg-quaternary_hover group-disabled/button-group:text-fg-disabled_subtle pointer-events-none transition-[inherit]",
  },

  sizes: {
    sm: {
      root: "not-last:pr-[calc(calc(var(--spacing)*3.5)+1px)] data-icon-leading:pl-3 data-icon-only:p-2 gap-1.5 px-3.5 py-2 text-sm first:rounded-l-lg last:rounded-r-lg",
      icon: "size-5",
    },
    md: {
      root: "not-last:pr-[calc(calc(var(--spacing)*4)+1px)] data-icon-leading:pl-3.5 data-icon-only:px-3 gap-1.5 px-4 py-2.5 text-sm first:rounded-l-lg last:rounded-r-lg",
      icon: "size-5",
    },
    lg: {
      root: "px-4.5 text-md not-last:pr-[calc(calc(var(--spacing)*4.5)+1px)] data-icon-leading:pl-4 data-icon-only:p-3 gap-2 py-2.5 first:rounded-l-lg last:rounded-r-lg",
      icon: "size-5",
    },
  },
});

type ButtonSize = keyof typeof styles.sizes;

const ButtonGroupContext = createContext<{ size: ButtonSize }>({ size: "md" });

interface ButtonGroupItemProps extends ToggleButtonProps, RefAttributes<HTMLButtonElement> {
  iconLeading?: FC<{ className?: string }> | ReactNode;
  iconTrailing?: FC<{ className?: string }> | ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ButtonGroupItem = ({
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  children,
  className,
  ...otherProps
}: PropsWithChildren<ButtonGroupItemProps>) => {
  const context = useContext(ButtonGroupContext);

  if (!context) {
    throw new Error("ButtonGroupItem must be used within a ButtonGroup component");
  }

  const { size } = context;

  const isIcon = (IconLeading || IconTrailing) && !children;

  return (
    <AriaToggleButton
      {...otherProps}
      data-icon-only={isIcon ? true : undefined}
      data-icon-leading={IconLeading ? true : undefined}
      className={cx(styles.common.root, styles.sizes[size].root, className)}
    >
      {isReactComponent(IconLeading) && <IconLeading className={cx(styles.common.icon, styles.sizes[size].icon)} />}
      {isValidElement(IconLeading) && IconLeading}

      {children}

      {isReactComponent(IconTrailing) && <IconTrailing className={cx(styles.common.icon, styles.sizes[size].icon)} />}
      {isValidElement(IconTrailing) && IconTrailing}
    </AriaToggleButton>
  );
};

interface ButtonGroupProps extends Omit<ToggleButtonGroupProps, "orientation">, RefAttributes<HTMLDivElement> {
  size?: ButtonSize;
  className?: string;
}

export const ButtonGroup = ({ children, size = "md", className, ...otherProps }: ButtonGroupProps) => {
  return (
    <ButtonGroupContext.Provider value={{ size }}>
      <AriaToggleButtonGroup
        selectionMode="single"
        className={cx("shadow-xs relative z-0 inline-flex w-max -space-x-px rounded-lg", className)}
        {...otherProps}
      >
        {children}
      </AriaToggleButtonGroup>
    </ButtonGroupContext.Provider>
  );
};
