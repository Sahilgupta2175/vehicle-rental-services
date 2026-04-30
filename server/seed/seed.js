const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");

const MONGO = process.env.MONGO_URI;

// Debug log to verify MONGO_URI is loaded
if (!MONGO) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}
console.log("✅ Connecting to MongoDB...");

(async () => {
  try {
    await connectDB(MONGO);
    console.log("✅ Connected to MongoDB successfully");

    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    await Transaction.deleteMany({});
    console.log("✅ Existing data cleared");

    console.log("👥 Creating users...");

    // Create default password hash for all seed users (password: "password123")
    const defaultPasswordHash = await bcrypt.hash("password123", 10);

    // Create Users
    const vendor1 = new User({
      name: "Rajesh Kumar",
      email: "rajesh@vr.com",
      passwordHash: defaultPasswordHash,
      role: "vendor",
      isVendorApproved: true,
      phone: "+919876543211",
    });

    const vendor2 = new User({
      name: "Priya Sharma",
      email: "priya@vr.com",
      passwordHash: defaultPasswordHash,
      role: "vendor",
      isVendorApproved: true,
      phone: "+919876543212",
    });

    const vendor3 = new User({
      name: "Amit Patel",
      email: "amit@vr.com",
      passwordHash: defaultPasswordHash,
      role: "vendor",
      isVendorApproved: true,
      phone: "+919876543213",
    });

    const user1 = new User({
      name: "Jane Doe",
      email: "jane@doe.com",
      passwordHash: defaultPasswordHash,
      role: "user",
      phone: "+919876543214",
    });

    const user2 = new User({
      name: "John Smith",
      email: "john@smith.com",
      passwordHash: defaultPasswordHash,
      role: "user",
      phone: "+919876543215",
    });

    const user3 = new User({
      name: "Sarah Wilson",
      email: "sarah@wilson.com",
      passwordHash: defaultPasswordHash,
      role: "user",
      phone: "+919876543216",
    });

    const admin = new User({
      name: "Admin User",
      email: "admin@vr.com",
      passwordHash: defaultPasswordHash,
      role: "admin",
      phone: "+919876543210",
    });

    await vendor1.save();
    await vendor2.save();
    await vendor3.save();
    await user1.save();
    await user2.save();
    await user3.save();
    await admin.save();

    // Create Vehicles with detailed information (added by vendors only)
    const vehicles = [
      // Vendor 1 - Rajesh Kumar (Goa based)
      {
        owner: vendor1._id,
        name: "Honda Activa 6G",
        type: "bike",
        description:
          "Perfect scooter for beach rides and city exploration. Fuel efficient and easy to ride.",
        pricePerHour: 50,
        location: {
          city: "Goa",
          address: "Calangute Beach Road",
          state: "Goa",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1558980664-1db506751c6c?w=800",
            public_id: "activa1",
          },
        ],
      },
      {
        owner: vendor1._id,
        name: "Royal Enfield Classic 350",
        type: "bike",
        description:
          "Iconic motorcycle for long rides. Perfect for exploring Goa's scenic routes.",
        pricePerHour: 150,
        location: {
          city: "Goa",
          address: "Panjim Main Road",
          state: "Goa",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800",
            public_id: "re1",
          },
        ],
      },
      {
        owner: vendor1._id,
        name: "Hyundai i20",
        type: "car",
        description:
          "Comfortable hatchback with AC and music system. Great for family trips.",
        pricePerHour: 200,
        location: {
          city: "Goa",
          address: "Mapusa Market Area",
          state: "Goa",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
            public_id: "i20_1",
          },
        ],
      },
      {
        owner: vendor1._id,
        name: "Mahindra Thar",
        type: "car",
        description:
          "Rugged SUV perfect for adventure trips and off-road experiences.",
        pricePerHour: 400,
        location: {
          city: "Goa",
          address: "Anjuna Beach Road",
          state: "Goa",
          country: "India",
        },
        available: false,
        images: [
          {
            url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
            public_id: "thar1",
          },
        ],
      },

      // Vendor 2 - Priya Sharma (Mumbai based)
      {
        owner: vendor2._id,
        name: "TVS Apache RTR 160",
        type: "bike",
        description:
          "Sporty bike with excellent mileage. Perfect for city commutes.",
        pricePerHour: 80,
        location: {
          city: "Mumbai",
          address: "Bandra West",
          state: "Maharashtra",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800",
            public_id: "apache1",
          },
        ],
      },
      {
        owner: vendor2._id,
        name: "Yamaha FZ-S",
        type: "bike",
        description:
          "Stylish and powerful bike with comfortable seating. Great for city rides.",
        pricePerHour: 100,
        location: {
          city: "Mumbai",
          address: "Andheri East",
          state: "Maharashtra",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
            public_id: "fz1",
          },
        ],
      },
      {
        owner: vendor2._id,
        name: "Maruti Swift",
        type: "car",
        description:
          "Popular hatchback with excellent fuel economy. Perfect for Mumbai traffic.",
        pricePerHour: 180,
        location: {
          city: "Mumbai",
          address: "Powai",
          state: "Maharashtra",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
            public_id: "swift1",
          },
        ],
      },
      {
        owner: vendor2._id,
        name: "Toyota Innova Crysta",
        type: "car",
        description:
          "Spacious 7-seater MPV. Ideal for family outings and group travels.",
        pricePerHour: 350,
        location: {
          city: "Mumbai",
          address: "Juhu Beach Road",
          state: "Maharashtra",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
            public_id: "innova1",
          },
        ],
      },
      {
        owner: vendor2._id,
        name: "Honda City",
        type: "car",
        description:
          "Premium sedan with comfortable interiors and smooth drive.",
        pricePerHour: 250,
        location: {
          city: "Mumbai",
          address: "Colaba Causeway",
          state: "Maharashtra",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
            public_id: "city1",
          },
        ],
      },

      // Vendor 3 - Amit Patel (Delhi/Pune based)
      {
        owner: vendor3._id,
        name: "Hero Splendor Plus",
        type: "bike",
        description:
          "Most fuel-efficient bike. Perfect for daily commutes and budget-friendly.",
        pricePerHour: 40,
        location: {
          city: "Pune",
          address: "FC Road",
          state: "Maharashtra",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=800",
            public_id: "splendor1",
          },
        ],
      },
      {
        owner: vendor3._id,
        name: "Bajaj Pulsar 150",
        type: "bike",
        description:
          "Reliable and powerful bike. Great for long distance travel.",
        pricePerHour: 90,
        location: {
          city: "Pune",
          address: "Koregaon Park",
          state: "Maharashtra",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1703344119217-0e5d40df0d28?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHVsc2FyJTIwMTUwfGVufDB8fDB8fHww",
            public_id: "pulsar1",
          },
        ],
      },
      {
        owner: vendor3._id,
        name: "KTM Duke 200",
        type: "bike",
        description: "High-performance sports bike. For the thrill-seekers!",
        pricePerHour: 200,
        location: {
          city: "Delhi",
          address: "Connaught Place",
          state: "Delhi",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800",
            public_id: "duke1",
          },
        ],
      },
      {
        owner: vendor3._id,
        name: "Tata Nexon",
        type: "car",
        description:
          "Compact SUV with modern features and safety. Perfect for city and highway.",
        pricePerHour: 220,
        location: {
          city: "Delhi",
          address: "Saket",
          state: "Delhi",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=800",
            public_id: "nexon1",
          },
        ],
      },
      {
        owner: vendor3._id,
        name: "Mercedes E-Class",
        type: "car",
        description:
          "Luxury sedan for special occasions. Premium comfort and style.",
        pricePerHour: 800,
        location: {
          city: "Delhi",
          address: "Golf Course Road, Gurgaon",
          state: "Haryana",
          country: "India",
        },
        available: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
            public_id: "merc1",
          },
        ],
      },
      {
        owner: vendor3._id,
        name: "Kia Seltos",
        type: "car",
        description:
          "Modern SUV with all the latest features. Comfortable for long journeys.",
        pricePerHour: 280,
        location: {
          city: "Pune",
          address: "Aundh",
          state: "Maharashtra",
          country: "India",
        },
        available: false,
        images: [
          {
            url: "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800",
            public_id: "seltos1",
          },
        ],
      },
    ];

    console.log("🚗 Creating vehicles...");
    const savedVehicles = await Vehicle.insertMany(vehicles);
    console.log(`✅ Created ${savedVehicles.length} vehicles`);

    // Create Sample Bookings
    console.log("📅 Creating bookings...");
    const now = new Date();
    const bookings = [
      // Completed bookings (picked up and returned)
      {
        vehicle: savedVehicles[0]._id, // Honda Activa
        user: user1._id,
        vendor: vendor1._id,
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        end: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        totalAmount: 1200,
        status: "completed",
        payment: {
          provider: "razorpay",
          providerPaymentId: "pay_mock123456",
          status: "paid",
        },
        pickup: {
          defaultWaitingWindow: 30,
          pickedUp: true,
          pickedUpAt: new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000,
          ), // Picked up 15 min after start
        },
      },
      {
        vehicle: savedVehicles[6]._id, // Maruti Swift
        user: user2._id,
        vendor: vendor2._id,
        start: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        totalAmount: 4320,
        status: "completed",
        payment: {
          provider: "razorpay",
          providerPaymentId: "pi_mock789012",
          status: "paid",
        },
        pickup: {
          defaultWaitingWindow: 30,
          pickedUp: true,
          pickedUpAt: new Date(
            now.getTime() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000,
          ), // Picked up 10 min after start
        },
      },
      // Paid booking with late pickup extension requested
      {
        vehicle: savedVehicles[2]._id, // Hyundai i20
        user: user3._id,
        vendor: vendor1._id,
        start: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        end: new Date(now.getTime() + 10 * 60 * 60 * 1000), // 10 hours from now
        totalAmount: 1600,
        status: "paid",
        payment: {
          provider: "razorpay",
          providerPaymentId: "pay_mock345678",
          status: "paid",
        },
        pickup: {
          defaultWaitingWindow: 30,
          userDeclaredLateTime: 50,
          extensionRequested: true,
          extensionRequestedAt: new Date(now.getTime() + 1 * 60 * 60 * 1000), // Requested 1 hour from now
          finalWaitingWindow: 50,
          pickedUp: false,
          autoCancel: {
            scheduled: true,
            scheduledAt: new Date(
              now.getTime() + 2 * 60 * 60 * 1000 + 55 * 60 * 1000,
            ), // 2h + 55min (50 + 5 grace)
          },
        },
      },
      // Paid booking - on time, not picked up yet
      {
        vehicle: savedVehicles[7]._id, // Toyota Innova
        user: user1._id,
        vendor: vendor2._id,
        start: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1 hour from now
        end: new Date(now.getTime() + 8 * 60 * 60 * 1000), // 8 hours from now
        totalAmount: 2450,
        status: "paid",
        payment: {
          provider: "razorpay",
          providerPaymentId: "pi_mock901234",
          status: "paid",
        },
        pickup: {
          defaultWaitingWindow: 30,
          pickedUp: false,
          autoCancel: {
            scheduled: true,
            scheduledAt: new Date(
              now.getTime() + 1 * 60 * 60 * 1000 + 35 * 60 * 1000,
            ), // 1h + 35min (30 + 5 grace)
          },
        },
      },
      // Approved booking (needs payment) - future booking
      {
        vehicle: savedVehicles[11]._id, // KTM Duke
        user: user2._id,
        vendor: vendor3._id,
        start: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        end: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        totalAmount: 4800,
        status: "approved",
        payment: {
          provider: "razorpay",
          status: "pending",
        },
      },
      // Approved booking (paid) - future booking
      {
        vehicle: savedVehicles[13]._id, // Mercedes
        user: user3._id,
        vendor: vendor3._id,
        start: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        end: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        totalAmount: 19200,
        status: "paid",
        payment: {
          provider: "razorpay",
          providerPaymentId: "pay_mock111222",
          status: "paid",
        },
        pickup: {
          defaultWaitingWindow: 30,
          pickedUp: false,
        },
      },
      // Cancelled booking (was late pickup - auto-cancelled)
      {
        vehicle: savedVehicles[14]._id, // Kia Seltos
        user: user1._id,
        vendor: vendor3._id,
        start: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        end: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        totalAmount: 6720,
        status: "cancelled",
        payment: {
          provider: "razorpay",
          providerPaymentId: "pay_mock333444",
          status: "refunded",
        },
        pickup: {
          defaultWaitingWindow: 30,
          pickedUp: false,
          autoCancel: {
            scheduled: false, // Already cancelled
          },
        },
      },
    ];

    const savedBookings = await Booking.insertMany(bookings);
    console.log(`✅ Created ${savedBookings.length} bookings`);

    // Create Sample Transactions
    console.log("💰 Creating transactions...");
    const transactions = [
      // Transaction for completed booking 1 (Honda Activa)
      {
        booking: savedBookings[0]._id,
        user: user1._id,
        amount: 1200,
        type: "charge",
        provider: "razorpay",
        providerId: "pay_mock123456",
        status: "completed",
        metadata: {
          vehicle: "Honda Activa 6G",
          bookingDuration: "24 hours",
        },
      },
      // Transaction for completed booking 2 (Maruti Swift)
      {
        booking: savedBookings[1]._id,
        user: user2._id,
        amount: 4320,
        type: "charge",
        provider: "razorpay",
        providerId: "pi_mock789012",
        status: "completed",
        metadata: {
          vehicle: "Maruti Swift",
          bookingDuration: "24 hours",
        },
      },
      // Transaction for paid booking with extension (Hyundai i20)
      {
        booking: savedBookings[2]._id,
        user: user3._id,
        amount: 1600,
        type: "charge",
        provider: "razorpay",
        providerId: "pay_mock345678",
        status: "completed",
        metadata: {
          vehicle: "Hyundai i20",
          bookingDuration: "8 hours",
          latePickupExtension: "50 minutes",
        },
      },
      // Transaction for paid booking (Toyota Innova)
      {
        booking: savedBookings[3]._id,
        user: user1._id,
        amount: 2450,
        type: "charge",
        provider: "razorpay",
        providerId: "pi_mock901234",
        status: "completed",
        metadata: {
          vehicle: "Toyota Innova Crysta",
          bookingDuration: "7 hours",
        },
      },
      // Transaction for future paid booking (Mercedes)
      {
        booking: savedBookings[5]._id,
        user: user3._id,
        amount: 19200,
        type: "charge",
        provider: "razorpay",
        providerId: "pay_mock111222",
        status: "completed",
        metadata: {
          vehicle: "Mercedes E-Class",
          bookingDuration: "24 hours",
        },
      },
      // Original payment for cancelled booking (Kia Seltos)
      {
        booking: savedBookings[6]._id,
        user: user1._id,
        amount: 6720,
        type: "charge",
        provider: "razorpay",
        providerId: "pay_mock333444",
        status: "refunded",
        metadata: {
          vehicle: "Kia Seltos",
          bookingDuration: "24 hours",
          cancellationReason: "Late pickup - auto-cancelled",
        },
      },
      // Refund transaction for cancelled booking
      {
        booking: savedBookings[6]._id,
        user: user1._id,
        amount: 6720,
        type: "refund",
        provider: "razorpay",
        providerId: "refund_mock555666",
        status: "completed",
        metadata: {
          vehicle: "Kia Seltos",
          refundReason: "Late pickup - auto-cancelled",
          originalTransactionId: "pay_mock333444",
        },
      },
    ];

    await Transaction.insertMany(transactions);
    console.log(`✅ Created ${transactions.length} transactions`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Seed complete!");
    console.log("=".repeat(60));
    console.log("\n📊 Created:");
    console.log(`   - ${7} Users (3 vendors, 3 regular users, 1 admin)`);
    console.log(
      `   - ${savedVehicles.length} Vehicles (${savedVehicles.filter((v) => v.type === "bike").length} bikes, ${savedVehicles.filter((v) => v.type === "car").length} cars)`,
    );
    console.log(
      `   - ${bookings.length} Bookings (various statuses with late pickup data)`,
    );
    console.log(
      `   - ${transactions.length} Transactions (charges and refunds)`,
    );
    console.log("\n🔐 Sample credentials:");
    console.log("   Admin: admin@vr.com");
    console.log("   Vendors: rajesh@vr.com, priya@vr.com, amit@vr.com");
    console.log("   Users: jane@doe.com, john@smith.com, sarah@wilson.com");
    console.log("   Password (for all): password123");
    console.log("\n📋 Booking Examples:");
    console.log("   - 2 Completed bookings with pickup history");
    console.log("   - 1 Paid booking with late pickup extension (50 min)");
    console.log(
      "   - 1 Paid booking waiting for pickup (default 30 min window)",
    );
    console.log("   - 2 Future bookings (1 approved, 1 paid)");
    console.log(
      "   - 1 Cancelled booking (late pickup auto-cancel with refund)",
    );
    console.log("\n💰 Transaction Examples:");
    console.log("   - 6 Payment charges");
    console.log("   - 1 Refund (auto-cancelled late pickup)");
    console.log("\n⚠️  Note: All vehicles are owned by vendors only");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed failed with error:");
    console.error(error.message);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
