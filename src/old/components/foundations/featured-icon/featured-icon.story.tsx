import type { FC } from "react";
import * as Demos from "./featured-icon.demo";

export default {
  title: "Base components/Featured Icons",
  decorators: [
    (Story: FC) => (
      <div className="bg-primary flex min-h-screen w-full overflow-auto p-8">
        <Story />
      </div>
    ),
  ],
};

export const Light = () => <Demos.LightDemo />;

export const Gradient = () => <Demos.GradientDemo />;

export const Dark = () => <Demos.DarkDemo />;

export const Modern = () => <Demos.ModernDemo />;

export const ModernNeue = () => <Demos.ModernNeueDemo />;

export const Outline = () => <Demos.OutlineDemo />;
