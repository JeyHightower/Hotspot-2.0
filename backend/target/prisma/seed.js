import { prisma } from "../dbclient.js";
import bcrypt from "bcryptjs";
async function main() {
    await prisma.user.createMany({
        data: [
            {
                email: "demo@user.io",
                username: "Demo-lition",
                firstName: "John",
                lastName: "Doe",
                hashedPassword: bcrypt.hashSync("password1"),
            },
            {
                email: "user1@user.io",
                username: "FakeUser1",
                firstName: "Jane",
                lastName: "Doe",
                hashedPassword: bcrypt.hashSync("password2"),
            },
            {
                email: "user2@user.io",
                username: "FakeUser2",
                firstName: "among",
                lastName: "Us",
                hashedPassword: bcrypt.hashSync("foopassword"),
            },
        ],
    });
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
            description: "Come fishing with us and ride the waves at our beachfront resort*",
            price: 400.0,
        },
    });
    await prisma.review.create({
        data: {
            spotId: evilSpot.id,
            userId: evil.id,
            review: "come on down and bring your kids to the amazing beachfront resort that Uncle Johns Riverside Cabin was, I loved the nearby shops and ice cream parlor, along with all of the amenities you would expect from a place costing thousands per day, despite only costing $400/day!",
            stars: 5,
        },
    });
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
//# sourceMappingURL=seed.js.map