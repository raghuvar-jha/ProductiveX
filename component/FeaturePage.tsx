import type { Page } from "../types/Page";
import TasksPage from "./TasksPage";

import FocusPage from "./FocusPage";
import HabitsPage from "./HabitsPage";
import MemoriesPage from "./MemoriesPage";

export default function FeaturePage({ page, compact = false }: { page: Exclude<Page, "overview">; compact?: boolean }) {
  if (page === "tasks") return <TasksPage compact={compact} />
  if (page === "memories") return <MemoriesPage compact={compact}/>
  if (page === "timer") return <FocusPage compact={compact} />
  return <HabitsPage compact={compact} />
}
