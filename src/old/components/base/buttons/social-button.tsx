"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { cx, sortCx } from "@/old/utils/cx";
import { AppleLogo, DribbleLogo, FacebookLogo, FigmaLogo, FigmaLogoOutlined, GoogleLogo, TwitterLogo } from "./social-logos";

export const styles = sortCx({
  common: {
    root: "outline-focus-ring disabled:stroke-fg-disabled disabled:text-fg-disabled disabled:*:text-fg-disabled group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap font-semibold transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed",
    icon: "transition-inherit-all pointer-events-none shrink-0",
  },

  sizes: {
    sm: {
      root: "data-icon-only:p-2 gap-2 rounded-lg px-3 py-2 text-sm before:rounded-[7px]",
    },
    md: {
      root: "data-icon-only:p-2.5 gap-2.5 rounded-lg px-3.5 py-2.5 text-sm before:rounded-[7px]",
    },
    lg: {
      root: "text-md data-icon-only:p-2.5 gap-3 rounded-lg px-4 py-2.5 before:rounded-[7px]",
    },
    xl: {
      root: "px-4.5 text-md data-icon-only:p-3.5 gap-3.5 rounded-lg py-3 before:rounded-[7px]",
    },
    "2xl": {
      root: "px-5.5 data-icon-only:p-4 gap-4 rounded-[10px] py-4 text-lg before:rounded-[9px]",
    },
  },

  colors: {
    gray: {
      root: "bg-primary text-secondary shadow-xs-skeumorphic ring-primary hover:bg-primary_hover hover:text-secondary_hover ring-1 ring-inset",
      icon: "text-fg-quaternary group-hover:text-fg-quaternary_hover",
    },
    black: {
      root: "shadow-xs-skeumorphic before:border-white/12 before:mask-b-from-0% bg-black text-white ring-1 ring-inset ring-transparent before:absolute before:inset-px before:border",
      icon: "",
    },

    facebook: {
      root: "shadow-xs-skeumorphic before:border-white/12 before:mask-b-from-0% bg-[#1877F2] text-white ring-1 ring-inset ring-transparent before:absolute before:inset-px before:border hover:bg-[#0C63D4]",
      icon: "",
    },

    dribble: {
      root: "shadow-xs-skeumorphic before:border-white/12 before:mask-b-from-0% bg-[#EA4C89] text-white ring-1 ring-inset ring-transparent before:absolute before:inset-px before:border hover:bg-[#E62872]",
      icon: "",
    },
  },
});

interface CommonProps {
  social: "google" | "facebook" | "apple" | "twitter" | "figma" | "dribble";
  disabled?: boolean;
  theme?: "brand" | "color" | "gray";
  size?: keyof typeof styles.sizes;
}

interface ButtonProps extends CommonProps, DetailedHTMLProps<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "slot">, HTMLButtonElement> {
  slot?: AriaButtonProps["slot"];
}

interface LinkProps extends CommonProps, DetailedHTMLProps<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">, HTMLAnchorElement> {}

export type SocialButtonProps = ButtonProps | LinkProps;

export const SocialButton = ({ size = "lg", theme = "brand", social, className, children, disabled, ...otherProps }: SocialButtonProps) => {
  const href = "href" in otherProps ? otherProps.href : undefined;
  const Component = href ? AriaLink : AriaButton;

  const isIconOnly = !children;

  const socialToColor = {
    google: "gray",
    facebook: "facebook",
    apple: "black",
    twitter: "black",
    figma: "black",
    dribble: "dribble",
  } as const;

  const colorStyles = theme === "brand" ? styles.colors[socialToColor[social]] : styles.colors.gray;

  const logos = {
    google: GoogleLogo,
    facebook: FacebookLogo,
    apple: AppleLogo,
    twitter: TwitterLogo,
    figma: theme === "gray" ? FigmaLogoOutlined : FigmaLogo,
    dribble: DribbleLogo,
  };

  const Logo = logos[social];

  let props = {};

  if (href) {
    props = {
      ...otherProps,

      href: disabled ? undefined : href,

      // Since anchor elements do not support the `disabled` attribute and state,
      // we need to specify `data-rac` and `data-disabled` in order to be able
      // to use the `disabled:` selector in classes.
      ...(disabled ? { "data-rac": true, "data-disabled": true } : {}),
    };
  } else {
    props = {
      ...otherProps,

      type: otherProps.type || "button",
      isDisabled: disabled,
    };
  }

  return (
    <Component
      isDisabled={disabled}
      {...props}
      data-icon-only={isIconOnly ? true : undefined}
      className={cx(styles.common.root, styles.sizes[size].root, colorStyles.root, className)}
    >
      <Logo
        className={cx(
          styles.common.icon,
          theme === "gray"
            ? colorStyles.icon
            : theme === "brand" && (social === "facebook" || social === "apple" || social === "twitter")
              ? "text-white"
              : theme === "color" && (social === "apple" || social === "twitter")
                ? "text-alpha-black"
                : "",
        )}
        colorful={
          (theme === "brand" && (social === "google" || social === "figma")) ||
          (theme === "color" && (social === "google" || social === "facebook" || social === "figma" || social === "dribble")) ||
          undefined
        }
      />

      {children}
    </Component>
  );
};
