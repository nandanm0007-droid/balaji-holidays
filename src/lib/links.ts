export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

export function whatsappLink(number: string, message: string): string {
  const clean = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function instagramLink(handle: string): string {
  const clean = handle.replace(/^@/, "");
  return `https://instagram.com/${clean}`;
}
