import { apiFetch } from "../../lib/apiClient";

export const chatApi = {
  listConversations: () => apiFetch("/api/conversations/"),

  listMessages: (conversationId) =>
    apiFetch(`/api/conversations/${conversationId}/messages/`),

  startConversation: (pharmacyId) =>
    apiFetch(`/api/pharmacies/${pharmacyId}/conversations/start/`, {
      method: "POST",
    }),

  markRead: (conversationId, lastReadMessageId) =>
    apiFetch(`/api/conversations/${conversationId}/read/`, {
      method: "POST",
      body: lastReadMessageId ? { last_read_message_id: lastReadMessageId } : {},
    }),
};
