export const getApiBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (
    envUrl &&
    !envUrl.includes("localhost") &&
    !envUrl.includes("127.0.0.1")
  ) {
    return envUrl.replace(/\/$/, "");
  }
  const hostname = window.location.hostname || "localhost";
  return `http://${hostname}:8000`;
};

export const apiBaseUrl = getApiBaseUrl();
