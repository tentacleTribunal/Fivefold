function legacyCopy(text) {
  if (typeof document.execCommand !== "function") return false;

  const activeElement = document.activeElement;
  const selection = window.getSelection?.();
  const savedRanges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange())
    : [];
  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.readOnly = true;
  textarea.setAttribute("aria-hidden", "true");
  Object.assign(textarea.style, {
    position: "fixed",
    top: "-9999px",
    left: "-9999px"
  });
  document.body.append(textarea);

  try {
    textarea.focus();
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
    selection?.removeAllRanges();
    savedRanges.forEach((range) => selection?.addRange(range));
    activeElement?.focus?.();
  }
}

export async function copyText(text) {
  if (typeof navigator.clipboard?.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission and security restrictions can reject clipboard writes.
    }
  }

  return legacyCopy(text);
}
