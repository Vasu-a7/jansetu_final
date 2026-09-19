import { Link } from "@tanstack/react-router";
import { Home, LayoutDashboard, PlusCircle, User, BookOpen, Phone } from "lucide-react";

const linkClass =
  "flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0 text-[9px] sm:text-xs font-semibold transition-colors shrink-0 overflow-hidden text-center";

const inactiveClass = `${linkClass} text-muted-foreground hover:bg-muted hover:text-foreground`;
const activeClass = `${linkClass} bg-primary/10 text-primary font-bold`;

export function BottomNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 inset-x-0 z-50 w-full border-t border-border bg-background/95 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-1.5 backdrop-blur-lg shadow-2xl"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around gap-1 px-1.5">
        <Link
          to="/"
          aria-label="Feed"
          className={`${linkClass} tour-feed`}
          activeOptions={{ exact: true }}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <Home className="size-4 sm:size-5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="whitespace-nowrap text-center">Feed</span>
        </Link>

        <Link
          to="/schemes"
          aria-label="Govt Schemes"
          className={`${linkClass} tour-schemes`}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <BookOpen className="size-4 sm:size-5 shrink-0 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} aria-hidden />
          <span className="whitespace-nowrap text-center">Schemes</span>
        </Link>
        
        <Link
          to="/report"
          aria-label="Report an issue"
          className={`${linkClass} tour-report`}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <PlusCircle className="size-4 sm:size-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
          <span className="whitespace-nowrap text-center font-bold">Report</span>
        </Link>

        <Link
          to="/directory"
          aria-label="24x7 Emergency"
          className={`${linkClass} tour-directory`}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <Phone className="size-4 sm:size-5 shrink-0 text-destructive" strokeWidth={1.75} aria-hidden />
          <span className="whitespace-nowrap text-center">Helplines</span>
        </Link>
        
        <Link
          to="/workspace"
          aria-label="Open workspace"
          className={`${linkClass} tour-workspace`}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <LayoutDashboard className="size-4 sm:size-5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="whitespace-nowrap text-center">Workspace</span>
        </Link>
        
        <Link
          to="/profile"
          aria-label="Profile"
          className={`${linkClass} tour-profile`}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <User className="size-4 sm:size-5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="whitespace-nowrap text-center">Profile</span>
        </Link>
      </div>
    </nav>
  );
}