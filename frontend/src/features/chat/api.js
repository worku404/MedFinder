import { apiFetch } from "../../lib/apiClient";

export const chatApi = {
  startConversation: (pharmacyId) =>
    apiFetch(`/api/pharmacies/${pharmacyId}/conversations/start/`, { method: "POST" }),
  listConversations: () => apiFetch("/api/conversations/"),
  listMessages: (conversationId) => apiFetch(`/api/conversations/${conversationId}/messages/`),
  markRead: (conversationId, lastReadMessageId) =>
    apiFetch(`/api/conversations/${conversationId}/read/`, {
      method: "POST",
      body: { last_read_message_id: lastReadMessageId },
    }),
};
