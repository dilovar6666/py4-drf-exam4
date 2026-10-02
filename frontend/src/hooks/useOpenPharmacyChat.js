import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../api/axios";
import useAuth from "../context/useAuth";

export default function useOpenPharmacyChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({});

  async function openPharmacyChat(pharmacyId) {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return null;
    }
    setState({ loading: true });
    try {
      const { data } = await api.post("chats/", { pharmacy: Number(pharmacyId) });
      setState({});
      navigate(`/messages/${data.id}`);
      return data;
    } catch (error) {
      setState({ error: apiErrorMessage(error, "Не удалось открыть чат с аптекой.") });
      return null;
    }
  }

  return { openPharmacyChat, chatState: state };
}
