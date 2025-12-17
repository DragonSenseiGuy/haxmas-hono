import { Hono } from 'hono'
import { createWish, deleteWish, fulfillWish, listWishes } from "./db/queries"

const app = new Hono()

app.get('/', (c) => {
  return c.text('Welcome to the Haxmas API - A Christmas Wishlist Service')
})

app.get('/api/debug', (c) => {
  const url = new URL(c.req.url)
  return c.json({
    fullUrl: c.req.url,
    pathname: url.pathname,
    search: url.search,
    queryEntries: Object.fromEntries(url.searchParams.entries()),
    honoQuery: c.req.queries(),
  })
})

const NAUGHTY_WORDS = ['coal', 'nothing', 'socks']
const NICE_MESSAGES = [
  'Santa is checking his list twice...',
  'The elves are hard at work!',
  'Rudolph approves of your wish!',
  'Mrs. Claus added this to the priority list!',
]

const CHRISTMAS_FACTS = [
  'The tradition of Christmas trees originated in Germany in the 16th century.',
  'Jingle Bells was originally written for Thanksgiving, not Christmas.',
  'The first artificial Christmas trees were made of dyed goose feathers.',
  'Christmas was once banned in England from 1647 to 1660.',
  'Rudolph the Red-Nosed Reindeer was created for a department store coloring book in 1939.',
  'The Twelve Days of Christmas gifts would cost over $40,000 today.',
  'Iceland has 13 Santa figures called the Yule Lads who visit children.',
  'The largest gingerbread house ever made was bigger than a tennis court.',
]

const REINDEER = ['Dasher', 'Dancer', 'Prancer', 'Vixen', 'Comet', 'Cupid', 'Donner', 'Blitzen', 'Rudolph']

app.get('/api/christmas/countdown', (c) => {
  const now = new Date()
  const christmas = new Date(now.getFullYear(), 11, 25)
  if (now > christmas) {
    christmas.setFullYear(christmas.getFullYear() + 1)
  }
  const diffMs = christmas.getTime() - now.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

  return c.json({
    message: days === 0 ? 'Merry Christmas!' : `${days} days until Christmas!`,
    countdown: { days, hours, minutes, seconds },
    christmasDate: christmas.toISOString().split('T')[0],
  })
})

app.get('/api/christmas/fact', (c) => {
  const fact = CHRISTMAS_FACTS[Math.floor(Math.random() * CHRISTMAS_FACTS.length)]
  return c.json({ fact })
})

app.get('/api/christmas/naughty-or-nice/:name', (c) => {
  const name = c.req.param('name')

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const isNice = hash % 10 > 2
  const coalChance = isNice ? 0 : Math.floor((hash % 50) + 50)

  return c.json({
    name,
    status: isNice ? 'nice' : 'naughty',
    message: isNice
      ? `${name} has been nice this year! Santa is pleased.`
      : `${name} might want to reconsider some life choices...`,
    coalProbability: isNice ? '0%' : `${coalChance}%`,
  })
})

app.get('/api/christmas/reindeer', (c) => {
  const shuffled = [...REINDEER].sort(() => Math.random() - 0.5)
  return c.json({
    sleighOrder: shuffled,
    leader: shuffled[0],
    message: `Tonight's sleigh formation is led by ${shuffled[0]}!`,
  })
})

app.post('/api/christmas/letter-to-santa', async (c) => {
  const body = await c.req.json().catch(() => null)
  const name = (body?.name ?? '').toString().trim()
  const wish = (body?.wish ?? '').toString().trim()
  const hasBeenGood = body?.hasBeenGood ?? false

  if (!name) return c.json({ error: 'name is required' }, 400)
  if (!wish) return c.json({ error: 'wish is required' }, 400)

  const isNaughtyWish = NAUGHTY_WORDS.some(w => wish.toLowerCase().includes(w))
  const niceMessage = NICE_MESSAGES[Math.floor(Math.random() * NICE_MESSAGES.length)]

  let wishId: number | null = null
  try {
    const result = createWish(`[Letter from ${name}]: ${wish}`)
    wishId = result.id
  } catch {
    // Database not available, continue without saving
  }

  return c.json({
    received: true,
    wishId,
    from: name,
    wish,
    santaResponse: isNaughtyWish
      ? 'Ho ho ho... interesting choice. We will see about that.'
      : hasBeenGood
        ? niceMessage
        : 'Santa appreciates your honesty. Keep trying to be good!',
    timestamp: new Date().toISOString(),
  }, 201)
})

app.get('/api/christmas/tree', (c) => {
  return c.json({
    tree: generateTree(5),
    height: 5,
    decorations: { stars: 5, ornaments: 4 },
    note: 'Use /api/christmas/tree/:height for custom height (3-15)',
  })
})

app.get('/api/christmas/tree/:height', (c) => {
  const height = Math.min(Math.max(Number(c.req.param('height')) || 5, 3), 15)
  return c.json({
    tree: generateTree(height),
    height,
    decorations: { stars: height, ornaments: height - 1 },
  })
})

function generateTree(height: number): string {
  const lines: string[] = []
  lines.push(' '.repeat(height) + '*')
  for (let i = 1; i <= height; i++) {
    const spaces = ' '.repeat(height - i)
    const branches = '/'.padEnd(i, i % 2 === 0 ? 'o' : '*').padEnd(i * 2 - 1, i % 2 === 0 ? '*' : 'o') + '\\'
    lines.push(spaces + branches)
  }
  lines.push(' '.repeat(height - 1) + '|||')
  lines.push(' '.repeat(height - 1) + '|||')
  return lines.join('\n')
}

app.get('/api/christmas/gift-suggestion', (c) => {
  return c.json({
    recipient: 'someone special',
    budgetTier: 'medium',
    suggestion: 'Board game',
    message: 'For someone special, we suggest: Board game',
    allOptionsInTier: ['Board game', 'Cozy blanket', 'Headphones', 'Art supplies', 'Plant'],
    note: 'Use /api/christmas/gift-suggestion/:budget or /api/christmas/gift-suggestion/:budget/:recipient for custom options',
  })
})

app.get('/api/christmas/gift-suggestion/:budget', (c) => {
  return getGiftSuggestion(c.req.param('budget'), 'someone special')
})

app.get('/api/christmas/gift-suggestion/:budget/:recipient', (c) => {
  return getGiftSuggestion(c.req.param('budget'), c.req.param('recipient'))
})

function getGiftSuggestion(budget: string, recipient: string) {
  const gifts: Record<string, string[]> = {
    low: ['Handwritten card', 'Homemade cookies', 'Photo album', 'Knitted scarf', 'Book'],
    medium: ['Board game', 'Cozy blanket', 'Headphones', 'Art supplies', 'Plant'],
    high: ['Smart watch', 'Weekend getaway', 'Designer item', 'Cooking class', 'Concert tickets'],
  }

  let tier: 'low' | 'medium' | 'high' = 'medium'
  const budgetNum = Number(budget)
  if (budgetNum && budgetNum < 25) tier = 'low'
  else if (budgetNum && budgetNum > 100) tier = 'high'

  const suggestions = gifts[tier]
  const picked = suggestions[Math.floor(Math.random() * suggestions.length)]

  return Response.json({
    recipient,
    budgetTier: tier,
    suggestion: picked,
    message: `For ${recipient}, we suggest: ${picked}`,
    allOptionsInTier: suggestions,
  })
}

app.get("/api/wishes", (c) => {
  try {
    return c.json(listWishes())
  } catch {
    return c.json({ error: "Database not available" }, 503)
  }
})

app.post("/api/wishes", async (c) => {
  const body = await c.req.json().catch(() => null)
  const item = (body?.item ?? "").toString().trim()
  if (!item) return c.json({ error: "item is required" }, 400)

  try {
    return c.json(createWish(item), 201)
  } catch {
    return c.json({ error: "Database not available" }, 503)
  }
})

app.patch("/api/wishes/:id/fulfill", (c) => {
  const id = Number(c.req.param("id"))
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  try {
    const res = fulfillWish(id)
    if (res.changes === 0) return c.json({ error: "not found" }, 404)
    return c.json({ ok: true })
  } catch {
    return c.json({ error: "Database not available" }, 503)
  }
})

app.delete("/api/wishes/:id", (c) => {
  const id = Number(c.req.param("id"))
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  try {
    const res = deleteWish(id)
    if (res.changes === 0) return c.json({ error: "not found" }, 404)
    return c.json({ ok: true })
  } catch {
    return c.json({ error: "Database not available" }, 503)
  }
})

const port = Number(process.env.PORT) || 3000

export default {
  port,
  fetch: app.fetch,
}

