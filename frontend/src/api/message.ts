import { apiClient } from './client';
import { Employee } from './employee';

export interface InternalMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail?: string;
  receiverId: number;
  receiverName: string;
  receiverEmail?: string;
  subject: string;
  body: string;
  replyToId?: number | null;
  threadId?: number | null;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface InternalMessageRequest {
  receiverIds: number[];
  subject: string;
  body: string;
  replyToId?: number | null;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const messageApi = {
  getInbox: async (): Promise<InternalMessage[]> => {
    return apiClient.get<InternalMessage[]>('/employee/messages/inbox');
  },

  getSent: async (): Promise<InternalMessage[]> => {
    return apiClient.get<InternalMessage[]>('/employee/messages/sent');
  },

  getThreadById: async (id: number): Promise<InternalMessage[]> => {
    return apiClient.get<InternalMessage[]>(`/employee/messages/thread/by-id/${id}`);
  },

  getThreadByThreadId: async (threadId: number): Promise<InternalMessage[]> => {
    return apiClient.get<InternalMessage[]>(`/employee/messages/thread/by-thread/${threadId}`);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<UnreadCountResponse>('/employee/messages/unread-count');
    return response.unreadCount;
  },

  getRecipients: async (): Promise<Employee[]> => {
    return apiClient.get<Employee[]>('/employee/messages/recipients');
  },

  getById: async (id: number): Promise<InternalMessage> => {
    return apiClient.get<InternalMessage>(`/employee/messages/${id}`);
  },

  send: async (data: InternalMessageRequest, attachment?: File): Promise<InternalMessage[]> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('data', jsonBlob, 'data.json');
    if (attachment) {
      formData.append('attachment', attachment);
    }
    return apiClient.postFormData<InternalMessage[]>('/employee/messages', formData);
  },

  markAsRead: async (id: number): Promise<InternalMessage> => {
    return apiClient.post<InternalMessage>(`/employee/messages/${id}/read`);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<void>(`/employee/messages/${id}`);
  },
};
