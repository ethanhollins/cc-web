import type { FC } from "react";
import * as Buttons from "@/old/components/base/buttons/buttons.demo";

export default {
  title: "Base components/Buttons",
  decorators: [
    (Story: FC) => (
      <div className="bg-primary flex min-h-screen w-full p-4">
        <Story />
      </div>
    ),
  ],
};

export const Primary = () => <Buttons.Primary />;

export const Secondary = () => <Buttons.Secondary />;

export const Tertiary = () => <Buttons.Tertiary />;

export const LinkGray = () => <Buttons.LinkGray />;
LinkGray.storyName = "Link gray";

export const LinkColor = () => <Buttons.LinkColor />;
LinkColor.storyName = "Link color";

export const DestructivePrimary = () => <Buttons.PrimaryDestructive />;
DestructivePrimary.storyName = "Destructive primary";

export const DestructiveSecondary = () => <Buttons.SecondaryDestructive />;
DestructiveSecondary.storyName = "Destructive secondary";

export const DestructiveTertiary = () => <Buttons.TertiaryDestructive />;
DestructiveTertiary.storyName = "Destructive tertiary";

export const DestructiveLink = () => <Buttons.LinkDestructive />;
DestructiveLink.storyName = "Destructive link";

export const CloseX = () => <Buttons.CloseX />;

export const UtilityButton = () => <Buttons.UtilityButton />;
UtilityButton.storyName = "Utility button";
