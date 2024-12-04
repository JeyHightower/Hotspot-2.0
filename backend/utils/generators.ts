const imageUrls = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be'
];

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
      imageUrls[Math.floor(Math.random() * imageUrls.length)],
      imageUrls[Math.floor(Math.random() * imageUrls.length)],
      imageUrls[Math.floor(Math.random() * imageUrls.length)]
    ]
  };
};
