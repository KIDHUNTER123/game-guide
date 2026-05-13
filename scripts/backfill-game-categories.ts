import { db } from "../src/lib/db"

// Known mapping from the original seed data
const OLD_GAME_CATEGORIES: Record<string, string[]> = {
  "艾尔登法环": ["动作"],
  "塞尔达传说：王国之泪": ["冒险"],
  "原神": ["角色扮演"],
  "博德之门3": ["角色扮演", "策略"],
  "生化危机": ["动作"],
}

async function main() {
  for (const [title, catNames] of Object.entries(OLD_GAME_CATEGORIES)) {
    const game = await db.game.findFirst({ where: { title } })
    if (!game) {
      console.log(`Game not found: ${title}`)
      continue
    }
    for (const name of catNames) {
      const cat = await db.category.findUnique({ where: { name } })
      if (!cat) {
        console.log(`Category not found: ${name}`)
        continue
      }
      await db.gameCategory.create({
        data: { gameId: game.id, categoryId: cat.id },
      }).catch(() => {}) // ignore duplicate
    }
    console.log(`${title} -> ${catNames.join(", ")}`)
  }
  console.log("Done")
}

main().catch(console.error)
