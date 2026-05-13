import { db } from "../src/lib/db"

const DEFAULT_CATEGORIES = ["动作", "角色扮演", "策略", "冒险", "射击", "模拟", "体育", "其他"]

async function main() {
  // Seed default categories
  for (const name of DEFAULT_CATEGORIES) {
    await db.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log("Default categories seeded")

  // Migrate existing games (reconstruct from old category data if available)
  // Since we dropped the column, existing games have no categories.
  // The user will need to re-assign them via admin.
  console.log("Done — assign categories to existing games via admin panel")
}

main().catch(console.error)
