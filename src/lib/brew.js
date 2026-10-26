export const chapters = [
    { id: 'hello', name: 'A brighter beginning', short: 'Hello', color: '#f5edcf', step: 'Meet your morning ritual' },
    { id: 'beans', name: 'Good things start small', short: 'The beans', color: '#e5edcb', step: '01 — Choose the beans' },
    { id: 'grind', name: 'Fresh is a feeling', short: 'The grind', color: '#f8dfb8', step: '02 — Grind fresh' },
    { id: 'craft', name: 'A little care goes far', short: 'The craft', color: '#f4d6ca', step: '03 — Distribute & tamp' },
    { id: 'machine', name: 'Made for this moment', short: 'The machine', color: '#dbe9e3', step: '04 — Lock it in' },
    { id: 'ritual', name: 'Make a little room', short: 'The ritual', color: '#e5e7f3', step: '05 — Set the cup' },
    { id: 'espresso', name: 'Liquid sunshine', short: 'The espresso', color: '#f8df9e', step: '06 — Pull the espresso' },
    { id: 'menu', name: 'Find your kind of happy', short: 'The menu', color: '#f2d8c8', step: '07 — Let the crema settle' },
    { id: 'milk', name: 'Clouds in a pitcher', short: 'The milk', color: '#dceaf1', step: '08 — Texture the milk' },
    { id: 'signature', name: 'A little love on top', short: 'The pour', color: '#e8e9c9', step: '09 — Pour & finish' },
    { id: 'pairings', name: 'Better together', short: 'The pairing', color: '#f6dcc1', step: '10 — Find its perfect partner' },
    { id: 'visit', name: 'Stay for a while', short: 'Your table', color: '#f3e8c9', step: '11 — Your coffee is ready' },
];
export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const phase = (value, from, to) => {
    const t = clamp((value - from) / (to - from));
    return t * t * (3 - 2 * t);
};
export function getBrewState(progress) {
    const p = clamp(progress, 0, 11);
    return {
        progress: p,
        chapter: Math.min(11, Math.floor(p + 0.35)),
        beans: phase(p, 0.65, 1.8),
        grounds: phase(p, 1.8, 2.8),
        tamp: Math.sin(phase(p, 2.85, 3.9) * Math.PI),
        insert: phase(p, 3.9, 4.8),
        cup: phase(p, 4.8, 5.7),
        coffee: phase(p, 5.85, 7.1),
        extraction: phase(p, 5.85, 6.05) * (1 - phase(p, 6.85, 7.1)),
        steam: phase(p, 7.6, 8.2) * (1 - phase(p, 8.6, 9)),
        pour: phase(p, 8.8, 9.7),
        milkStream: phase(p, 8.9, 9.1) * (1 - phase(p, 9.5, 9.75)),
        art: phase(p, 9.35, 9.95),
        serve: phase(p, 9.9, 11),
    };
}
export const drinks = [
    { name: 'The Daybreak Latte', description: 'Espresso, silky milk, a little morning magic.', price: '4.50', category: 'Coffee', note: 'THE HOUSE FAVORITE' },
    { name: 'Flat White', description: 'A double shot with a velvet-soft finish.', price: '4.00', category: 'Coffee', note: 'SMALL & MIGHTY' },
    { name: 'Espresso', description: 'Rich, balanced, beautifully uncomplicated.', price: '2.80', category: 'Coffee', note: 'THE ORIGINAL' },
    { name: 'Iced Oat Latte', description: 'Our espresso over ice with creamy oat milk.', price: '4.80', category: 'Cold', note: 'SUNNY DAY ENERGY' },
    { name: 'Orange Cold Brew', description: 'Slow-steeped coffee with a citrus lift.', price: '4.60', category: 'Cold', note: 'BRIGHT & BREEZY' },
    { name: 'Pistachio Matcha', description: 'Green tea, pistachio, and your choice of milk.', price: '5.20', category: 'Other', note: 'A DIFFERENT KIND OF GREEN' },
    { name: 'Butter Croissant', description: 'Golden layers. A soft center. Happy crumbs.', price: '3.20', category: 'Bakery', note: 'YOUR COFFEE’S PLUS ONE' },
    { name: 'Cinnamon Morning Bun', description: 'A soft swirl of cinnamon and brown sugar.', price: '3.80', category: 'Bakery', note: 'SOMETHING SWEET' },
];
