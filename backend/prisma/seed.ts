import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const addImagesForSpot = async (spotId: number, urls: string[]) => {
  for (const [index, url] of urls.entries()) {
    await prisma.spotImage.create({
      data: {
        spotId,
        url,
        preview: index === 0,
      },
    });
  }
};

// Add type for User
type UserType = {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  hashedPassword: string;
};

async function main() {
  // Create demo user with upsert
  const demoUser = (await prisma.user.upsert({
    where: { username: "Demo-lition" },
    update: {},
    create: {
      email: "demo@user.io",
      username: "Demo-lition",
      firstName: "John",
      lastName: "Doe",
      hashedPassword: await bcrypt.hash("password", 10),
    },
  })) as UserType;

  // Create other users with upsert
  const otherUsersData = [
    {
      email: "user1@user.io",
      username: "FakeUser1",
      firstName: "Jane",
      lastName: "Doe",
      hashedPassword: bcrypt.hashSync("password1"),
    },
    {
      email: "user2@user.io",
      username: "FakeUser2",
      firstName: "among",
      lastName: "Us",
      hashedPassword: bcrypt.hashSync("password2"),
    },
  ];

  const otherUsers = [] as UserType[];

  for (const userData of otherUsersData) {
    const user = (await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: userData,
    })) as UserType;
    otherUsers.push(user);
  }

  const evil = (await prisma.user.upsert({
    where: { username: "city-destroyer" },
    update: {},
    create: {
      email: "landowner@evil.inc",
      username: "city-destroyer",
      firstName: "Jared",
      lastName: "Wordsworth",
      hashedPassword: bcrypt.hashSync("eggs-and-bacon"),
    },
  })) as UserType;

  let evilSpot = await prisma.spot.upsert({
    where: {
      address_city_state: {
        address: "nowhere",
        city: "Threadsdale",
        state: "WY",
      },
    },
    update: {
      ownerId: evil.id,
      country: "US",
      lat: 42.9662275,
      lng: -108.0898237,
      name: "Uncle Johns Riverside Cabin",
      description:
        "Come fishing with us and ride the waves at our beachfront resort*",
      price: 400.0,
    },
    create: {
      ownerId: evil.id,
      address: "nowhere",
      city: "Threadsdale",
      state: "WY",
      country: "US",
      lat: 42.9662275,
      lng: -108.0898237,
      name: "Uncle Johns Riverside Cabin",
      description:
        "Come fishing with us and ride the waves at our beachfront resort*",
      price: 400.0,
    },
  });

  // Replace the single image creation with multiple images
  const evilSpotImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6", // Preview image (original)
    "https://images.unsplash.com/photo-1587061949409-02df41d5e562", // Deceptive river view
    "https://images.unsplash.com/photo-1586375300773-8384e3e4916f", // Mysterious cabin exterior
    "https://images.unsplash.com/photo-1595877244574-e90ce41ce089", // Eerie interior
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4", // Distant water view
  ];

  // Create all images for the evil spot
  for (const [index, url] of evilSpotImages.entries()) {
    await prisma.spotImage.create({
      data: {
        spotId: evilSpot.id,
        url,
        preview: index === 0, // First image is preview
      },
    });
  }

  await prisma.review.create({
    data: {
      spotId: evilSpot.id,
      userId: evil.id,
      review:
        "come on down and bring your kids to the amazing beachfront resort that Uncle Johns Riverside Cabin was, I loved the nearby shops and ice cream parlor, along with all of the amenities you would expect from a place costing thousands per day, despite only costing $400/day!",
      stars: 5,
    },
  });

  const spots = [
    {
      ownerId: otherUsers[0].id,
      address: "123 Beach Drive",
      city: "Malibu",
      state: "CA",
      country: "USA",
      lat: 34.0259,
      lng: -118.7798,
      name: "Luxury Beach House",
      description:
        "Modern beachfront home with panoramic ocean views and private beach access. Features include infinity pool, outdoor kitchen, and floor-to-ceiling windows.",
      price: 899.99,
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        "https://images.unsplash.com/photo-1528913775512-624d24b27b96",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        "https://images.unsplash.com/photo-1567197427669-a0d3603a3586",
      ],
      review:
        "Absolutely stunning property! The views are incredible and the house is immaculate.",
      stars: 5,
    },
    {
      ownerId: otherUsers[1].id,
      address: "456 Ocean View",
      city: "Malibu",
      state: "CA",
      country: "USA",
      lat: 34.0259,
      lng: -118.7798,
      name: "Luxury Beach House",
      description:
        "Modern beachfront home with panoramic ocean views and private beach access. Features include infinity pool, outdoor kitchen, and floor-to-ceiling windows.",
      price: 899.99,
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        "https://images.unsplash.com/photo-1528913775512-624d24b27b96",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        "https://images.unsplash.com/photo-1567197427669-a0d3603a3586",
      ],
      review:
        "Absolutely stunning property! The views are incredible and the house is immaculate.",
      stars: 5,
    },
    {
      ownerId: otherUsers[0].id,
      address: "789 Mountain View",
      city: "Aspen",
      state: "CO",
      country: "USA",
      lat: 39.1911,
      lng: -106.8175,
      name: "Cozy Mountain Chalet",
      description:
        "Rustic luxury chalet with ski-in/ski-out access. Features hot tub, fireplace, and heated floors.",
      price: 599.99,
      images: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
        "https://images.unsplash.com/photo-1562182384-08115de5ee97",
        "https://images.unsplash.com/photo-1561501878-aabd62634533",
      ],
      review:
        "Perfect winter getaway! The fireplace and hot tub were amazing after skiing.",
      stars: 5,
    },
    {
      ownerId: otherUsers[1].id,
      address: "456 Lakefront Ave",
      city: "Lake Tahoe",
      state: "CA",
      country: "USA",
      lat: 39.0968,
      lng: -120.0324,
      name: "Lakeside Villa",
      description:
        "Spacious lakefront villa with private dock and stunning water views. Perfect for summer getaways.",
      price: 749.99,
      images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7",
        "https://images.unsplash.com/photo-1575517111478-7f6afd0973db",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd",
      ],
      review:
        "Beautiful location with amazing lake views. Perfect for family gatherings!",
      stars: 4,
    },
    {
      ownerId: otherUsers[0].id,
      address: "234 Desert Way",
      city: "Scottsdale",
      state: "AZ",
      country: "USA",
      lat: 33.4942,
      lng: -111.9261,
      name: "Modern Desert Oasis",
      description:
        "Contemporary desert home with infinity pool and mountain views. Features include outdoor living space and guest casita.",
      price: 449.99,
      images: [
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf",
        "https://images.unsplash.com/photo-1416331108676-a22ccb276e35",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
      ],
      review:
        "The pool and desert views were incredible. Such a peaceful retreat!",
      stars: 5,
    },
    {
      ownerId: otherUsers[1].id,
      address: "567 Vineyard Lane",
      city: "Napa",
      state: "CA",
      country: "USA",
      lat: 38.2975,
      lng: -122.2868,
      name: "Wine Country Estate",
      description:
        "Elegant estate surrounded by vineyards. Features wine cellar, chef's kitchen, and outdoor entertainment area.",
      price: 799.99,
      images: [
        "https://images.unsplash.com/photo-1505843513577-22bb7d21e455",
        "https://images.unsplash.com/photo-1543721872-c8a8d6c3a783",
        "https://images.unsplash.com/photo-1580640663644-fe95e4f66599",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
      ],
      review:
        "Perfect wine country getaway. The views and amenities were outstanding.",
      stars: 5,
    },
    {
      ownerId: otherUsers[0].id,
      address: "890 City Lights Blvd",
      city: "New York",
      state: "NY",
      country: "USA",
      lat: 40.7128,
      lng: -74.006,
      name: "Luxury Manhattan Penthouse",
      description:
        "High-rise penthouse with stunning city views. Features modern amenities and private terrace.",
      price: 999.99,
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        "https://images.unsplash.com/photo-1560448204-603b3fc33ddc",
        "https://images.unsplash.com/photo-1617098474202-0d0d7f60c56b",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
      ],
      review:
        "Incredible city views and luxurious amenities. Perfect NYC experience!",
      stars: 5,
    },
    {
      ownerId: otherUsers[1].id,
      address: "321 Forest Road",
      city: "Portland",
      state: "OR",
      country: "USA",
      lat: 45.5155,
      lng: -122.6789,
      name: "Modern Treehouse Retreat",
      description:
        "Unique treehouse-style home surrounded by forest. Features floor-to-ceiling windows and modern amenities.",
      price: 349.99,
      images: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
        "https://images.unsplash.com/photo-1464146072230-91cabc968266",
        "https://images.unsplash.com/photo-1501876725168-00c445821c9e",
      ],
      review: "Such a unique and peaceful stay. Felt like living in nature!",
      stars: 5,
    },
    {
      ownerId: otherUsers[0].id,
      address: "432 Palm Drive",
      city: "Miami Beach",
      state: "FL",
      country: "USA",
      lat: 25.7907,
      lng: -80.13,
      name: "Tropical Modern Villa",
      description:
        "Contemporary beach villa with pool and tropical garden. Walking distance to South Beach.",
      price: 699.99,
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
        "https://images.unsplash.com/photo-1615460549969-36fa19521a4f",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461",
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd",
        "https://images.unsplash.com/photo-1545083036-b175dd155a1d",
      ],
      review: "Perfect Miami getaway! The pool and location were amazing.",
      stars: 4,
    },
    {
      ownerId: otherUsers[1].id,
      address: "765 Historic Row",
      city: "Charleston",
      state: "SC",
      country: "USA",
      lat: 32.7765,
      lng: -79.9311,
      name: "Historic Downtown Mansion",
      description:
        "Restored historic mansion with modern luxuries. Features courtyard garden and period details.",
      price: 549.99,
      images: [
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb",
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb",
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb",
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb",
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb",
      ],
      review:
        "Beautiful historic home with perfect location. Loved the architecture!",
      stars: 5,
    },
    {
      ownerId: otherUsers[0].id,
      address: "543 Ranch Road",
      city: "Jackson",
      state: "WY",
      country: "USA",
      lat: 43.4799,
      lng: -110.7624,
      name: "Luxury Ranch House",
      description:
        "Spacious ranch house with Teton views. Features horse stables and outdoor activities.",
      price: 849.99,
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
      ],
      review: "Amazing mountain views and perfect for outdoor enthusiasts!",
      stars: 5,
    },
    {
      ownerId: otherUsers[1].id,
      address: "876 Coastal Highway",
      city: "Monterey",
      state: "CA",
      country: "USA",
      lat: 36.6002,
      lng: -121.8947,
      name: "Coastal Modern Retreat",
      description:
        "Contemporary home with dramatic coastal views. Features chef's kitchen and private beach access.",
      price: 679.99,
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        "https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d",
        "https://images.unsplash.com/photo-1615529182904-14819c35db37",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd",
      ],
      review: "The ocean views were breathtaking. Perfect coastal getaway!",
      stars: 4,
    },
    {
      ownerId: otherUsers[0].id,
      address: "987 Island Way",
      city: "Honolulu",
      state: "HI",
      country: "USA",
      lat: 21.3069,
      lng: -157.8583,
      name: "Luxury Island Estate",
      description:
        "Oceanfront estate with private beach access. Features infinity pool and tropical gardens.",
      price: 1299.99,
      images: [
        "https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d",
        "https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf",
        "https://images.unsplash.com/photo-1615529182904-14819c35db37",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461",
      ],
      review:
        "Paradise found! The views and amenities were beyond expectations.",
      stars: 5,
    },
    {
      ownerId: otherUsers[1].id,
      address: "456 Oceanfront Ave",
      city: "Miami Beach",
      state: "FL",
      country: "USA",
      lat: 25.7907,
      lng: -80.13,
      name: "Beachfront Paradise Villa",
      description:
        "Stunning beachfront villa with direct beach access, private pool, and panoramic ocean views. Modern luxury meets coastal charm.",
      price: 1299.99,
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
        "https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc",
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd",
        "https://images.unsplash.com/photo-1545083036-b175dd155a1d",
        "https://images.unsplash.com/photo-1615529182904-14819c35db37",
      ],
      review: "Paradise found! Waking up to ocean views was incredible.",
      stars: 5,
    },
  ];

  const newSpots = [
    {
      ownerId: otherUsers[0].id,
      address: "789 Oceanfront Drive",
      city: "La Jolla",
      state: "CA",
      country: "USA",
      lat: 32.8328,
      lng: -117.2713,
      name: "Cliffside Beach Villa",
      description:
        "Stunning cliffside villa with panoramic ocean views, private beach access, and infinity pool. Modern luxury meets California coastal living.",
      price: 1499.99,
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
      ],
      review:
        "Absolutely breathtaking! The views and amenities exceeded all expectations.",
      stars: 5,
    },
    {
      ownerId: otherUsers[1].id,
      address: "1200 Park Avenue",
      city: "New York",
      state: "NY",
      country: "USA",
      lat: 40.7829,
      lng: -73.9654,
      name: "Central Park Penthouse",
      description:
        "Luxurious penthouse overlooking Central Park. Features wraparound terrace, private elevator, and floor-to-ceiling windows.",
      price: 2999.99,
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
        "https://images.unsplash.com/photo-1600210492493-0946911123ea",
      ],
      review: "The epitome of luxury! Central Park views are unmatched.",
      stars: 5,
    },
  ];

  spots.push(...newSpots);

  for (const spotData of spots) {
    const { images, review, stars, ...spotInfo } = spotData;

    const spot = await prisma.spot.upsert({
      where: {
        address_city_state: {
          address: spotInfo.address,
          city: spotInfo.city,
          state: spotInfo.state,
        },
      },
      update: spotInfo,
      create: {
        ...spotInfo,
        ownerId: spotInfo.ownerId || demoUser.id,
      },
    });

    // Delete existing images for this spot
    await prisma.spotImage.deleteMany({
      where: { spotId: spot.id },
    });

    // Add new images
    await addImagesForSpot(spot.id, images);

    // Delete existing reviews for this spot
    await prisma.review.deleteMany({
      where: { spotId: spot.id },
    });

    // Add new review
    await prisma.review.create({
      data: {
        spotId: spot.id,
        userId: 1,
        review,
        stars,
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
