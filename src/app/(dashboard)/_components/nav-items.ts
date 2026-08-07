import {
  ArrowDataTransferVerticalIcon,
  Calculator01Icon,
  CheckListIcon,
  DashboardSquare01Icon,
  Invoice01Icon,
  UserGroupIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export type NavItem = {
  label: string;
  href: string;
  icon: IconSvgElement;
};

export const navItems: NavItem[] = [
  { label: "Visão geral", href: "/", icon: DashboardSquare01Icon },
  { label: "Controle do mês", href: "/mes", icon: CheckListIcon },
  {
    label: "Lançamentos fixos",
    href: "/lancamentos-fixos",
    icon: Wallet01Icon,
  },
  { label: "Notas fiscais", href: "/notas-fiscais", icon: Invoice01Icon },
  {
    label: "Transações",
    href: "/transacoes",
    icon: ArrowDataTransferVerticalIcon,
  },
  { label: "Sócios", href: "/socios", icon: UserGroupIcon },
  { label: "Fator R", href: "/fator-r", icon: Calculator01Icon },
];
