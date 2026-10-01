import { useContext } from "react";
import { NotificationContext } from "./notification-context";

export default function useNotifications() {
  return useContext(NotificationContext);
}
