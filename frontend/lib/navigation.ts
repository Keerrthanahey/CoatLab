import {
  LayoutDashboard,
  Atom,
  Gauge,
  ScanLine,
  FileText,
  Table2,
  BrainCircuit,
  SlidersHorizontal,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/",
        label: "Dashboard",
        description: "Research state overview",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Research",
    items: [
      {
        href: "/materials",
        label: "Material Explorer",
        description: "Crystal & property data",
        icon: Atom,
      },
      {
        href: "/prediction",
        label: "Property Prediction",
        description: "Process → property ML",
        icon: Gauge,
      },
      {
        href: "/microstructure",
        label: "Microstructure Analysis",
        description: "SEM / porosity imaging",
        icon: ScanLine,
      },
    ],
  },
  {
    label: "Data & Model",
    items: [
      {
        href: "/literature",
        label: "Literature Intelligence",
        description: "Indexed papers & AI chat",
        icon: FileText,
      },
      {
        href: "/dataset",
        label: "Dataset",
        description: "Extracted experimental rows",
        icon: Table2,
      },
      {
        href: "/model",
        label: "Model Performance",
        description: "Training & evaluation",
        icon: BrainCircuit,
      },
    ],
  },
  {
    label: "ML Analysis",
    items: [
      {
        href: "/ml/prediction",
        label: "ML Prediction",
        description: "ML-based coating performance",
        icon: BrainCircuit,
      },
      {
        href: "/ml/optimization",
        label: "Optimizer",
        description: "Multi-objective combination optimizer",
        icon: SlidersHorizontal,
      },
      {
        href: "/ml/morphology",
        label: "Morphology",
        description: "Image-based pore analysis",
        icon: ScanLine,
      },
      {
        href: "/ml/figure",
        label: "Figure Extract",
        description: "Extract data from figures",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        href: "/settings",
        label: "Settings",
        description: "Connections & preferences",
        icon: Settings,
      },
    ],
  },
];

export const allNavItems = navSections.flatMap((s) => s.items);

export function getNavItem(href: string): NavItem | undefined {
  return allNavItems.find((i) => i.href === href);
}
