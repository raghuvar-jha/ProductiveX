import Icon from "./Icon";
import { pageCopy } from "../data/page-copy";
import type { Page } from "../types/Page";

export default function PageHeading({ page, compact, onAction }: { page: Exclude<Page, "overview">; compact: boolean; onAction?: () => void }) {
  const copy = pageCopy[page]
  return (
    <div className={`flex ${compact ? "items-start" : "items-end"} justify-between gap-4`}>
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#aaa9a3]">{copy.eyebrow}</p>
        <h1 className={`${compact ? "mt-1 text-[27px]" : "mt-1.5 text-[30px]"} font-extrabold tracking-[-1.1px] text-[#252621]`}>
          {copy.title}
        </h1>
        <p className={`mt-1 font-medium text-[#92938d] ${compact ? "max-w-[260px] text-[11px]" : "text-[11px]"}`}>{copy.description}</p>
      </div>
     
    </div>
  )
}
