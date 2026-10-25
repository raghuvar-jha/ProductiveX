import type { ReactNode } from "react";
import Icon from "./Icon";

export default function SectionTitle({
  children,
  action,
}: {
  children: ReactNode
  action?: string
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[17px] font-bold tracking-[-0.35px] text-[#262723]">
        {children}
      </h2>
      {action && (
        <button className="flex items-center gap-1.5 text-xs font-bold text-[#6d6f68]">
          {action} <Icon name="arrow" size={14} />
        </button>
      )}
    </div>
  )
}
