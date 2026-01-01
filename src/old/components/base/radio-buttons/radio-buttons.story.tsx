import type { FC } from "react";
import * as Radio from "@/old/components/base/radio-buttons/radio-buttons.demo";

export default {
  title: "Base components/Radio buttons",
  decorators: [
    (Story: FC) => (
      <div className="bg-primary flex min-h-screen w-full p-4">
        <Story />
      </div>
    ),
  ],
};

export const RadioButtons = () => <Radio.RadioButtons />;
RadioButtons.storyName = "Radio buttons";

export const RadioButtonsBase = () => <Radio.RadioButtonsBase />;
RadioButtonsBase.storyName = "Radio buttons base";
