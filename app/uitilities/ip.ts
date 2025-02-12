export async function getClientIP() {
  try {
    const response = await fetch("https://deno-ip-lookup.deno.dev");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to fetch IP:", error);
    return "Unknown";
  }
}
