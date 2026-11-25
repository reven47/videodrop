const rawClient = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "").trim();

function slot(name: string): string {
  return (process.env[name] ?? "").trim();
}

function httpsUrl(value: string): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export const adsConfig = {
  client: /^ca-pub-\d{10,}$/.test(rawClient) ? rawClient : "",
  slots: {
    top: slot("NEXT_PUBLIC_ADSENSE_SLOT_TOP"),
    mid: slot("NEXT_PUBLIC_ADSENSE_SLOT_MID"),
    bottom: slot("NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM"),
    reward: slot("NEXT_PUBLIC_ADSENSE_SLOT_REWARD"),
  },
  rewardVastTag: httpsUrl(slot("NEXT_PUBLIC_REWARD_VAST_TAG")),
};

export const adsEnabled = Boolean(adsConfig.client);

export function hasSlot(name: keyof typeof adsConfig.slots): boolean {
  return adsEnabled && Boolean(adsConfig.slots[name]);
}

export type RewardMode = "vast" | "adsense" | "house";

export function getRewardMode(): RewardMode {
  if (adsConfig.rewardVastTag) return "vast";
  if (hasSlot("reward")) return "adsense";
  return "house";
}
