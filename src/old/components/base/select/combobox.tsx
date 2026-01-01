"use client";

import type { FocusEventHandler, PointerEventHandler, RefAttributes, RefObject } from "react";
import { useCallback, useContext, useRef, useState } from "react";
import { SearchLg as SearchIcon } from "@untitledui/icons";
import type { ComboBoxProps as AriaComboBoxProps, GroupProps as AriaGroupProps, ListBoxProps as AriaListBoxProps } from "react-aria-components";
import { ComboBox as AriaComboBox, Group as AriaGroup, Input as AriaInput, ListBox as AriaListBox, ComboBoxStateContext } from "react-aria-components";
import { HintText } from "@/old/components/base/input/hint-text";
import { Label } from "@/old/components/base/input/label";
import { Popover } from "@/old/components/base/select/popover";
import { type CommonProps, SelectContext, type SelectItemType, sizes } from "@/old/components/base/select/select";
import { useResizeObserver } from "@/old/hooks/use-resize-observer";
import { cx } from "@/old/utils/cx";

interface ComboBoxProps extends Omit<AriaComboBoxProps<SelectItemType>, "children" | "items">, RefAttributes<HTMLDivElement>, CommonProps {
  shortcut?: boolean;
  items?: SelectItemType[];
  popoverClassName?: string;
  shortcutClassName?: string;
  children: AriaListBoxProps<SelectItemType>["children"];
}

interface ComboBoxValueProps extends AriaGroupProps {
  size: "sm" | "md";
  shortcut: boolean;
  placeholder?: string;
  shortcutClassName?: string;
  onFocus?: FocusEventHandler;
  onPointerEnter?: PointerEventHandler;
  ref?: RefObject<HTMLDivElement | null>;
}

const ComboBoxValue = ({ size, shortcut, placeholder, shortcutClassName, ...otherProps }: ComboBoxValueProps) => {
  const state = useContext(ComboBoxStateContext);

  const value = state?.selectedItem?.value || null;
  const inputValue = state?.inputValue || null;

  const first = inputValue?.split(value?.supportingText)?.[0] || "";
  const last = inputValue?.split(first)[1];

  return (
    <AriaGroup
      {...otherProps}
      className={({ isFocusWithin, isDisabled }) =>
        cx(
          "bg-primary shadow-xs ring-primary outline-hidden relative flex w-full items-center gap-2 rounded-lg ring-1 ring-inset transition-shadow duration-100 ease-linear",
          isDisabled && "bg-disabled_subtle cursor-not-allowed",
          isFocusWithin && "ring-brand ring-2",
          sizes[size].root,
        )
      }
    >
      {({ isDisabled }) => (
        <>
          <SearchIcon className="text-fg-quaternary pointer-events-none size-5 shrink-0" />

          <div className="relative flex w-full items-center gap-2">
            {inputValue && (
              <span className="absolute top-1/2 z-0 inline-flex w-full -translate-y-1/2 gap-2 truncate" aria-hidden="true">
                <p className={cx("text-md text-primary font-medium", isDisabled && "text-disabled")}>{first}</p>
                {last && <p className={cx("-ml-0.75 text-md text-tertiary", isDisabled && "text-disabled")}>{last}</p>}
              </span>
            )}

            <AriaInput
              placeholder={placeholder}
              className="text-md caret-alpha-black/90 placeholder:text-placeholder focus:outline-hidden disabled:text-disabled disabled:placeholder:text-disabled z-10 w-full appearance-none bg-transparent text-transparent disabled:cursor-not-allowed"
            />
          </div>

          {shortcut && (
            <div
              className={cx(
                "bg-linear-to-r to-bg-primary absolute inset-y-0.5 right-0.5 z-10 flex items-center rounded-r-[inherit] from-transparent to-40% pl-8",
                isDisabled && "to-bg-disabled_subtle",
                sizes[size].shortcut,
                shortcutClassName,
              )}
            >
              <span
                className={cx(
                  "text-quaternary ring-secondary pointer-events-none select-none rounded px-1 py-px text-xs font-medium ring-1 ring-inset",
                  isDisabled && "text-disabled bg-transparent",
                )}
                aria-hidden="true"
              >
                ⌘K
              </span>
            </div>
          )}
        </>
      )}
    </AriaGroup>
  );
};

export const ComboBox = ({ placeholder = "Search", shortcut = true, size = "sm", children, items, shortcutClassName, ...otherProps }: ComboBoxProps) => {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [popoverWidth, setPopoverWidth] = useState("");

  // Resize observer for popover width
  const onResize = useCallback(() => {
    if (!placeholderRef.current) return;

    const divRect = placeholderRef.current?.getBoundingClientRect();

    setPopoverWidth(divRect.width + "px");
  }, [placeholderRef, setPopoverWidth]);

  useResizeObserver({
    ref: placeholderRef,
    box: "border-box",
    onResize,
  });

  return (
    <SelectContext.Provider value={{ size }}>
      <AriaComboBox menuTrigger="focus" {...otherProps}>
        {(state) => (
          <div className="flex flex-col gap-1.5">
            {otherProps.label && (
              <Label isRequired={state.isRequired} tooltip={otherProps.tooltip}>
                {otherProps.label}
              </Label>
            )}

            <ComboBoxValue
              ref={placeholderRef}
              placeholder={placeholder}
              shortcut={shortcut}
              shortcutClassName={shortcutClassName}
              size={size}
              // This is a workaround to correctly calculating the trigger width
              // while using ResizeObserver wasn't 100% reliable.
              onFocus={onResize}
              onPointerEnter={onResize}
            />

            <Popover size={size} triggerRef={placeholderRef} style={{ width: popoverWidth }} className={otherProps.popoverClassName}>
              <AriaListBox items={items} className="outline-hidden size-full">
                {children}
              </AriaListBox>
            </Popover>

            {otherProps.hint && <HintText isInvalid={state.isInvalid}>{otherProps.hint}</HintText>}
          </div>
        )}
      </AriaComboBox>
    </SelectContext.Provider>
  );
};
