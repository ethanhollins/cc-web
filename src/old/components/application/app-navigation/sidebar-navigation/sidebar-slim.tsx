"use client";

import type { FC } from "react";
import { useState } from "react";
import { CubeOutline, LifeBuoy01, LogOut01, Settings01 } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { AvatarLabelGroup } from "@/old/components/base/avatar/avatar-label-group";
import { Button } from "@/old/components/base/buttons/button";
import { ButtonUtility } from "@/old/components/base/buttons/button-utility";
import { UntitledLogo } from "@/old/components/foundations/logo/untitledui-logo";
import { cx } from "@/old/utils/cx";
import { MobileNavigationHeader } from "../base-components/mobile-header";
import { NavItemBase } from "../base-components/nav-item";
import { NavItemButton } from "../base-components/nav-item-button";
import { NavList } from "../base-components/nav-list";
import type { NavItemType } from "../config";

interface SidebarNavigationSlimProps {
  /** URL of the currently active item. */
  activeUrl?: string;
  /** List of items to display. */
  items: (NavItemType & { icon?: FC<{ className?: string }> })[];
  /** List of footer items to display. */
  footerItems?: (NavItemType & { icon?: FC<{ className?: string }> })[];
  /** Whether to hide the border. */
  hideBorder?: boolean;
  /** Whether to hide the right side border. */
  hideRightBorder?: boolean;
}

export const SidebarNavigationSlim = ({ activeUrl, items, footerItems = [], hideBorder, hideRightBorder }: SidebarNavigationSlimProps) => {
  const activeItem = [...items, ...footerItems].find((item) => item.href === activeUrl || item.items?.some((subItem) => subItem.href === activeUrl));
  const [currentItem, setCurrentItem] = useState(activeItem || items[1]);
  const [isHovering, setIsHovering] = useState(false);

  const isSecondarySidebarVisible = isHovering && Boolean(currentItem.items?.length);

  const MAIN_SIDEBAR_WIDTH = 68;
  const SECONDARY_SIDEBAR_WIDTH = 268;

  const mainSidebar = (
    <aside
      style={{
        width: MAIN_SIDEBAR_WIDTH,
      }}
      className="fullscreen bg-primary group flex h-full max-h-full max-w-full overflow-y-auto py-1 pl-1"
    >
      <div
        className={cx(
          "ring-secondary flex w-auto flex-col justify-between rounded-xl pt-5 ring-1 ring-inset transition duration-300",
          hideBorder && !isSecondarySidebarVisible && "ring-transparent",
        )}
      >
        <div className="flex justify-center px-3">
          <CubeOutline className="size-8 text-sky-800" />
        </div>

        <ul className="mt-4 flex flex-col gap-0.5 px-3">
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <li key={`divider-${index}`} className="my-2">
                  <div className="bg-border-secondary h-px" />
                </li>
              );
            }
            return (
              <li key={item.label}>
                <NavItemButton
                  size="md"
                  current={currentItem.href === item.href}
                  href={item.href}
                  label={item.label || ""}
                  icon={item.icon!}
                  onClick={() => setCurrentItem(item)}
                  external={item.external}
                  appUrl={item.appUrl}
                />
              </li>
            );
          })}
        </ul>
        <div className="mt-auto flex flex-col gap-4 px-3 py-5">
          {footerItems.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {footerItems.map((item, index) => {
                if (item.divider) {
                  return (
                    <li key={`divider-${index}`} className="my-2">
                      <div className="bg-border-secondary h-px" />
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <NavItemButton
                      size="md"
                      current={currentItem.href === item.href}
                      label={item.label || ""}
                      href={item.href}
                      icon={item.icon!}
                      onClick={() => setCurrentItem(item)}
                      external={item.external}
                      appUrl={item.appUrl}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );

  const secondarySidebar = (
    <AnimatePresence initial={false}>
      {isSecondarySidebarVisible && (
        <motion.div
          initial={{ width: 0, borderColor: "var(--color-border-secondary)" }}
          animate={{ width: SECONDARY_SIDEBAR_WIDTH, borderColor: "var(--color-border-secondary)" }}
          exit={{ width: 0, borderColor: "rgba(0,0,0,0)", transition: { borderColor: { type: "tween", delay: 0.05 } } }}
          transition={{ type: "spring", damping: 26, stiffness: 220, bounce: 0 }}
          className={cx("bg-primary relative h-full overflow-y-auto overflow-x-hidden", !(hideBorder || hideRightBorder) && "box-content border-r-[1.5px]")}
        >
          <div style={{ width: SECONDARY_SIDEBAR_WIDTH }} className="flex h-full flex-col px-4 pt-6">
            <h3 className="text-brand-secondary text-sm font-semibold">{currentItem.label}</h3>
            <ul className="py-2">
              {currentItem.items?.map((item) => (
                <li key={item.label} className="py-0.5">
                  <NavItemBase current={activeUrl === item.href} href={item.href} icon={item.icon} badge={item.badge} type="link">
                    {item.label}
                  </NavItemBase>
                </li>
              ))}
            </ul>
            <div className="border-secondary bg-primary sticky bottom-0 mt-auto flex justify-between border-t px-2 py-5">
              <div>
                <p className="text-primary text-sm font-semibold">Olivia Rhye</p>
                <p className="text-tertiary text-sm">olivia@untitledui.com</p>
              </div>
              <div className="absolute right-0 top-2.5">
                <ButtonUtility size="sm" color="tertiary" tooltip="Log out" icon={LogOut01} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Desktop sidebar navigation */}
      <div
        className="z-50 hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex"
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
      >
        {mainSidebar}
        {secondarySidebar}
      </div>

      {/* Placeholder to take up physical space because the real sidebar has `fixed` position. */}
      <div
        style={{
          paddingLeft: MAIN_SIDEBAR_WIDTH,
        }}
        className="invisible hidden lg:sticky lg:bottom-0 lg:left-0 lg:top-0 lg:block"
      />

      {/* Mobile header navigation */}
      <MobileNavigationHeader>
        <aside className="bg-primary group flex h-full max-h-full w-full max-w-full flex-col justify-between overflow-y-auto pt-4">
          <div className="px-4">
            <UntitledLogo className="h-8" />
          </div>

          <NavList items={items} />

          <div className="mt-auto flex flex-col gap-5 px-2 py-4">
            <div className="flex flex-col gap-2">
              <NavItemBase current={activeUrl === "/support"} type="link" href="/support" icon={LifeBuoy01}>
                Support
              </NavItemBase>
              <NavItemBase current={activeUrl === "/settings"} type="link" href="/settings" icon={Settings01}>
                Settings
              </NavItemBase>
            </div>

            <div className="border-secondary relative flex items-center gap-3 border-t pl-2 pr-8 pt-6">
              <AvatarLabelGroup
                status="online"
                size="md"
                src="https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80"
                title="Olivia Rhye"
                subtitle="olivia@untitledui.com"
              />

              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <Button
                  size="sm"
                  color="tertiary"
                  iconLeading={<LogOut01 className="text-fg-quaternary transition-inherit-all group-hover:text-fg-quaternary_hover size-5" />}
                  className="p-1.5!"
                />
              </div>
            </div>
          </div>
        </aside>
      </MobileNavigationHeader>
    </>
  );
};
