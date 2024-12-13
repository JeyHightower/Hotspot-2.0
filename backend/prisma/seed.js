import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    await prisma.user.createMany({
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
    let evil = await prisma.user.create({
        data: {
            email: 'landowner@evil.inc',
            username: 'city-destroyer',
            firstName: 'Jared',
            lastName: 'Wordsworth',
            hashedPassword: bcrypt.hashSync('eggs-and-bacon'),
        },
    });
    let evilSpot = await prisma.spot.create({
        data: {
            ownerId: evil.id,
            address: 'nowhere',
            city: 'Threadsdale',
            state: 'WY',
            country: 'US',
            lat: 42.9662275,
            lng: -108.0898237,
            name: 'Uncle Johns Riverside Cabin',
            description: 'Come fishing with us and ride the waves at our beachfront resort*',
            price: 400.0,
        },
    });
    await prisma.review.create({
        data: {
            spotId: evilSpot.id,
            userId: evil.id,
            review: 'come on down and bring your kids to the amazing beachfront resort that Uncle Johns Riverside Cabin was, I loved the nearby shops and ice cream parlor, along with all of the amenities you would expect from a place costing thousands per day, despite only costing $400/day!',
            stars: 5,
        },
    });
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
            description: 'Stunning oceanfront property with panoramic views and private beach access',
            price: 899.0,
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1200',
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
            description: 'Luxurious ski-in/ski-out lodge with hot tub and mountain views',
            price: 1299.0,
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200',
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
                        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200',
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
                        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200',
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
                        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200',
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
            description: 'Luxurious ski-in/ski-out lodge with panoramic mountain views',
            price: 1299.0,
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1506974210756-8e1b8985d348?auto=format&fit=crop&w=1200',
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
            description: 'Elevated forest retreat with stunning Pacific Northwest views',
            price: 399.0,
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200',
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
                        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200',
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
                        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200',
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
            description: 'Luxurious beachfront villa with infinity pool and ocean views',
            price: 1499.0,
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?auto=format&fit=crop&w=1200',
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
                        url: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200',
                        preview: true,
                    },
                ],
            },
        },
    ];
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
