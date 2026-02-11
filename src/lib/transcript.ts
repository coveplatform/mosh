/**
 * Parse a flat transcript string into proper OpenAI chat messages.
 * Converts "Agent: ..." lines to assistant messages and "Business: ..." lines to user messages.
 * Metadata lines like "[Call connected...]" are skipped.
 */
export function transcriptToMessages(
  transcript: string
): Array<{ role: "assistant" | "user"; content: string }> {
  const messages: Array<{ role: "assistant" | "user"; content: string }> = [];
  const lines = transcript.split("\n");

  let currentRole: "assistant" | "user" | null = null;
  let currentContent = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip metadata lines
    if (trimmed.startsWith("[")) continue;

    if (trimmed.startsWith("Agent: ")) {
      // Flush previous
      if (currentRole && currentContent.trim()) {
        messages.push({ role: currentRole, content: currentContent.trim() });
      }
      currentRole = "assistant";
      currentContent = trimmed.replace(/^Agent:\s*/, "");
    } else if (trimmed.startsWith("Business: ")) {
      // Flush previous
      if (currentRole && currentContent.trim()) {
        messages.push({ role: currentRole, content: currentContent.trim() });
      }
      currentRole = "user";
      currentContent = trimmed.replace(/^Business:\s*/, "");
    } else if (currentRole) {
      // Continuation of current speaker
      currentContent += " " + trimmed;
    }
  }

  // Flush last
  if (currentRole && currentContent.trim()) {
    messages.push({ role: currentRole, content: currentContent.trim() });
  }

  return messages;
}
