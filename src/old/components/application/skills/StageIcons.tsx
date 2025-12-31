import React from "react";
import { SkillStage } from "@/types/skills";

type StageIconProps = {
    stage: SkillStage;
    className?: string;
};

/**
 * Stage icons for skill progression
 */
export const StageIcon: React.FC<StageIconProps> = ({ stage, className = "size-5" }) => {
    const baseClass = className;

    switch (stage) {
        case "Foundation":
            return (
                <svg className={baseClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="currentColor"
                        fillOpacity="0.2"
                    />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );

        case "Practitioner":
            return (
                <svg className={baseClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="currentColor"
                        fillOpacity="0.2"
                    />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );

        case "Expert":
            return (
                <svg className={baseClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="currentColor"
                        fillOpacity="0.2"
                    />
                    <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );

        case "Authority":
            return (
                <svg className={baseClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="currentColor"
                        fillOpacity="0.2"
                    />
                </svg>
            );

        case "Master":
            return (
                <svg className={baseClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9V6C18 4.4087 17.3679 2.88258 16.2426 1.75736C15.1174 0.632141 13.5913 0 12 0C10.4087 0 8.88258 0.632141 7.75736 1.75736C6.63214 2.88258 6 4.4087 6 6V9Z"
                        fill="currentColor"
                        fillOpacity="0.3"
                    />
                    <path
                        d="M6 9H4.5C3.57174 9 2.6815 9.36875 2.02513 10.0251C1.36875 10.6815 1 11.5717 1 12.5V13C1 13.7956 1.31607 14.5587 1.87868 15.1213C2.44129 15.6839 3.20435 16 4 16H5M18 9H19.5C20.4283 9 21.3185 9.36875 21.9749 10.0251C22.6313 10.6815 23 11.5717 23 12.5V13C23 13.7956 22.6839 14.5587 22.1213 15.1213C21.5587 15.6839 20.7956 16 20 16H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M5 16C5 17.8565 5.7375 19.637 7.05025 20.9497C8.36301 22.2625 10.1435 23 12 23C13.8565 23 15.637 22.2625 16.9497 20.9497C18.2625 19.637 19 17.8565 19 16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            );

        default:
            return null;
    }
};

/**
 * Get stage color based on stage name
 */
export const getStageColor = (stage: SkillStage): string => {
    switch (stage) {
        case "Foundation":
            return "text-gray-600";
        case "Practitioner":
            return "text-blue-600";
        case "Expert":
            return "text-purple-600";
        case "Authority":
            return "text-amber-600";
        case "Master":
            return "text-yellow-500";
        default:
            return "text-gray-600";
    }
};

/**
 * Get stage background color based on stage name
 */
export const getStageBgColor = (stage: SkillStage): string => {
    switch (stage) {
        case "Foundation":
            return "bg-gray-100";
        case "Practitioner":
            return "bg-blue-100";
        case "Expert":
            return "bg-purple-100";
        case "Authority":
            return "bg-amber-100";
        case "Master":
            return "bg-yellow-100";
        default:
            return "bg-gray-100";
    }
};

/**
 * Get stage border color based on stage name
 */
export const getStageBorderColor = (stage: SkillStage): string => {
    switch (stage) {
        case "Foundation":
            return "border-gray-300";
        case "Practitioner":
            return "border-blue-300";
        case "Expert":
            return "border-purple-300";
        case "Authority":
            return "border-amber-300";
        case "Master":
            return "border-yellow-300";
        default:
            return "border-gray-300";
    }
};
