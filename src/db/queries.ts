import { db } from "./index"
import { wishes } from "./schema"
import { eq, desc } from "drizzle-orm"

export function listWishes() {
  return db.select().from(wishes).orderBy(desc(wishes.id)).all()
}

export function createWish(item: string) {
  const createdAt = Math.floor(Date.now() / 1000)

  const [inserted] = db.insert(wishes).values({
    item,
    fulfilled: 0,
    createdAt,
  }).returning().all()

  return { id: inserted.id }
}

export function fulfillWish(id: number) {
  const updated = db.update(wishes)
    .set({ fulfilled: 1 })
    .where(eq(wishes.id, id))
    .returning()
    .all()

  return { changes: updated.length }
}

export function deleteWish(id: number) {
  const deleted = db.delete(wishes).where(eq(wishes.id, id)).returning().all()
  return { changes: deleted.length }
}
