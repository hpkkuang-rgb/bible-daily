// src/lib/contentPack.ts
// 章节级别灵修内容包，按书卷加载 JSON

import EZK from "@/src/content/devotions/EZK.json";
import DAN from "@/src/content/devotions/DAN.json";
import HOS from "@/src/content/devotions/HOS.json";
import JOL from "@/src/content/devotions/JOL.json";
import AMO from "@/src/content/devotions/AMO.json";
import OBA from "@/src/content/devotions/OBA.json";
import JON from "@/src/content/devotions/JON.json";
import MIC from "@/src/content/devotions/MIC.json";
import NAM from "@/src/content/devotions/NAM.json";
import HAB from "@/src/content/devotions/HAB.json";
import ZEP from "@/src/content/devotions/ZEP.json";
import HAG from "@/src/content/devotions/HAG.json";
import ZEC from "@/src/content/devotions/ZEC.json";
import MAL from "@/src/content/devotions/MAL.json";

export type DevotionPackEntry = {
  summary: string;
  reflection: string[];
};

type DevotionPack = Record<string, DevotionPackEntry>;

/**
 * 获取指定书卷、章节的灵修内容覆盖
 * @param bookKey 书卷短码，如 EZK、MAT
 * @param chapter 章号
 * @returns 若存在则返回 { summary, reflection }，否则 null
 */
export function getDevotionOverride(
  bookKey: string,
  chapter: number
): DevotionPackEntry | null {
  let pack: DevotionPack | null = null;

  switch (bookKey) {
    case "EZK":
      pack = EZK as DevotionPack;
      break;
    case "DAN":
      pack = DAN as DevotionPack;
      break;
    case "HOS":
      pack = HOS as DevotionPack;
      break;
    case "JOL":
      pack = JOL as DevotionPack;
      break;
    case "AMO":
      pack = AMO as DevotionPack;
      break;
    case "OBA":
      pack = OBA as DevotionPack;
      break;
    case "JON":
      pack = JON as DevotionPack;
      break;
    case "MIC":
      pack = MIC as DevotionPack;
      break;
    case "NAM":
      pack = NAM as DevotionPack;
      break;
    case "HAB":
      pack = HAB as DevotionPack;
      break;
    case "ZEP":
      pack = ZEP as DevotionPack;
      break;
    case "HAG":
      pack = HAG as DevotionPack;
      break;
    case "ZEC":
      pack = ZEC as DevotionPack;
      break;
    case "MAL":
      pack = MAL as DevotionPack;
      break;
    default:
      return null;
  }

  if (!pack) return null;

  const key = String(chapter);
  const entry = pack[key];
  if (!entry || typeof entry.summary !== "string" || !Array.isArray(entry.reflection)) {
    return null;
  }

  return {
    summary: entry.summary,
    reflection: entry.reflection,
  };
}
