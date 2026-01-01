import * as Buttons from "@/old/components/base/buttons/app-store-buttons.demo";

export default {
  title: "Base components/Buttons/Mobile app store buttons",
};

export const MobileAppStoreButtons = () => (
  <div className="bg-primary flex min-h-screen w-full flex-col gap-16 p-8">
    <Buttons.Md />
    <Buttons.Lg />
  </div>
);
MobileAppStoreButtons.storyName = "Mobile app store buttons";
