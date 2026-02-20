// src/lib/questions.ts

export type QuestionAspect = "GOD" | "RELATIONSHIP" | "OBEDIENCE";

export type DevotionQuestion = { aspect: QuestionAspect; text: string };

/** 基于种子字符串生成 0~1 的确定性伪随机数 */
function seededRandom(seedStr: string): number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash | 0;
  }
  return (Math.abs(hash) % 10000) / 10000;
}

const THEME_KEYWORDS: Record<string, string> = {
  家谱: "家谱|家譜|族谱|亚伯拉罕|大衛|大卫",
  降生: "降生|降世|怀孕|懷孕|馬利亞|马利亚|童女|以马内利",
  天国: "天国|天國|神的国",
  悔改: "悔改",
  祷告: "祷告|禱告|祈祷",
  信心: "信|信心",
  医治: "医治|醫治|治好",
  跟随: "跟随|跟隨|门徒|門徒",
  呼召: "呼召|差遣|跟从我",
  圣灵: "圣灵|聖靈",
  顺服: "顺服|順服|听从",
  爱: "爱|愛",
  恩典: "恩典",
  审判: "审判|審判",
};

const THEMED_QUESTIONS: Record<string, string[]> = {
  家谱: [
    "本章的家谱如何显明神的信实与应验？",
    "从家谱中你看见神怎样的计划？",
    "神在历史中的工作如何提醒我们今日的盼望？",
  ],
  降生: [
    "基督的降生如何显明神的爱？",
    "以马内利对你今日的生活有什么意义？",
    "马利亚和约瑟的顺服如何激励我们？",
  ],
  天国: [
    "天国的价值观如何挑战我们今日的生活？",
    "本章对天国的描述如何影响你的选择？",
    "我们是否在寻求神的国和祂的义？",
  ],
  悔改: [
    "本章呼召我们悔改的是什么？",
    "神的话如何光照我需要改变的地方？",
    "悔改对今天的我意味着什么？",
  ],
  祷告: [
    "本章教导我们怎样的祷告？",
    "我的祷告生活需要怎样的更新？",
    "主如何教导我们祷告？",
  ],
  信心: [
    "本章显明信心怎样的力量？",
    "我们是否在试炼中仍信靠神？",
    "信心如何影响我们今日的生活？",
  ],
  医治: [
    "主的医治大能如何安慰我们？",
    "我们是否将身心灵的重担交给主？",
    "本章的医治如何显明神的怜悯？",
  ],
  跟随: [
    "作门徒的代价与赏赐是什么？",
    "我们是否天天背起十字架跟随主？",
    "本章如何呼召我们跟从主？",
  ],
  呼召: [
    "主今天要我们怎样回应祂的呼召？",
    "我们是否在传扬福音的事上有份？",
    "这段经文如何挑战我们的事奉？",
  ],
  圣灵: [
    "圣灵如何帮助我们作见证？",
    "我们是否顺服圣灵的引导？",
    "被圣灵充满的生活是怎样的？",
  ],
  顺服: [
    "今天我可以具体顺服的一件事是什么？",
    "这段经文呼召我采取什么行动？",
    "我们是否在难以顺服的事上仍选择听从？",
  ],
  爱: [
    "神的爱如何激励我们去爱人？",
    "我们是否用主的爱去对待身边的人？",
    "爱需要怎样的行动？",
  ],
  恩典: [
    "我们是否常常数算神的恩典？",
    "恩典如何改变我们今日的生活？",
    "领受恩典的人应当如何回应？",
  ],
  审判: [
    "本章对审判的提醒如何影响我们？",
    "我们是否预备好迎接主？",
    "神公义的审判如何提醒我们活出圣洁？",
  ],
};

const GOD_QUESTIONS: string[] = [
  "今天这段经文显明了神怎样的性情？",
  "在这两章中，你看到神的哪些属性？",
  "经文如何揭示神的心意与计划？",
  "神在此显明祂是怎样的主？",
  "从这段经文里，你如何认识神的信实与慈爱？",
  "神在这里向我们启示了祂的什么特质？",
  "这段经文怎样描绘神的荣耀与权能？",
  "神在此显明了祂对百姓怎样的心意？",
  "你在这段经文中看见了神的哪些作为？",
  "经文如何显明神是守约的神？",
  "神在此向我们启示了祂怎样的性情？",
  "今天所读的内容如何帮助你更深认识神？",
];

const RELATIONSHIP_QUESTIONS: string[] = [
  "这段经文指出我需要悔改或调整的是什么？",
  "神在今天的话中对我的心说话了吗？有什么触动？",
  "我与神的关系在这段经文中被怎样提醒？",
  "这段经文如何光照我生命中需要改变的地方？",
  "在神面前，我今天需要认什么罪或更新什么？",
  "经文如何挑战我与神的关系？",
  "这段话语指出我生命中哪些需要悔改之处？",
  "神的话如何照亮我内心需要调整的地方？",
  "今天所读的经文，对我的生命说了什么？",
  "这段经文呼召我如何更深地回应神？",
  "在神的光中，我看到了自己怎样的需要？",
  "经文如何带领我反思与神的关系？",
];

const OBEDIENCE_QUESTIONS: string[] = [
  "今天我可以具体顺服的一件事是什么？",
  "读完这两章，今天你愿意在哪件事上顺服神？",
  "这段经文呼召我采取什么具体的行动？",
  "今天我可以怎样把所读的真理活出来？",
  "神的话今天要我作出怎样的回应？",
  "我可以用什么具体方式将这段经文应用在生活中？",
  "今天我要在什么事上顺服神的带领？",
  "读完这段经文，我可以做哪一件具体的事来活出信心？",
  "神的话语今天呼召我实践什么？",
  "我可以怎样把今天所读的真理付诸行动？",
  "这段经文对我今天的日常生活有什么具体的应用？",
  "今天我愿意在什么事上具体顺服主？",
];

const ASPECT_ORDER: QuestionAspect[] = ["GOD", "RELATIONSHIP", "OBEDIENCE"];

const BANK_MAP: Record<QuestionAspect, string[]> = {
  GOD: GOD_QUESTIONS,
  RELATIONSHIP: RELATIONSHIP_QUESTIONS,
  OBEDIENCE: OBEDIENCE_QUESTIONS,
};

function detectTheme(text: string): string | null {
  const sample = text.slice(0, 1000);
  for (const [theme, pattern] of Object.entries(THEME_KEYWORDS)) {
    const re = new RegExp(pattern, "i");
    if (re.test(sample)) return theme;
  }
  return null;
}

export function getDynamicQuestions(
  dateISO: string,
  refs: { book: string; chapter: number }[],
  passageText?: string
): DevotionQuestion[] {
  if (refs.length === 0) return [];

  const refStr = refs.map((r) => `${r.book}:${r.chapter}`).join(",");
  const seed = `${dateISO}|${refStr}`;

  const theme = passageText ? detectTheme(passageText) : null;
  const themedBank = theme && THEMED_QUESTIONS[theme] ? THEMED_QUESTIONS[theme] : null;
  const bank = themedBank ?? null;

  if (bank) {
    const used = new Set<number>();
    return ASPECT_ORDER.map((aspect) => {
      const subSeed = `${seed}|${aspect}|${theme ?? "t"}`;
      let idx = Math.floor(seededRandom(subSeed) * bank.length) % bank.length;
      if (bank.length >= 3) {
        let tries = 0;
        while (used.has(idx) && tries < bank.length) {
          idx = (idx + 1) % bank.length;
          tries++;
        }
        used.add(idx);
      }
      return { aspect, text: bank[idx] };
    });
  }

  return ASPECT_ORDER.map((aspect) => {
    const b = BANK_MAP[aspect];
    const subSeed = `${seed}|${aspect}`;
    const idx = Math.floor(seededRandom(subSeed) * b.length) % b.length;
    return { aspect, text: b[idx] };
  });
}
