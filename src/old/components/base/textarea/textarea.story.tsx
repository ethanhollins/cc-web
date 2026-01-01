import type { FC } from "react";
import * as TextAreas from "@/old/components/base/textarea/textarea.demo";

export default {
  title: "Base components/Inputs/Textarea",
  decorators: [
    (Story: FC) => (
      <div className="bg-primary flex min-h-screen w-full p-4">
        <Story />
      </div>
    ),
  ],
};

export const Textarea = () => <TextAreas.Textarea />;
