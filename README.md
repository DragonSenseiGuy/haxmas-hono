# Haxmas API

A Christmas-themed wishlist API built with Hono and Bun.

## Setup

Install dependencies:
```sh
bun install
```

Run the development server:
```sh
bun run dev
```

Open http://localhost:3000

---

## API Reference

### Wishlist Endpoints

#### GET /api/wishes
List all wishes, ordered by most recent first.

**Response:**
```json
[
  { "id": 1, "item": "New bicycle", "fulfilled": 0, "createdAt": 1702680000 }
]
```

#### POST /api/wishes
Create a new wish.

**Request body:**
```json
{ "item": "Warm sweater" }
```

**Response (201):**
```json
{ "id": 2 }
```

#### PATCH /api/wishes/:id/fulfill
Mark a wish as fulfilled.

**Response:**
```json
{ "ok": true }
```

#### DELETE /api/wishes/:id
Delete a wish.

**Response:**
```json
{ "ok": true }
```

---

### Christmas Endpoints

#### GET /api/christmas/countdown
Get the countdown to Christmas Day.

**Response:**
```json
{
  "message": "9 days until Christmas!",
  "countdown": { "days": 9, "hours": 14, "minutes": 32, "seconds": 15 },
  "christmasDate": "2024-12-25"
}
```

#### GET /api/christmas/fact
Get a random Christmas fact.

**Response:**
```json
{
  "fact": "Jingle Bells was originally written for Thanksgiving, not Christmas."
}
```

#### GET /api/christmas/naughty-or-nice/:name
Check if someone is on the naughty or nice list.

**Example:** `/api/christmas/naughty-or-nice/Alice`

**Response:**
```json
{
  "name": "Alice",
  "status": "nice",
  "message": "Alice has been nice this year! Santa is pleased.",
  "coalProbability": "0%"
}
```

#### GET /api/christmas/reindeer
Get a randomized sleigh formation for tonight.

**Response:**
```json
{
  "sleighOrder": ["Rudolph", "Dasher", "Dancer", "Prancer", "Vixen", "Comet", "Cupid", "Donner", "Blitzen"],
  "leader": "Rudolph",
  "message": "Tonight's sleigh formation is led by Rudolph!"
}
```

#### POST /api/christmas/letter-to-santa
Send a letter to Santa. The wish is automatically added to the wishlist.

**Request body:**
```json
{
  "name": "Timmy",
  "wish": "A red wagon",
  "hasBeenGood": true
}
```

**Response (201):**
```json
{
  "received": true,
  "wishId": 5,
  "from": "Timmy",
  "wish": "A red wagon",
  "santaResponse": "Rudolph approves of your wish!",
  "timestamp": "2024-12-16T10:30:00.000Z"
}
```

#### GET /api/christmas/tree
#### GET /api/christmas/tree/:height
Generate an ASCII Christmas tree.

**Examples:**
- `/api/christmas/tree` - Default height 5
- `/api/christmas/tree/10` - Height 10

**Response:**
```json
{
  "tree": "     *\n    /*\\\n   /o*o\\\n  /*o*o*\\\n ...",
  "height": 5,
  "decorations": { "stars": 5, "ornaments": 4 }
}
```

#### GET /api/christmas/gift-suggestion
#### GET /api/christmas/gift-suggestion/:budget
#### GET /api/christmas/gift-suggestion/:budget/:recipient
Get a gift suggestion based on budget.

**Examples:**
- `/api/christmas/gift-suggestion` - Default suggestion
- `/api/christmas/gift-suggestion/50` - Medium budget
- `/api/christmas/gift-suggestion/150/Mom` - High budget for Mom

Budget tiers: low (<25), medium (25-100), high (>100)

**Response:**
```json
{
  "recipient": "Mom",
  "budgetTier": "high",
  "suggestion": "Cooking class",
  "message": "For Mom, we suggest: Cooking class",
  "allOptionsInTier": ["Smart watch", "Weekend getaway", "Designer item", "Cooking class", "Concert tickets"]
}
```
