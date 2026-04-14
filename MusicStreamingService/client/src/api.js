const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

export function getToken() {
  return localStorage.getItem("streamify_token");
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("streamify_token", token);
  } else {
    localStorage.removeItem("streamify_token");
  }
}

export async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
