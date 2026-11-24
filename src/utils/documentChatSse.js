export function sseEvent(eventType, data) {
  return `event: message\ndata: ${JSON.stringify({ type: eventType, ...data })}\n\n`;
}
