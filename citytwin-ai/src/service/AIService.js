const API_URL =
  `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/ai`;

export async function sendAIMessage(message) {
  const cleanMessage = String(message || "").trim();

  if (!cleanMessage) {
    throw new Error("Message cannot be empty.");
  }

  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      message: cleanMessage,
    }),
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      `AI request failed (${response.status})`;

    throw new Error(message);
  }

  if (!data || typeof data.response !== "string") {
    throw new Error(
      "Invalid response received from AI server."
    );
  }

  return data;
}