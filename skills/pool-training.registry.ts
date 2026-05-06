import type { RegisteredSkill } from "@/types/skill";
import BankAndKickSkill from "./bank-and-kick/Skill";
import { skillConfig as bankAndKickConfig } from "./bank-and-kick/skill.config";
import BreakShotSkill from "./break-shot/Skill";
import { skillConfig as breakShotConfig } from "./break-shot/skill.config";
import CueBallControlSkill from "./cue-ball-control/Skill";
import { skillConfig as cueBallControlConfig } from "./cue-ball-control/skill.config";
import CutShotsSkill from "./cut-shots/Skill";
import { skillConfig as cutShotsConfig } from "./cut-shots/skill.config";
import LongPottingSkill from "./long-potting/Skill";
import { skillConfig as longPottingConfig } from "./long-potting/skill.config";
import MentalComposureSkill from "./mental-composure/Skill";
import { skillConfig as mentalComposureConfig } from "./mental-composure/skill.config";
import PottingAccuracySkill from "./potting-accuracy/Skill";
import { skillConfig as pottingAccuracyConfig } from "./potting-accuracy/skill.config";
import RunOutsSkill from "./run-outs/Skill";
import { skillConfig as runOutsConfig } from "./run-outs/skill.config";
import SafetyPlaySkill from "./safety-play/Skill";
import { skillConfig as safetyPlayConfig } from "./safety-play/skill.config";

// Keys in this map intentionally match backend micro-skill `skill_id` values.
export const poolTrainingSkillMap: Record<string, Omit<RegisteredSkill, "id" | "projectId">> = {
  potting_accuracy: {
    config: pottingAccuracyConfig,
    component: PottingAccuracySkill,
  },
  long_potting: {
    config: longPottingConfig,
    component: LongPottingSkill,
  },
  cut_shots: {
    config: cutShotsConfig,
    component: CutShotsSkill,
  },
  cue_ball_control: {
    config: cueBallControlConfig,
    component: CueBallControlSkill,
  },
  break_shot: {
    config: breakShotConfig,
    component: BreakShotSkill,
  },
  safety_play: {
    config: safetyPlayConfig,
    component: SafetyPlaySkill,
  },
  run_outs: {
    config: runOutsConfig,
    component: RunOutsSkill,
  },
  bank_and_kick: {
    config: bankAndKickConfig,
    component: BankAndKickSkill,
  },
  mental_composure: {
    config: mentalComposureConfig,
    component: MentalComposureSkill,
  },
};
