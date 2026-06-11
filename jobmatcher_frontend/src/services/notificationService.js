import API from "./api";

export const getNotifications = (page = 0, size = 20) =>
  API.get(`/notifications?page=${page}&size=${size}`);

export const getUnreadCount = () => API.get("/notifications/unread-count");

export const markAsRead = (id) => API.put(`/notifications/${id}/read`);

export const markAllAsRead = () => API.put("/notifications/read-all");
