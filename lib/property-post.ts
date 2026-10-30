import { DISTRICTS, type Property } from './data'

export type PostFields = Partial<Pick<Property, 'op' | 'district' | 'rooms' | 'area' | 'price'>>
export function postUrl(value: string): string | null {
  try {
    const u = new URL(value.trim())
    if (u.protocol !== 'https:' || u.username || u.password || u.port) return null
    if (!['t.me', 'www.instagram.com', 'instagram.com'].includes(u.hostname)) return null
    if (u.hostname === 't.me' ? !/^\/(?:s\/)?[a-zA-Z0-9_]+\/\d+\/?$/.test(u.pathname) : !/^\/(p|reel)\/[a-zA-Z0-9_-]+\/?$/.test(u.pathname)) return null
    return `https://${u.hostname.replace('www.', '')}${u.pathname.replace(/^\/s\//, '/').replace(/\/$/, '')}`
  } catch { return null }
}
export function parsePropertyPost(text: string): PostFields {
  const result: PostFields = {}
  const districts = DISTRICTS.filter(d => text.toLowerCase().includes(d.toLowerCase()))
  if (districts.length === 1) result.district = districts[0]
  const rent = /аренд|сда[её]тся|ijara/i.test(text)
  const sale = /прода[её]тся|продажа|sotiladi/i.test(text)
  if (rent !== sale) result.op = rent ? 'rent' : 'sale'
  const rooms = [...text.matchAll(/\b([1-9])\s*[-–]?\s*(?:комн|xonali)/gi)]
  if (rooms.length === 1) result.rooms = Number(rooms[0][1])
  const areas = [...text.matchAll(/\b(\d+(?:[.,]\d+)?)\s*(?:м²|м2|m²|m2|кв\.?\s*м)/gi)]
  if (areas.length === 1 && Number(areas[0][1].replace(',', '.')) > 0) result.area = Number(areas[0][1].replace(',', '.'))
  const prices = [...text.matchAll(/\b(\d+(?:[ \u00a0]\d{3})*(?:[.,]\d{1,2})?)\s*(?:\$|USD|у\.?\s*е\.?)/gi)]
  if (prices.length === 1 && !/(?:сум|so['‘’]?m|UZS)/i.test(text)) {
    const price = Number(prices[0][1].replace(/[ \u00a0]/g, '').replace(',', '.'))
    const before = text.slice(Math.max(0, prices[0].index! - 2), prices[0].index)
    if (price > 0 && !/[\d.,-]$/.test(before)) result.price = price
  }
  return result
}
