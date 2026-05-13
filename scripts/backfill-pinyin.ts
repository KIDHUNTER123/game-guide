import { db } from "../src/lib/db"
import { toPinyin } from "../src/lib/pinyin"

async function main() {
  const games = await db.game.findMany({ where: { pinyin: null } })
  console.log("Found", games.length, "games without pinyin")
  for (const g of games) {
    const pinyin = toPinyin(g.title)
    await db.game.update({ where: { id: g.id }, data: { pinyin } })
    console.log(g.title, "->", pinyin)
  }
  console.log("Done")
}

main().catch(console.error)
