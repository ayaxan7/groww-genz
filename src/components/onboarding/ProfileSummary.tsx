import { emojiOf, experienceOptions, goalOptions, horizonOptions, knowledgeOptions, labelOf, lifeStageOptions, riskOptions } from "@/data/profileOptions";
import { formatINR } from "@/lib/format";
import type { Profile } from "@/lib/types";

export function profileRows(p: Profile) {
  return [
    { key: "Experience", value: labelOf(experienceOptions, p.experience), emoji: emojiOf(experienceOptions, p.experience) },
    { key: "Knowledge", value: labelOf(knowledgeOptions, p.knowledge), emoji: emojiOf(knowledgeOptions, p.knowledge) },
    { key: "Life stage", value: labelOf(lifeStageOptions, p.lifeStage), emoji: emojiOf(lifeStageOptions, p.lifeStage) },
    { key: "Goal", value: labelOf(goalOptions, p.goal), emoji: emojiOf(goalOptions, p.goal) },
    { key: "Amount", value: `${formatINR(p.amount)} / month`, emoji: "🪙" },
    { key: "Timeline", value: labelOf(horizonOptions, p.horizon), emoji: emojiOf(horizonOptions, p.horizon) },
    { key: "Ups & downs", value: labelOf(riskOptions, p.risk), emoji: emojiOf(riskOptions, p.risk) },
  ];
}

export function ProfileSummary({ profile }: { profile: Profile }) {
  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
      {profileRows(profile).map((r) => (
        <li key={r.key} className="flex items-center gap-3 px-4 py-3">
          <span className="text-lg" aria-hidden>
            {r.emoji}
          </span>
          <span className="text-sm text-muted">{r.key}</span>
          <span className="ml-auto text-right text-sm font-semibold">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}
