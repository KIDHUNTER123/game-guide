import { pinyin } from "pinyin-pro"

export function toPinyin(text: string): string {
  return pinyin(text, { toneType: "none", type: "string", separator: " " }).toLowerCase()
}
