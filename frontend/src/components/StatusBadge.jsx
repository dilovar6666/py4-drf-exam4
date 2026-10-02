import { CheckCircle2, Clock3, PackageCheck, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Badge from "./ui/Badge";

const states = { pending: ["warning", Clock3], confirmed: ["blue", CheckCircle2], ready: ["success", PackageCheck], completed: ["default", CheckCircle2], cancelled: ["danger", XCircle] };
export default function StatusBadge({ status }) {
  const { t } = useTranslation(); const [variant, Icon] = states[status] || ["default", Clock3];
  return <Badge variant={variant}><Icon className="size-3.5" />{t(`status.${status}`, { defaultValue: status })}</Badge>;
}
