import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  //! Create users first
  const users = await prisma.user.createMany({
    data: [
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        firstName: 'John',
        lastName: 'Doe',
        hashedPassword: bcrypt.hashSync('password1'),
      },
      {
        email: 'host@spots.io',
        username: 'SuperHost2024',
        firstName: 'Jane',
        lastName: 'Smith',
        hashedPassword: bcrypt.hashSync('password2'),
      },
      {
        email: 'travel@world.io',
        username: 'Traveler2024',
        firstName: 'Mike',
        lastName: 'Johnson',
        hashedPassword: bcrypt.hashSync('password3'),
      },
    ],
  });

  //! Get all created users
  const allUsers = await prisma.user.findMany();
  
  const spotSeeds = [
    {
      address: '123 Oceanfront Drive',
      city: 'Malibu',
      state: 'CA',
      country: 'USA',
      lat: 34.0259,
      lng: -118.7798,
      name: 'Luxury Beach Villa',
      description:
        'Stunning oceanfront property with panoramic views and private beach access',
      price: 899.0,
      images: {
        create: [
          {
            url: 'https://a0.muscache.com/im/pictures/miso/Hosting-51809333/original/0da70267-d9da-4efb-9123-2714b651c9fd.jpeg',
            preview: true,
          },
        ],
      },
    },
    {
      address: '789 Mountain View Road',
      city: 'Aspen',
      state: 'CO',
      country: 'USA',
      lat: 39.1911,
      lng: -106.8175,
      name: 'Mountain Lodge Retreat',
      description:
        'Luxurious ski-in/ski-out lodge with hot tub and mountain views',
      price: 1299.0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
            preview: true,
          },
        ],
      },
    },
    {
      address: '456 Desert Palm Way',
      city: 'Palm Springs',
      state: 'CA',
      country: 'USA',
      lat: 33.8303,
      lng: -116.5453,
      name: 'Modern Desert Oasis',
      description: 'Mid-century modern home with private pool and desert views',
      price: 599.0,
      images: {
        create: [
          {
            url: 'https://a0.muscache.com/im/pictures/e25a9b25-fa98-4160-bfd1-039287bf38b6.jpg',
            preview: true,
          },
        ],
      },
    },
    {
      address: '321 Lakefront Circle',
      city: 'Lake Tahoe',
      state: 'NV',
      country: 'USA',
      lat: 39.0968,
      lng: -120.0324,
      name: 'Lakeside Haven',
      description: 'Waterfront cabin with private dock and stunning lake views',
      price: 799.0,
      images: {
        create: [
          {
            url: 'https://a0.muscache.com/im/pictures/miso/Hosting-34113796/original/f4f7b242-db33-46fc-9080-c3d6a6fd55ec.jpeg',
            preview: true,
          },
        ],
      },
    },
    {
      address: '567 Vineyard Lane',
      city: 'Napa',
      state: 'CA',
      country: 'USA',
      lat: 38.2975,
      lng: -122.2869,
      name: 'Wine Country Estate',
      description: 'Elegant villa surrounded by vineyards with wine cellar',
      price: 1099.0,
      images: {
        create: [
          {
            url: 'https://a0.muscache.com/im/pictures/miso/Hosting-46695796/original/9bd67185-dc83-4473-a191-9486c62aec66.jpeg',
            preview: true,
          },
        ],
      },
    },
    {
      address: '789 Mountain View Road',
      city: 'Aspen',
      state: 'CO',
      country: 'USA',
      lat: 39.1911,
      lng: -106.8175,
      name: 'Alpine Luxury Lodge',
      description:
        'Luxurious ski-in/ski-out lodge with panoramic mountain views',
      price: 1299.0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
            preview: true,
          },
        ],
      },
    },
    {
      address: '890 Forest Road',
      city: 'Portland',
      state: 'OR',
      country: 'USA',
      lat: 45.5155,
      lng: -122.6789,
      name: 'Forest Canopy Haven',
      description:
        'Elevated forest retreat with stunning Pacific Northwest views',
      price: 399.0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
            preview: true,
          },
        ],
      },
    },
    {
      address: '234 Coastal Highway',
      city: 'Newport',
      state: 'RI',
      country: 'USA',
      lat: 41.4901,
      lng: -71.3128,
      name: 'Historic Coastal Manor',
      description: 'Restored 19th century mansion with ocean views',
      price: 899.0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145',
            preview: true,
          },
        ],
      },
    },
    {
      address: '678 Canyon Road',
      city: 'Sedona',
      state: 'AZ',
      country: 'USA',
      lat: 34.8697,
      lng: -111.761,
      name: 'Desert Canyon Villa',
      description: 'Modern desert home with panoramic red rock views',
      price: 699.0,
      images: {
        create: [
          {
            url: 'https://a0.muscache.com/im/pictures/miso/Hosting-51809333/original/0da70267-d9da-4efb-9123-2714b651c9fd.jpeg',
            preview: true,
          },
        ],
      },
    },
    {
      address: '901 Island Way',
      city: 'Honolulu',
      state: 'HI',
      country: 'USA',
      lat: 21.3069,
      lng: -157.8583,
      name: 'Oceanfront Paradise',
      description:
        'Luxurious beachfront villa with infinity pool and ocean views',
      price: 1499.0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1505881502353-a1986add3762',
            preview: true,
          },
        ],
      },
    },
    {
      address: '432 Ranch Road',
      city: 'Jackson',
      state: 'WY',
      country: 'USA',
      lat: 43.4799,
      lng: -110.7624,
      name: 'Grand Teton Lodge',
      description: 'Luxury ranch with mountain views and wildlife viewing',
      price: 999.0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
            preview: true,
          },
        ],
      },
    },
  ];
  //!Create spots and distribute them among users
  for (const spot of spotSeeds) {
    await prisma.spot.create({
      data: {
        ...spot,
        ownerId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
