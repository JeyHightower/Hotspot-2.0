export const generateRandomSpot = () => {
    const cities = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Miami'];
    const states = ['CA', 'NY', 'FL', 'IL', 'TX'];
    const descriptions = [
        'Cozy apartment with ocean view',
        'Modern downtown loft',
        'Rustic cabin in the woods',
        'Luxury penthouse suite',
        'Beachfront villa'
    ];
    return {
        name: `${descriptions[Math.floor(Math.random() * descriptions.length)]}`,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        address: `${Math.floor(Math.random() * 999)} Main St`,
        city: cities[Math.floor(Math.random() * cities.length)],
        state: states[Math.floor(Math.random() * states.length)],
        country: 'USA',
        lat: (Math.random() * (49 - 25) + 25).toFixed(7),
        lng: (Math.random() * (-70 - -125) + -125).toFixed(7),
        price: Math.floor(Math.random() * 900) + 100,
        images: [
            `https://picsum.photos/800/600?random=${Math.random()}`,
            `https://picsum.photos/800/600?random=${Math.random()}`,
            `https://picsum.photos/800/600?random=${Math.random()}`,
            `https://picsum.photos/800/600?random=${Math.random()}`,
            `https://picsum.photos/800/600?random=${Math.random()}`
        ]
    };
};
//# sourceMappingURL=generators.js.map