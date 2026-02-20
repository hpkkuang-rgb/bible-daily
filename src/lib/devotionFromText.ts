// src/lib/devotionFromText.ts

/**
 * 根据经文正文动态生成摘要与灵修思考
 * 优先使用内容包（src/content/devotions/*.json），若命中则直接返回
 * 未命中才走关键词兜底逻辑
 * 摘要：1-2 句概括“本章讲了什么”
 * 反思：贴经文、有具体应用，用"不要…/而要…"结构
 */

import { getDevotionOverride } from "./contentPack";

const SUMMARY_TEMPLATES: Record<string, string[]> = {
  家谱: [
    "本章记载耶稣基督的家谱，从亚伯拉罕到大卫，再到被掳与基督，显明神在历史中成就救赎计划。",
    "本章以家谱开篇，追溯耶稣的族系，印证祂是应许的弥赛亚、大卫的子孙。",
  ],
  降生: [
    "本章记述耶稣基督的降生，马利亚从圣灵怀孕，约瑟顺服主的指示，应验先知预言。",
    "本章聚焦基督道成肉身，童女怀孕生子，以马内利——神与我们同在。",
  ],
  天国: [
    "本章论及天国的真理，神的国已临到，呼召人悔改并进入。",
    "本章揭示天国的法则与价值观，与世上的国截然不同。",
  ],
  悔改: [
    "本章呼召人悔改，转向神，预备迎接神的国。",
    "本章强调悔改的重要性，是进入神国的第一步。",
  ],
  祷告: [
    "本章教导祷告的功课，主示范如何向父祈求。",
    "本章论及祷告的权柄与应许，鼓励我们常常祷告。",
  ],
  信心: [
    "本章显明信心的力量，信的人必得着。",
    "本章强调信心的重要性，没有信心不能讨神喜悦。",
  ],
  医治: [
    "本章记载主的医治大能，怜悯病人，施行神迹。",
    "本章显明耶稣是医治的主，祂乐意医治一切软弱的。",
  ],
  跟随: [
    "本章呼召人跟随主，背起十字架，作门徒。",
    "本章论及作门徒的代价与赏赐，跟从主不回头。",
  ],
  呼召: [
    "本章记载主对门徒的呼召，差遣他们传道、医病、赶鬼。",
    "本章显明主如何呼召并装备工人，进入禾场。",
  ],
  圣灵: [
    "本章论及圣灵的降临与工作，门徒被圣灵充满。",
    "本章显明圣灵的大能，使门徒得着能力作见证。",
  ],
  顺服: [
    "本章强调顺服神的重要性，听从主的话。",
    "本章以顺服为主题，显明听命胜于献祭。",
  ],
  爱: [
    "本章论及神的爱与彼此相爱，爱是最大的诫命。",
    "本章显明爱是基督生命的核心，我们当彼此相爱。",
  ],
  恩典: [
    "本章显明神的恩典，白白赐给不配的人。",
    "本章论及恩典的丰富，在基督里我们得着恩典。",
  ],
  审判: [
    "本章宣告神对列国或恶者的审判，显明祂是公义的主，万国都当认识祂是耶和华。",
    "本章显明神的审判必临到，叫我们省察：是否把审判交给神，而非自己论断。",
  ],
  骄傲: [
    "本章揭露骄傲带来的坠落，神阻挡骄傲的人，赐恩给谦卑的人。",
    "本章警示：自以为高、自以为神的，必被降卑；我们当存谦卑的心。",
  ],
  倚靠: [
    "本章显明人若倚靠世上势力、财富或能力，终将倒塌；真正的倚靠唯独在于神。",
    "本章提醒我们：不要把安全感押在世界的臂膀上，而要单单倚靠耶和华。",
  ],
  怜悯: [
    "本章论及神的怜悯与人的冷漠，神恨恶幸灾乐祸与冷酷，祂呼召我们心存怜悯。",
    "本章显明怜悯的重要性：不要因他人跌倒而欢喜，而要存敬畏与怜恤的心。",
  ],
  敬畏: [
    "本章强调敬畏神是智慧的开端，万国万民都当认识祂、敬畏祂。",
    "本章显明神的威严与权柄，叫我们在顺境逆境中都存敬畏的心。",
  ],
  default: [
    "本章是神的话语，显明祂的心意与作为。",
    "本章记述神在历史中的工作，带领我们认识祂。",
  ],
};

const REFLECTION_TEMPLATES: Record<
  string,
  { intro: string[]; body: string[]; close: string[] }
> = {
  信: {
    intro: ["这段经文提到信心。", "信心是这段话语的主题之一。"],
    body: [
      "我们是否在生活的试炼中仍然信靠神？",
      "求主坚固我们的信心，在看不见时仍能信祂。",
    ],
    close: ["愿我们凭信心生活，不凭眼见。", "靠主站立得稳。"],
  },
  悔改: {
    intro: ["经文呼召我们悔改。", "悔改是神向我们所怀的旨意。"],
    body: [
      "我们生命中还有哪些地方需要转向神？",
      "求主光照我们内心隐藏的罪。",
    ],
    close: ["愿我们天天在神面前省察。", "活出悔改的生命。"],
  },
  祷告: {
    intro: ["这段经文与祷告相关。", "祷告是神赐给我们的恩典。"],
    body: ["我们的祷告生活是否火热？", "求主教导我们如何祷告。"],
    close: ["愿我们不住地祷告。", "与主保持亲密。"],
  },
  顺服: {
    intro: ["顺服是这段经文的主题。", "神呼召我们听从祂的话。"],
    body: [
      "我们是否在难以顺服的事上仍选择听从？",
      "求主给我们顺服的心志。",
    ],
    close: ["愿我们以顺服回应神的爱。", "活出听从的生命。"],
  },
  爱: {
    intro: ["爱是这段经文的核心。", "神的爱在这段话中显明。"],
    body: ["我们是否用主的爱去爱人？", "求主扩张我们爱的心肠。"],
    close: ["愿我们住在神的爱中。", "以爱服事身边的人。"],
  },
  惧怕: {
    intro: ["这段经文谈到惧怕与安慰。", "神要我们不要惧怕。"],
    body: [
      "我们心中是否仍有未曾交托的惧怕？",
      "求主赐下平安，除去我们的恐惧。",
    ],
    close: ["愿我们因信而得安息。", "在祂里面无所惧怕。"],
  },
  恩典: {
    intro: ["恩典在这段经文中显明。", "神的恩典何其宝贵。"],
    body: ["我们是否常常数算神的恩典？", "求主使我们不忘记祂的恩惠。"],
    close: ["愿我们活在恩典之中。", "以感恩回应祂。"],
  },
  救赎: {
    intro: ["救赎是这段话语的主题。", "神在基督里完成了救赎。"],
    body: ["我们是否珍惜这莫大的救恩？", "求主提醒我们蒙赎的身份。"],
    close: ["愿我们为主而活。", "不辜负主所付的代价。"],
  },
  天国: {
    intro: ["经文提及天国的真理。", "神的国已经临到我们中间。"],
    body: [
      "我们是否以天国的价值观生活？",
      "求主叫我们寻求祂的国和祂的义。",
    ],
    close: ["愿我们为天国而活。", "在地上彰显神的国。"],
  },
  圣灵: {
    intro: ["圣灵在这段经文中被提及。", "圣灵是我们的保惠师。"],
    body: ["我们是否顺服圣灵的引导？", "求主充满我们，被圣灵掌管。"],
    close: ["愿我们被圣灵充满。", "靠圣灵行事。"],
  },
  跟随: {
    intro: ["经文呼召我们跟随主。", "跟随是门徒的标记。"],
    body: ["我们是否天天背起十字架跟随主？", "求主使我们跟从祂不回头。"],
    close: ["愿我们紧紧跟随主。", "一生不偏离。"],
  },
  医治: {
    intro: ["医治在这段经文中彰显。", "主是医治我们的神。"],
    body: [
      "我们是否将身心灵的重担交给主？",
      "求主医治我们一切软弱的所在。",
    ],
    close: ["愿我们得着主的医治。", "在祂里面全然安息。"],
  },
  审判: {
    intro: ["这段经文论及神的审判。", "审判是神的公义彰显。"],
    body: [
      "我们是否把论断与报复交给神？",
      "不要因别人跌倒而暗自高兴，要存怜悯与敬畏。",
    ],
    close: ["愿我们活出公义与怜悯。", "把审判交在神手中。"],
  },
  骄傲: {
    intro: ["这段经文揭露骄傲的结局。", "骄傲在败坏以先。"],
    body: [
      "我们是否在成就与恩赐中仍保持谦卑？",
      "求主光照我们自以为义、自以为够好的心。",
    ],
    close: ["愿我们常常悔改。", "把荣耀归给神。"],
  },
  倚靠: {
    intro: ["这段经文显明倚靠的真正对象。", "人以为可靠的臂膀终将折断。"],
    body: [
      "我们的安全感建立在什么之上？",
      "不要把倚靠放在强者、制度或世上的保障上。",
    ],
    close: ["愿我们单单倚靠耶和华。", "用祷告取代恐慌。"],
  },
  怜悯: {
    intro: ["这段经文呼召我们心存怜悯。", "神恨恶幸灾乐祸与冷酷。"],
    body: [
      "我们是否因他人跌倒而暗自欢喜？",
      "不要把伤害当作身份，要存敬畏与怜恤。",
    ],
    close: ["愿我们以神的心肠待人。", "把审判交给神。"],
  },
  敬畏: {
    intro: ["这段经文强调敬畏神。", "敬畏耶和华是智慧的开端。"],
    body: [
      "我们在顺境中是否仍存敬畏？",
      "不要把恩赐当作身份，要常常悔改归向神。",
    ],
    close: ["愿我们活出敬畏的生命。", "在神面前谦卑受教。"],
  },
};

const SUMMARY_KEYWORDS: Record<string, string> = {
  家谱: "家谱|家譜|族谱|亚伯拉罕.*大卫|亚伯拉罕.*大衛",
  降生: "降生|降世|怀孕|懷孕|馬利亞|马利亚|童女|以马内利|以馬內利",
  天国: "天国|天國|神的国|神的國",
  悔改: "悔改",
  祷告: "祷告|禱告|祈祷",
  信心: "信|信心",
  医治: "医治|醫治|治好|癒",
  跟随: "跟随|跟隨|门徒|門徒",
  呼召: "呼召|呼籲|差遣|跟从我",
  圣灵: "圣灵|聖靈|圣灵降临",
  顺服: "顺服|順服|听从",
  爱: "爱|愛",
  恩典: "恩典",
  审判: "审判|審判|耶和华的日子|倾覆",
  骄傲: "骄傲|驕傲|自高|自以为神",
  倚靠: "倚靠|依靠|臂膀|保障|势力",
  怜悯: "怜悯|憐憫|幸灾乐祸",
  敬畏: "敬畏|敬畏神",
};

const REFLECTION_KEYWORDS = Object.keys(REFLECTION_TEMPLATES);

const DEFAULT_REFLECTION = {
  intro: "这段经文是神对我们说的话。",
  body: [
    "不要空泛地听，而要具体回应：今天神的话光照我哪里？",
    "求主开通我们的耳朵，能听又能行。",
    "愿这段经文成为我们今日生活的指引。",
  ],
  close: "愿我们活在神话语的光中，具体顺服、具体应用。",
};

function detectTheme(
  text: string,
  themeMap: Record<string, string>
): string | null {
  for (const [theme, pattern] of Object.entries(themeMap)) {
    const re = new RegExp(pattern, "i");
    if (re.test(text)) return theme;
  }
  return null;
}

export type DevotionResult = {
  summary: string;
  reflection: string | string[];
};

function buildFallbackDevotion(
  text: string,
  seed: number
): { summary: string; reflection: string } {
  const pick = <T>(arr: T[]) => arr[Math.abs(seed) % arr.length];

  const summaryTheme = detectTheme(text, SUMMARY_KEYWORDS);
  const summaryBank =
    summaryTheme && SUMMARY_TEMPLATES[summaryTheme]
      ? SUMMARY_TEMPLATES[summaryTheme]
      : SUMMARY_TEMPLATES.default;
  const summary = pick(summaryBank);

  const matched: string[] = [];
  for (const kw of REFLECTION_KEYWORDS) {
    if (text.includes(kw)) matched.push(kw);
  }

  let reflection: string;
  if (matched.length > 0) {
    const theme = matched[0];
    const tpl = REFLECTION_TEMPLATES[theme];
    reflection = `${pick(tpl.intro)} ${pick(tpl.body)} ${pick(tpl.close)}`;
  } else {
    reflection = `${DEFAULT_REFLECTION.intro} ${pick(DEFAULT_REFLECTION.body)} ${DEFAULT_REFLECTION.close}`;
  }

  return { summary, reflection };
}

export function generateDevotionFromText(args: {
  cnBook: string;
  chapter: number;
  text: string;
  bookKey: string;
}): DevotionResult {
  const { cnBook, chapter, text, bookKey } = args;

  const override = getDevotionOverride(bookKey, chapter);
  if (override) {
    return {
      summary: override.summary,
      reflection: override.reflection,
    };
  }

  const seed = Array.from(text).reduce(
    (h, c) => (h * 31 + c.charCodeAt(0)) | 0,
    0
  );
  return buildFallbackDevotion(text, seed);
}

export function generateFallbackDevotion(args: {
  cnBook: string;
  chapter: number;
  bookKey: string;
}): DevotionResult {
  const { cnBook, chapter, bookKey } = args;

  const override = getDevotionOverride(bookKey, chapter);
  if (override) {
    return {
      summary: override.summary,
      reflection: override.reflection,
    };
  }

  return {
    summary: `《${cnBook}》第 ${chapter} 章正文暂未能加载。请点击下方链接打开 BibleGateway 和合本阅读，读完后返回本页完成灵修与打卡。`,
    reflection:
      "神的话是我们脚前的灯、路上的光。愿我们借着阅读这段经文，更多认识主，并在生活中活出祂的真理与爱。",
  };
}
