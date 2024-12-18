import { prisma } from "../src/dbclient.js";
import bcrypt from "bcryptjs";

async function main() {
  // Create demo user with upsert
  await prisma.user.upsert({
    where: { username: "Demo-lition" },
    update: {},
    create: {
      email: "demo@user.io",
      username: "Demo-lition",
      firstName: "John",
      lastName: "Doe",
      hashedPassword: await bcrypt.hash("password", 10)
    },
  });

  // Create other users with upsert
  const otherUsers = [
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
    }
  ];

  for (const userData of otherUsers) {
    await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: userData
    });
  }

  let evil = await prisma.user.create({
    data: {
      email: "landowner@evil.inc",
      username: "city-destroyer",
      firstName: "Jared",
      lastName: "Wordsworth",
      hashedPassword: bcrypt.hashSync("eggs-and-bacon"),
    },
  });

  let evilSpot = await prisma.spot.create({
    data: {
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
      price: 400.0
    },
  });

  await prisma.spotImage.create({
    data: {
      spotId: evilSpot.id,
      url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
      preview: true
    }
  });

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
      address: "123 Ocean Drive",
      city: "Malibu",
      state: "CA",
      country: "USA",
      lat: 34.0259,
      lng: -118.7798,
      name: "Luxury Beach House",
      description: "Modern beachfront home with panoramic ocean views and private beach access. Features include infinity pool, outdoor kitchen, and floor-to-ceiling windows.",
      price: 899.99,
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      review: "Absolutely stunning property! The views are incredible and the house is immaculate.",
      stars: 5
    },
    {
      address: "789 Mountain View",
      city: "Aspen",
      state: "CO",
      country: "USA",
      lat: 39.1911,
      lng: -106.8175,
      name: "Cozy Mountain Chalet",
      description: "Rustic luxury chalet with ski-in/ski-out access. Features hot tub, fireplace, and heated floors.",
      price: 599.99,
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
      review: "Perfect winter getaway! The fireplace and hot tub were amazing after skiing.",
      stars: 5
    },
    {
      address: "456 Lakefront Ave",
      city: "Lake Tahoe",
      state: "CA",
      country: "USA",
      lat: 39.0968,
      lng: -120.0324,
      name: "Lakeside Villa",
      description: "Spacious lakefront villa with private dock and stunning water views. Perfect for summer getaways.",
      price: 749.99,
      imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
      review: "Beautiful location with amazing lake views. Perfect for family gatherings!",
      stars: 4
    },
    {
      address: "234 Desert Way",
      city: "Scottsdale",
      state: "AZ",
      country: "USA",
      lat: 33.4942,
      lng: -111.9261,
      name: "Modern Desert Oasis",
      description: "Contemporary desert home with infinity pool and mountain views. Features include outdoor living space and guest casita.",
      price: 449.99,
      imageUrl: "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
      review: "The pool and desert views were incredible. Such a peaceful retreat!",
      stars: 5
    },
    {
      address: "567 Vineyard Lane",
      city: "Napa",
      state: "CA",
      country: "USA",
      lat: 38.2975,
      lng: -122.2868,
      name: "Wine Country Estate",
      description: "Elegant estate surrounded by vineyards. Features wine cellar, chef's kitchen, and outdoor entertainment area.",
      price: 799.99,
      imageUrl: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455",
      review: "Perfect wine country getaway. The views and amenities were outstanding.",
      stars: 5
    },
    {
      address: "890 City Lights Blvd",
      city: "New York",
      state: "NY",
      country: "USA",
      lat: 40.7128,
      lng: -74.0060,
      name: "Luxury Manhattan Penthouse",
      description: "High-rise penthouse with stunning city views. Features modern amenities and private terrace.",
      price: 999.99,
      imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      review: "Incredible city views and luxurious amenities. Perfect NYC experience!",
      stars: 4
    },
    {
      address: "321 Forest Road",
      city: "Portland",
      state: "OR",
      country: "USA",
      lat: 45.5155,
      lng: -122.6789,
      name: "Modern Treehouse Retreat",
      description: "Unique treehouse-style home surrounded by forest. Features floor-to-ceiling windows and modern amenities.",
      price: 349.99,
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
      review: "Such a unique and peaceful stay. Felt like living in nature!",
      stars: 5
    },
    {
      address: "432 Palm Drive",
      city: "Miami Beach",
      state: "FL",
      country: "USA",
      lat: 25.7907,
      lng: -80.1300,
      name: "Tropical Modern Villa",
      description: "Contemporary beach villa with pool and tropical garden. Walking distance to South Beach.",
      price: 699.99,
      imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
      review: "Perfect Miami getaway! The pool and location were amazing.",
      stars: 4
    },
    {
      address: "765 Historic Row",
      city: "Charleston",
      state: "SC",
      country: "USA",
      lat: 32.7765,
      lng: -79.9311,
      name: "Historic Downtown Mansion",
      description: "Restored historic mansion with modern luxuries. Features courtyard garden and period details.",
      price: 549.99,
      imageUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb",
      review: "Beautiful historic home with perfect location. Loved the architecture!",
      stars: 5
    },
    {
      address: "543 Ranch Road",
      city: "Jackson",
      state: "WY",
      country: "USA",
      lat: 43.4799,
      lng: -110.7624,
      name: "Luxury Ranch House",
      description: "Spacious ranch house with Teton views. Features horse stables and outdoor activities.",
      price: 849.99,
      imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
      review: "Amazing mountain views and perfect for outdoor enthusiasts!",
      stars: 5
    },
    {
      address: "876 Coastal Highway",
      city: "Monterey",
      state: "CA",
      country: "USA",
      lat: 36.6002,
      lng: -121.8947,
      name: "Coastal Modern Retreat",
      description: "Contemporary home with dramatic coastal views. Features chef's kitchen and private beach access.",
      price: 679.99,
      imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
      review: "The ocean views were breathtaking. Perfect coastal getaway!",
      stars: 4
    },
    {
      address: "987 Island Way",
      city: "Honolulu",
      state: "HI",
      country: "USA",
      lat: 21.3069,
      lng: -157.8583,
      name: "Luxury Island Estate",
      description: "Oceanfront estate with private beach access. Features infinity pool and tropical gardens.",
      price: 1299.99,
      imageUrl: "https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d",
      review: "Paradise found! The views and amenities were beyond expectations.",
      stars: 5
    }
  ];

  for (const spotData of spots) {
    const { imageUrl, review, stars, ...spotInfo } = spotData;

    // Create spot
    const spot = await prisma.spot.create({
      data: {
        ...spotInfo,
        ownerId: 1, // Demo user's ID
      }
    });

    // Add image
    await prisma.spotImage.create({
      data: {
        spotId: spot.id,
        url: imageUrl,
        preview: true
      }
    });

    // Add review
    await prisma.review.create({
      data: {
        spotId: spot.id,
        userId: 1,
        review,
        stars
      }
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