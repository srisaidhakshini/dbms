"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Rocket,
  Building2,
  Satellite,
  Users,
  Package,
  RadioTower,
  Activity,
  FlaskConical,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/missions", label: "Missions", icon: Rocket },
  { href: "/agencies", label: "Agencies", icon: Building2 },
  { href: "/launch-vehicles", label: "Launch Vehicles", icon: Rocket },
  { href: "/spacecraft", label: "Spacecraft", icon: Satellite },
  { href: "/astronauts", label: "Astronauts", icon: Users },
  { href: "/payloads", label: "Payloads", icon: Package },
  { href: "/ground-stations", label: "Ground Stations", icon: RadioTower },
  { href: "/telemetry", label: "Telemetry", icon: Activity },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
