import { CheckCircle2, Clock3, PackageCheck, XCircle } from "lucide-react";
import Badge from "./ui/Badge";

const states = {
  pending: ["Ожидает", "warning", Clock3], confirmed: ["Подтверждена", "blue", CheckCircle2],
  ready: ["Готова к выдаче", "success", PackageCheck], completed: ["Завершена", "default", CheckCircle2],
  cancelled: ["Отменена", "danger", XCircle],
};

export default function StatusBadge({ status }) {
  const [label, variant, Icon] = states[status] || [status, "default", Clock3];
  return <Badge variant={variant}><Icon className="size-3.5" />{label}</Badge>;
}
