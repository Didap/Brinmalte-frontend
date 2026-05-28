export type WeekdayHours = Array<[string, string]>

export interface StoreConfig {
    name: string
    address: string
    city: string
    zip: string
    province: string
    phone: string
    /** Hours per weekday (0 = Sunday, 6 = Saturday). Empty array = closed. */
    hours: Record<number, WeekdayHours>
    /** Slot length in minutes. */
    slotMinutes: number
    /** How many days ahead the customer can book pickup. */
    daysAhead: number
}

export const STORE: StoreConfig = {
    name: 'Brinmalte',
    address: 'Via Enrico Fermi, 12a',
    city: 'Brindisi',
    zip: '72100',
    province: 'BR',
    phone: '+39 000 0000000',
    hours: {
        0: [],
        1: [['06:00', '14:00'], ['16:00', '18:30']],
        2: [['06:00', '14:00'], ['16:00', '18:30']],
        3: [['06:00', '14:00'], ['16:00', '18:30']],
        4: [['06:00', '14:00'], ['16:00', '18:30']],
        5: [['06:00', '14:00'], ['16:00', '18:30']],
        6: [['06:00', '13:00']],
    },
    slotMinutes: 30,
    daysAhead: 14,
}

const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number)
    return h * 60 + m
}

const toHHMM = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0')
    const m = (mins % 60).toString().padStart(2, '0')
    return `${h}:${m}`
}

export interface PickupSlot {
    start: string
    end: string
}

export function getSlotsForDate(date: Date, store: StoreConfig = STORE): PickupSlot[] {
    const ranges = store.hours[date.getDay()] ?? []
    const slots: PickupSlot[] = []
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const minStartToday = isToday ? now.getHours() * 60 + now.getMinutes() : -Infinity

    for (const [open, close] of ranges) {
        const openMin = toMinutes(open)
        const closeMin = toMinutes(close)
        for (let t = openMin; t + store.slotMinutes <= closeMin; t += store.slotMinutes) {
            if (t < minStartToday) continue
            slots.push({ start: toHHMM(t), end: toHHMM(t + store.slotMinutes) })
        }
    }
    return slots
}

export interface PickupDateOption {
    iso: string
    label: string
    weekday: number
}

const ITALIAN_WEEKDAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
const ITALIAN_MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']

export function getAvailableDates(store: StoreConfig = STORE): PickupDateOption[] {
    const out: PickupDateOption[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < store.daysAhead; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        if ((store.hours[d.getDay()] ?? []).length === 0) continue
        const slots = getSlotsForDate(d, store)
        if (slots.length === 0) continue
        const iso = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
        const label = `${ITALIAN_WEEKDAYS[d.getDay()]} ${d.getDate()} ${ITALIAN_MONTHS[d.getMonth()]}`
        out.push({ iso, label, weekday: d.getDay() })
    }
    return out
}

export function parseISODate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export function formatPickupSlot(slot: { date: string; startTime: string; endTime: string }): string {
    const d = parseISODate(slot.date)
    const weekday = ITALIAN_WEEKDAYS[d.getDay()]
    const month = ITALIAN_MONTHS[d.getMonth()]
    return `${weekday} ${d.getDate()} ${month}, ${slot.startTime}–${slot.endTime}`
}

export function getHoursSummary(store: StoreConfig = STORE): Array<{ label: string; hours: string }> {
    const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
    const order = [1, 2, 3, 4, 5, 6, 0]
    const formatRanges = (ranges: WeekdayHours) =>
        ranges.length === 0 ? 'Chiuso' : ranges.map(([o, c]) => `${o}–${c}`).join(' / ')

    const result: Array<{ label: string; hours: string }> = []
    let i = 0
    while (i < order.length) {
        const start = i
        const startHours = formatRanges(store.hours[order[start]] ?? [])
        let end = i
        while (end + 1 < order.length && formatRanges(store.hours[order[end + 1]] ?? []) === startHours) {
            end++
        }
        const label = start === end ? dayNames[start] : `${dayNames[start]}–${dayNames[end]}`
        result.push({ label, hours: startHours })
        i = end + 1
    }
    return result
}
