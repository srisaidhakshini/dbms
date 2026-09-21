import { Rocket } from "lucide-react";
import { NavLinks } from "@/components/nav-links";
import { LogoutButton } from "@/components/logout-button";
import { MobileNav } from "@/components/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 p-4 backdrop-blur-xl md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <Rocket className="h-6 w-6 text-sidebar-primary drop-shadow-[0_0_6px_var(--sidebar-primary)]" />
          <span className="font-heading text-lg font-semibold tracking-wide bg-gradient-to-r from-sidebar-primary to-accent bg-clip-text text-transparent">
            Mission Control
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="mt-4 border-t border-sidebar-border pt-4">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="font-heading font-semibold tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mission Control
            </span>
          </div>
          <MobileNav />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
