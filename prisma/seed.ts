import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { hash } from "bcryptjs"
import path from "path"

const adapter = new PrismaLibSql({
  url: `file:${path.join(process.cwd(), "dev.db")}`,
})
const db = new PrismaClient({ adapter })

async function main() {
  // Clean existing data
  await db.comment.deleteMany()
  await db.like.deleteMany()
  await db.bookmark.deleteMany()
  await db.guide.deleteMany()
  await db.game.deleteMany()
  await db.user.deleteMany()

  // Create admin
  const admin = await db.user.create({
    data: {
      name: "管理员",
      email: "admin@example.com",
      password: await hash("admin123", 12),
      role: "ADMIN",
    },
  })

  // Create editor
  const editor = await db.user.create({
    data: {
      name: "编辑小王",
      email: "editor@example.com",
      password: await hash("editor123", 12),
      role: "EDITOR",
    },
  })

  // Create normal user
  const user = await db.user.create({
    data: {
      name: "玩家小明",
      email: "user@example.com",
      password: await hash("user123", 12),
      role: "USER",
    },
  })

  // Create games
  const games = await Promise.all([
    db.game.create({
      data: {
        title: "艾尔登法环",
        slug: "elden-ring",
        coverImage: "",
        description: "《艾尔登法环》是FromSoftware开发的开放世界动作RPG，由乔治·R·R·马丁参与世界观构建。玩家将探索广袤的「交界地」，挑战强大的半神Boss，成为艾尔登之王。",
        category: "动作",
      },
    }),
    db.game.create({
      data: {
        title: "塞尔达传说：王国之泪",
        slug: "zelda-totk",
        coverImage: "",
        description: "《塞尔达传说：王国之泪》是任天堂推出的开放世界冒险游戏。林克将探索海拉鲁的天空与地底，使用全新能力解开谜题、击败敌人。",
        category: "冒险",
      },
    }),
    db.game.create({
      data: {
        title: "原神",
        slug: "genshin-impact",
        coverImage: "",
        description: "《原神》是一款开放世界动作RPG，玩家将在提瓦特大陆冒险，使用元素之力战斗，探索七国的秘密。",
        category: "角色扮演",
      },
    }),
    db.game.create({
      data: {
        title: "博德之门3",
        slug: "baldurs-gate-3",
        coverImage: "",
        description: "《博德之门3》是Larian Studios开发的CRPG巨作，基于D&D第五版规则。玩家将在被遗忘的国度中展开史诗冒险。",
        category: "角色扮演",
      },
    }),
  ])

  // Create guides
  await Promise.all([
    db.guide.create({
      data: {
        title: "艾尔登法环新手开荒指南",
        slug: "elden-ring-beginner-guide",
        content: "<h1>艾尔登法环新手开荒指南</h1><p>欢迎来到交界地！本攻略将帮助新手玩家顺利度过游戏的前期阶段。</p><h2>职业选择</h2><p>对于新手玩家，推荐选择<strong>武士</strong>或<strong>囚犯</strong>职业。武士拥有优秀的初始装备（打刀+长弓），囚犯则拥有实用的魔法。</p><h2>前期路线</h2><p>出生后，建议先探索新手村区域。不要直接挑战大树守卫——他是一个后期Boss被放在了前期区域。</p><ul><li>收集黄金种子和圣杯瓶</li><li>探索宁姆格福的各个洞窟</li><li>在关卡前方练习基础战斗</li></ul>",
        excerpt: "新手玩家的开荒指南，包含职业推荐、前期路线和关键技巧。",
        status: "PUBLISHED",
        gameId: games[0].id,
        authorId: editor.id,
      },
    }),
    db.guide.create({
      data: {
        title: "艾尔登法环全Boss攻略",
        slug: "elden-ring-boss-guide",
        content: "<h1>全Boss攻略</h1><p>本攻略涵盖交界地所有主要Boss的击败策略。</p><h2>恶兆妖鬼 玛尔基特</h2><p>推荐等级：25-30。使用打击类武器可造成更高伤害。注意他的二阶段锤击攻击。</p>",
        excerpt: "交界地所有主要Boss的详细击败策略和配装推荐。",
        status: "PUBLISHED",
        gameId: games[0].id,
        authorId: editor.id,
      },
    }),
    db.guide.create({
      data: {
        title: "王国之泪全神庙位置攻略",
        slug: "totk-shrines-guide",
        content: "<h1>全神庙位置攻略</h1><p>海拉鲁大陆共有152座神庙。本攻略按区域划分，详细标注每座神庙的位置和解法。</p><h2>中央海拉鲁</h2><p>该区域共有15座神庙...</p>",
        excerpt: "海拉鲁全部152座神庙的位置分布与通关解法详解。",
        status: "PUBLISHED",
        gameId: games[1].id,
        authorId: editor.id,
      },
    }),
    db.guide.create({
      data: {
        title: "原神4.0枫丹角色培养攻略",
        slug: "genshin-fontaine-build",
        content: "<h1>枫丹角色培养攻略</h1><p>4.0版本枫丹角色全面培养指南，含林尼、琳妮特、菲米尼等。</p>",
        excerpt: "4.0版本枫丹角色的武器、圣遗物、配队推荐。",
        status: "PUBLISHED",
        gameId: games[2].id,
        authorId: editor.id,
      },
    }),
  ])

  // Create a comment
  const firstGuide = await db.guide.findFirst({ where: { slug: "elden-ring-beginner-guide" } })
  if (firstGuide) {
    await db.comment.create({
      data: {
        content: "这个攻略太有用了！帮我过了恶兆妖鬼。",
        userId: user.id,
        guideId: firstGuide.id,
      },
    })
  }

  console.log("Seed data created successfully!")
  console.log("Admin: admin@example.com / admin123")
  console.log("Editor: editor@example.com / editor123")
  console.log("User: user@example.com / user123")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
