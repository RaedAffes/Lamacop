const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export type ServiceItem = {
  id: number;
  title: string;
  description: string;
};

export type ProjectItem = {
  id: number;
  title: string;
  description: string;
};

export type UserProfile = {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "user";
};

export type ContactItem = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(body.detail || "Request failed");
  }

  return response.json();
}

export const api = {
  listServices: () => request<ServiceItem[]>("/services"),
  listProjects: () => request<ProjectItem[]>("/projects"),
  submitContact: (payload: { name: string; email: string; message: string }) =>
    request<{ message: string }>("/contact", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload: {
    full_name: string;
    email: string;
    password: string;
    role: "admin" | "user";
    admin_key?: string;
  }) => request<UserProfile>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: (token: string) =>
    request<UserProfile>("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  listContacts: (token: string) =>
    request<ContactItem[]>("/contact", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
