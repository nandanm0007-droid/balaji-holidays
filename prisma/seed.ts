import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  // ── Admin ──
  const adminEmail = process.env.ADMIN_EMAIL || "admin@balajiholidays.in";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me-before-production";
  const adminPasswordHash = await hashPassword(adminPassword);
  const existingAdmin = await prisma.user.findFirst({
    where: { OR: [{ phone: "8880555522" }, { email: adminEmail }] },
  });
  const adminUser = existingAdmin
    ? await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: "ADMIN", name: "Balaji Holidays Admin", email: adminEmail, passwordHash: adminPasswordHash },
      })
    : await prisma.user.create({
        data: { phone: "8880555522", email: adminEmail, passwordHash: adminPasswordHash, role: "ADMIN", name: "Balaji Holidays Admin" },
      });
  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id, name: "Balaji Holidays Admin" },
  });

  const existing = await prisma.vehicle.count();
  if (existing > 0) {
    console.log("Admin credentials updated; seed data already present.");
    return;
  }

  console.log("Seeding Balaji Holidays demo data...");

  // ── Site settings (brand + official office address) ──
  const settingsJson = {
    businessName: "Balaji Holidays Travels",
    tagline: "Your Journey, Our Passion — Travels & Vehicle Rentals",
    city: "Shivamogga",
    state: "Karnataka",
    address: "Sahyadri College OPP., Shivamogga, Karnataka, India",
    phones: ["8880555522", "6360872228", "8660061227"],
    email: "balajiholidayshimoga@gmail.com",
    instagram: "@balaji_holidays__",
    whatsappNumber: "918880555522",
    whatsappMessage:
      "Hello Balaji Holidays, I would like to enquire about vehicle availability and estimated trip price.",
    heroTitle: "Travel Comfortably. Explore Freely.",
    heroSubtitle:
      "Buses, Tempo Travellers, Innova cars, train & flight booking and customized travel packages from Balaji Holidays Travels, Shivamogga.",
    aboutText:
      "Balaji Holidays Travels is a trusted travel and vehicle rental service based in Shivamogga, Karnataka. We provide buses, Tempo Travellers, Innova cars and other vehicles for local and outstation trips, along with customized travel packages for groups, families and corporate events. We also offer train booking and flight booking services for a complete travel experience. All types of vehicles available, package trips available, and 24 hours service.",
    footerText: "All types of vehicles available. Train & flight booking available. Package trips available. 24 hours service.",
    seoTitle: "Balaji Holidays Travels Shivamogga | Bus Rental, Tempo Traveller, Innova, Train & Flight Booking — Travel Agency",
    seoDescription: "Balaji Holidays Travels, Sahyadri College OPP., Shivamogga — bus rental, Tempo Traveller, Innova car rental, train booking, flight booking, package trips and customized travel packages. All types of vehicles available, 24 hours service.",
    distanceMode: "both",
    showPricePerKmGlobal: true,
    autoDoubleReturn: true,
    mapEmbedUrl: "https://www.google.com/maps?q=Sahyadri+College,Shivamogga,Karnataka,India&output=embed",
  };
  await prisma.siteSetting.upsert({
    where: { key: "site_settings" },
    update: {},
    create: { key: "site_settings", value: JSON.stringify(settingsJson) },
  });

  // ── Demo vehicles (prices are placeholder/demo — admin must set real rates) ──
  const vehicles = [
    {
      name: "50-Seater Bus",
      slug: "50-seater-bus",
      type: "BUS",
      capacity: 50,
      ac: true,
      description:
        "Luxury 50-seater coach bus ideal for large groups, weddings, corporate events and long outstation trips. Push-back seats, ample luggage space and experienced drivers.",
      features: JSON.stringify(["AC", "Push-back seats", "Luggage space", "Music system", "Charging points", "Experienced driver"]),
      images: ["/images/bus-50.png"],
      pricePerKm: 55,
      minBillingKm: 250,
      minKmPerDay: 250,
      driverAllowanceEnabled: true,
      driverAllowancePerDay: 500,
    },
    {
      name: "46-Seater Bus",
      slug: "46-seater-bus",
      type: "BUS",
      capacity: 46,
      ac: true,
      description:
        "Comfortable 46-seater bus for group tours, school trips and family functions. Reliable, clean and well-maintained.",
      features: JSON.stringify(["AC", "Comfortable seats", "Luggage space", "Music system"]),
      images: ["/images/bus-46.png"],
      pricePerKm: 50,
      minBillingKm: 250,
      minKmPerDay: 250,
      driverAllowanceEnabled: true,
      driverAllowancePerDay: 500,
    },
    {
      name: "20-Seater Bus",
      slug: "20-seater-bus",
      type: "MINI_BUS",
      capacity: 20,
      ac: true,
      description:
        "Compact 20-seater minibus perfect for small groups, family outings and local trips.",
      features: JSON.stringify(["AC", "Comfortable seats", "Compact & agile"]),
      images: ["/images/bus-20.png"],
      pricePerKm: 40,
      minBillingKm: 150,
      minKmPerDay: 200,
      driverAllowanceEnabled: true,
      driverAllowancePerDay: 400,
    },
    {
      name: "Tempo Traveller",
      slug: "tempo-traveller",
      type: "TEMPO_TRAVELLER",
      capacity: 14,
      ac: true,
      description:
        "14-seater Tempo Traveller, the most popular choice for family trips, pilgrimages and weekend getaways. Smooth ride and generous luggage space.",
      features: JSON.stringify(["AC", "14 seats", "Luggage space", "Push-back seats"]),
      images: ["/images/tempo.png"],
      pricePerKm: 30,
      minBillingKm: 150,
      minKmPerDay: 250,
      driverAllowanceEnabled: true,
      driverAllowancePerDay: 400,
    },
    {
      name: "Innova Crysta",
      slug: "innova-crysta",
      type: "INNOVA",
      capacity: 7,
      ac: true,
      description:
        "Premium 7-seater Toyota Innova Crysta for comfortable family travel, airport transfers and business trips.",
      features: JSON.stringify(["AC", "7 seats", "Leather seats", "Luggage space"]),
      images: ["/images/innova.jpg"],
      pricePerKm: 18,
      minBillingKm: 250,
      minKmPerDay: 250,
      driverAllowanceEnabled: true,
      driverAllowancePerDay: 300,
    },
  ];

  for (const v of vehicles) {
    const { images, pricePerKm, minBillingKm, minKmPerDay, driverAllowanceEnabled, driverAllowancePerDay, ...rest } = v;
    const vehicle = await prisma.vehicle.create({ data: rest });
    await prisma.vehiclePricing.create({
      data: {
        vehicleId: vehicle.id,
        pricePerKm,
        minBillingKm,
        minKmPerDay,
        driverAllowanceEnabled,
        driverAllowancePerDay,
        tollEnabled: false,
        parkingEnabled: false,
        permitEnabled: false,
      },
    });
    for (let i = 0; i < images.length; i++) {
      await prisma.vehicleImage.create({
        data: { vehicleId: vehicle.id, url: images[i], alt: `${rest.name} image ${i + 1}`, sortOrder: i },
      });
    }
  }

  // ── Drivers ──
  const drivers = [
    { name: "Ramesh Kumar", experienceYears: 12, languages: JSON.stringify(["Kannada", "Hindi", "English"]), bio: "Experienced long-distance bus driver with over 12 years on Karnataka routes.", rating: 4.8 },
    { name: "Suresh Gowda", experienceYears: 8, languages: JSON.stringify(["Kannada", "Hindi"]), bio: "Reliable Tempo Traveller driver, expert in hill station routes.", rating: 4.7 },
    { name: "Manjunath", experienceYears: 10, languages: JSON.stringify(["Kannada", "Hindi", "Tamil"]), bio: "Polite and punctual Innova driver, specialist in airport transfers and outstation trips.", rating: 4.9 },
  ];
  const bus50 = await prisma.vehicle.findUnique({ where: { slug: "50-seater-bus" } });
  const bus46 = await prisma.vehicle.findUnique({ where: { slug: "46-seater-bus" } });
  const tempo = await prisma.vehicle.findUnique({ where: { slug: "tempo-traveller" } });
  const innova = await prisma.vehicle.findUnique({ where: { slug: "innova-crysta" } });

  const driverRecords = [];
  for (const d of drivers) {
    driverRecords.push(await prisma.driver.create({ data: d }));
  }
  // Link drivers to vehicles
  if (bus50 && bus46 && tempo && innova) {
    await prisma.driverVehicle.createMany({
      data: [
        { driverId: driverRecords[0].id, vehicleId: bus50.id },
        { driverId: driverRecords[0].id, vehicleId: bus46.id },
        { driverId: driverRecords[1].id, vehicleId: tempo.id },
        { driverId: driverRecords[2].id, vehicleId: innova.id },
      ],
    });
  }

  // ── Packages (prices are demo/placeholder) ──
  const packages = [
    {
      name: "Chikmagalur Hill Station Trip",
      slug: "chikmagalur-hill-station",
      destination: "Chikmagalur",
      startingLocation: "Shivamogga",
      durationDays: 2,
      placesCovered: JSON.stringify(["Mullayanagiri", "Baba Budangiri", "Kemmangundi", "Coffee estates", "Hebbe Falls"]),
      itinerary: JSON.stringify(["Day 1: Shivamogga → Chikmagalur, visit Mullayanagiri & coffee estates", "Day 2: Baba Budangiri, Kemmangundi & Hebbe Falls, return to Shivamogga"]),
      description: "A refreshing 2-day getaway to the coffee hills of Chikmagalur with sightseeing of the highest peak in Karnataka.",
      pricingType: "VEHICLE_BASED",
      featured: true,
      images: ["/images/dest-hills.jpg"],
    },
    {
      name: "Jog Falls & Honnemaradu",
      slug: "jog-falls-honnemaradu",
      destination: "Jog Falls",
      startingLocation: "Shivamogga",
      durationDays: 1,
      placesCovered: JSON.stringify(["Jog Falls", "Honnemaradu", "Sharavathi Valley"]),
      itinerary: JSON.stringify(["Day 1: Shivamogga → Jog Falls, Honnemaradu backwaters, return same day"]),
      description: "A one-day trip to the majestic Jog Falls and the serene Honnemaradu backwaters.",
      pricingType: "CONTACT",
      featured: true,
      images: ["/images/dest-falls.jpg"],
    },
    {
      name: "Murudeshwara & Gokarna Coastal Tour",
      slug: "murudeshwara-gokarna",
      destination: "Murudeshwara & Gokarna",
      startingLocation: "Shivamogga",
      durationDays: 3,
      placesCovered: JSON.stringify(["Murudeshwara temple", "Gokarna beach", "Om beach", "Idagunji temple"]),
      itinerary: JSON.stringify(["Day 1: Shivamogga → Murudeshwara", "Day 2: Gokarna & Om beach", "Day 3: Idagunji temple, return"]),
      description: "A serene 3-day coastal pilgrimage and beach tour along the Karnataka coast.",
      pricingType: "PER_PERSON",
      perPersonPrice: 3500,
      featured: false,
      images: ["/images/dest-temple.jpg", "/images/dest-beach.jpg"],
    },
  ];
  for (const p of packages) {
    const { images, ...rest } = p;
    const pkg = await prisma.package.create({ data: rest });
    for (let i = 0; i < images.length; i++) {
      await prisma.packageImage.create({ data: { packageId: pkg.id, url: images[i], sortOrder: i } });
    }
  }

  // ── Gallery ──
  const gallery = [
    { title: "50-Seater Coach", category: "Buses", url: "/images/bus-50.png" },
    { title: "46-Seater Bus", category: "Buses", url: "/images/bus-46.png" },
    { title: "20-Seater Minibus", category: "Buses", url: "/images/bus-20.png" },
    { title: "Tempo Traveller", category: "Tempo Traveller", url: "/images/tempo.png" },
    { title: "Innova Crysta", category: "Innova", url: "/images/innova.jpg" },
    { title: "Chikmagalur Hills", category: "Destinations", url: "/images/dest-hills.jpg" },
    { title: "Jog Falls", category: "Destinations", url: "/images/dest-falls.jpg" },
    { title: "Murudeshwara Coast", category: "Destinations", url: "/images/dest-temple.jpg" },
    { title: "Gokarna Beach", category: "Destinations", url: "/images/dest-beach.jpg" },
  ];
  await prisma.galleryItem.createMany({
    data: gallery.map((g, i) => ({ ...g, sortOrder: i })),
  });

  // ── Sample customer + bookings (for dashboard demo) ──
  const customer = await prisma.user.upsert({
    where: { phone: "9876543210" },
    update: {},
    create: { phone: "9876543210", name: "Demo Customer", email: "customer@example.com" },
  });

  const now = new Date();
  const in5d = new Date(now.getTime() + 5 * 86400000);
  const in12d = new Date(now.getTime() + 12 * 86400000);
  const past20 = new Date(now.getTime() - 20 * 86400000);

  const sampleBookings = [
    {
      bookingId: "BH-2026-00001",
      vehicle: bus50,
      travelDate: in5d,
      returnDate: new Date(in5d.getTime() + 86400000),
      tripType: "ROUNDTRIP",
      distanceKm: 560,
      oneWayDistanceKm: 280,
      billableKm: 560,
      estimatedPrice: 30800,
      status: "PENDING",
      destination: "Bengaluru",
    },
    {
      bookingId: "BH-2026-00002",
      vehicle: tempo,
      travelDate: in12d,
      returnDate: null,
      tripType: "ONEWAY",
      distanceKm: 120,
      oneWayDistanceKm: 120,
      billableKm: 250,
      estimatedPrice: 7500,
      finalPrice: 8000,
      status: "CONFIRMED",
      destination: "Jog Falls",
    },
    {
      bookingId: "BH-2026-00003",
      vehicle: innova,
      travelDate: past20,
      returnDate: new Date(past20.getTime() + 86400000),
      tripType: "ROUNDTRIP",
      distanceKm: 300,
      oneWayDistanceKm: 150,
      billableKm: 500,
      estimatedPrice: 9000,
      finalPrice: 9500,
      status: "COMPLETED",
      destination: "Chikmagalur",
    },
  ];

  for (const b of sampleBookings) {
    await prisma.booking.create({
      data: {
        bookingId: b.bookingId,
        userId: customer.id,
        vehicleId: b.vehicle!.id,
        pickup: "Shivamogga",
        destination: b.destination,
        travelDate: b.travelDate,
        returnDate: b.returnDate,
        tripType: b.tripType,
        passengers: 10,
        tripDays: b.returnDate ? 2 : 1,
        oneWayDistanceKm: b.oneWayDistanceKm,
        distanceKm: b.distanceKm,
        billableKm: b.billableKm,
        estimatedPrice: b.estimatedPrice,
        finalPrice: b.finalPrice ?? null,
        status: b.status,
        customerName: "Demo Customer",
        customerPhone: "9876543210",
        customerEmail: "customer@example.com",
      },
    });
  }

  // ── Sample enquiries ──
  await prisma.enquiry.createMany({
    data: [
      { name: "Anand Rao", phone: "9000000001", subject: "Bus rental for wedding", message: "Need a 50-seater bus for a wedding in Bengaluru next month.", status: "NEW" },
      { name: "Priya Shetty", phone: "9000000002", subject: "Tempo Traveller quote", message: "Looking for a Tempo Traveller for a 2-day Chikmagalur trip.", status: "CONTACTED" },
    ],
  });

  console.log("✅ Seed complete.");
  console.log(`   Admin login email: ${adminEmail}`);
  console.log(`   Admin password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
