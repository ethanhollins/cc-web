import type { FC } from "react";
import * as Checkbox from "@/old/components/base/checkbox/checkbox.demo";

export default {
  title: "Base components/Checkboxes",
  decorators: [
    (Story: FC) => (
      <div className="bg-primary flex min-h-screen w-full p-4">
        <Story />
      </div>
    ),
  ],
};

export const Checkboxes = () => <Checkbox.Checkboxes />;

export const CheckboxBase = () => <Checkbox.CheckboxBase />;
CheckboxBase.storyName = "Checkbox base";
