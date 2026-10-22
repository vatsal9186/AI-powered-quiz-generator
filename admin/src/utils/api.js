export const getApiBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/$/, "");
  }

  // Check if running in a local browser environment
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "");

  if (isLocal) {
    const hostname =
      (typeof window !== "undefined" && window.location.hostname) || "localhost";
    return `http://${hostname}:8000`;
  }

  // In production (e.g. Vercel) when VITE_API_URL is not set:
  return "";
};

export const apiBaseUrl = getApiBaseUrl();
