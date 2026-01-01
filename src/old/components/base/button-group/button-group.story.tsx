import type { FC } from "react";
import * as ButtonGroup from "@/old/components/base/button-group/button-group.demo";

export default {
  title: "Base components/Button groups",
  decorators: [
    (Story: FC) => (
      <div className="bg-primary flex min-h-screen w-full p-4">
        <Story />
      </div>
    ),
  ],
};

export const ButtonGroups = () => <ButtonGroup.All />;
ButtonGroups.storyName = "Button groups";
