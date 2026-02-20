// src/lib/devotion.ts
import type { ReadingRef } from "./plan";

/**
 * 根据今日阅读章节生成经文摘要与灵修思考
 * MVP：按书卷 switch 返回属灵内容模板
 */
export function getDevotionSummary(readingRefs: ReadingRef[]): {
  summary: string;
  reflection: string;
} {
  if (readingRefs.length === 0) {
    return { summary: "", reflection: "" };
  }

  const book = readingRefs[0].book;

  switch (book) {
    case "马太福音":
      return {
        summary:
          "马太福音记载耶稣基督的家谱与降生，显明神在旧约中救赎计划的应验。福音从犹太背景展开，指向万国万民的救恩。",
        reflection:
          "神是守约施慈爱的神，祂的应许永不落空。作为蒙恩的信徒，我们是否活在神为我们设定的计划之中？愿我们每日顺服圣灵的带领，在信心里跟随主，活出基督的样式。",
      };
    case "马可福音":
      return {
        summary:
          "马可福音以紧凑的叙事呈现耶稣的服事与教导，凸显祂作为受苦仆人的身份。主耶稣的行动与权能显明神的国已经临到。",
        reflection:
          "主耶稣道成肉身，为我们舍命。我们是否愿意放下自己的计划和舒适区，甘心服事他人？让我们效法基督的谦卑与顺服，在日常生活中见证主的爱。",
      };
    case "路加福音":
      return {
        summary:
          "路加福音细腻地记载耶稣的生平与教导，特别关注边缘群体与救恩的普世性。神在历史中掌权，将救恩赐给凡信祂的人。",
        reflection:
          "神的恩典临到每一个人，包括被社会轻视的人。我们是否用同样的眼光看待身边的人？求主使我们有怜悯的心肠，活出接纳与包容的生命。",
      };
    case "约翰福音":
      return {
        summary:
          "约翰福音聚焦于耶稣的神性与永恒之道，强调信心与永生的主题。道成肉身的主将父神显明出来，叫信祂的人得生命。",
        reflection:
          "基督是我们的生命与盼望。我们是否在忙碌中仍保持与主的亲密关系？愿我们扎根在神的话语中，在祂的光中得见光，日日更新心意。",
      };
    case "使徒行传":
      return {
        summary:
          "使徒行传记录圣灵降临后教会的诞生与拓展，门徒在逼迫中见证福音，神的道兴旺增长。",
        reflection:
          "我们是圣灵居住的殿，被呼召在地上作见证。在职场、家庭、社群中，我们是否敢于为信仰站立？求主加给我们勇气与智慧，活出使命的人生。",
      };
    default:
      return {
        summary: `这段经文继续带领我们认识神的心意与祂在历史中的作为。愿我们用心领受，在信心中成长。`,
        reflection:
          "神的话是我们脚前的灯、路上的光。愿我们借着每日的阅读，更多认识主，并在生活中活出祂的真理与爱。",
      };
  }
}
