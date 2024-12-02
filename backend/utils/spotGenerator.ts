import './auth.css';
import './index.css';

export const spotGenerator = () => {

    const cities = [
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Atlanta', 'Kansas City', 'Colorado Springs', 'Omaha', 'Raleigh', 'Miami', 'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans', 'Wichita', 'Cleveland', 'Bakersfield', 'Aurora', 'Anaheim', 'Honolulu', 'Santa Ana', 'Riverside', 'Corpus Christi', 'Lexington', 'Stockton', 'Henderson', 'Saint Paul', 'St. Louis', 'Cincinnati', 'Pittsburgh', 'Greensboro', 'Anchorage', 'Plano', 'Lincoln', 'Orlando', 'Irvine', 'Newark', 'Durham', 'Chula Vista', 'Toledo', 'Fort Wayne', 'St. Petersburg', 'Laredo', 'Chandler'
    ];

    const states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    const descriptions = [
    'A charming treehouse nestled in the forest',
    'An elegant seaside retreat with stunning views',
    'A sleek penthouse overlooking the skyline',
    'A quaint log cabin surrounded by nature',
    'A delightful farmhouse with rolling hills',
    'A lavish oceanfront estate with private access',
    'A contemporary loft in the heart of downtown',
    'A rustic chalet perched in the snowy mountains',
    'A peaceful bungalow in a serene garden',
    'A stylish coastal cottage with beach access',
    'A chic urban studio with modern amenities',
    'A vintage cabin by a tranquil lake',
    'A charming Victorian home in a historic district',
    'A luxurious resort villa with all-inclusive services',
    'A cozy apartment in a vibrant neighborhood',
    'A picturesque retreat in the heart of the countryside',
    'A cozy cabin in the woods',
    'A luxurious beachfront villa',
    'A modern apartment in the city',
    'A rustic cabin in the mountains'
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
    }
}