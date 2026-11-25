const rawClient = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "").trim();

function slot(name: string): string {
  return (process.env[name] ?? "").trim();
}

export const adsConfig = {
  client: /^ca-pub-\d{10,}$/.test(rawClient) ? rawClient : "",
  slots: {
    top: slot("NEXT_PUBLIC_ADSENSE_SLOT_TOP"),
    mid: slot("NEXT_PUBLIC_ADSENSE_SLOT_MID"),
    bottom: slot("NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM"),
    reward: slot("NEXT_PUBLIC_ADSENSE_SLOT_REWARD"),
  },
};

export const adsEnabled = Boolean(adsConfig.client);

export function hasSlot(name: keyof typeof adsConfig.slots): boolean {
  return adsEnabled && Boolean(adsConfig.slots[name]);
}
