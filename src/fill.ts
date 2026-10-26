/** Replace `{{variable}}` placeholders the same way PromptGate does. */
export function fillPrompt(
  template: string,
  inputs: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(inputs)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(placeholder, value);
  }
  return result;
}
