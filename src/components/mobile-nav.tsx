"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavLinks } from "@/components/nav-links";
import { LogoutButton } from "@/components/logout-button";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        }
      />
      <SheetContent
        side="left"
        className="w-64 bg-sidebar p-4 text-sidebar-foreground"
      >
        <SheetHeader className="px-0">
          <SheetTitle className="text-sidebar-foreground">
            Mission Control
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex-1" onClick={() => setOpen(false)}>
          <NavLinks />
        </div>
        <div className="mt-4 border-t border-sidebar-border pt-4">
          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
