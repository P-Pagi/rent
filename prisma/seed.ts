import { prisma } from "../src/lib/db";

async function main() {
  console.log("Seeding started...");

  // 1. Clear database
  await prisma.timeline.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.costume.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.admin.deleteMany({});
  // syncLog model was removed from schema.prisma; skip clearing it here.

  // 2. Create Admin
  const admin = await prisma.admin.create({
    data: {
      email: "admin@kawaiirental.com",
      username: "Hana-chan",
      password: "password123", // In production, hash this with bcrypt
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Hana",
    },
  });
  console.log("Created admin:", admin.username);

  // 3. Create Costumes
  const costumesData = [
    {
      name: "Hatsune Miku (Classic Vocaloid)",
      stock: 3,
      available: 2,
      borrowed: 1,
      maintenance: 0,
      popularity: 88,
      imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60",
    },
    {
      name: "Raiden Shogun (Genshin Impact)",
      stock: 2,
      available: 1,
      borrowed: 1,
      maintenance: 0,
      popularity: 95,
      imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60",
    },
    {
      name: "Frieren (Frieren: Beyond Journey's End)",
      stock: 4,
      available: 3,
      borrowed: 0,
      maintenance: 1,
      popularity: 98,
      imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60",
    },
    {
      name: "Sailor Moon (Usagi Tsukino)",
      stock: 2,
      available: 2,
      borrowed: 0,
      maintenance: 0,
      popularity: 72,
      imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60",
    },
    {
      name: "Keqing (Genshin Impact)",
      stock: 1,
      available: 0,
      borrowed: 0,
      maintenance: 1,
      popularity: 64,
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60",
    },
    {
      name: "Kamado Nezuko (Demon Slayer)",
      stock: 3,
      available: 1,
      borrowed: 2,
      maintenance: 0,
      popularity: 90,
      imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&auto=format&fit=crop&q=60",
    },
  ];

  const costumes = [];
  for (const c of costumesData) {
    const costume = await prisma.costume.create({ data: c });
    costumes.push(costume);
  }
  console.log(`Created ${costumes.length} costumes.`);

  // 4. Create Customers
  const customersData = [
    {
      name: "Sakura Miyawaki",
      instagram: "@sakura_cos",
      phone: "+628123456789",
      address: "Jl. Sakura No. 12, Bandung, Jawa Barat",
      totalRentals: 5,
    },
    {
      name: "Rin Tohsaka",
      instagram: "@rin_tohsaka_real",
      phone: "+628776655443",
      address: "Green Residence Block B7, Tangerang",
      totalRentals: 3,
    },
    {
      name: "Megumi Kato",
      instagram: "@megumi_flat",
      phone: "+628998877665",
      address: "Kost Pondok Kawaii Kamar A5, Depok, Jawa Barat",
      totalRentals: 1,
    },
    {
      name: "Yuki Kato",
      instagram: "@yukicat_cos",
      phone: "+628554433221",
      address: "Graha Indah Indah C4, Jakarta Selatan",
      totalRentals: 0,
    },
  ];

  const customers = [];
  for (const cust of customersData) {
    const customer = await prisma.customer.create({ data: cust });
    customers.push(customer);
  }
  console.log(`Created ${customers.length} customers.`);

  // 5. Create Bookings & Timelines
  const today = new Date();
  const bookingsData = [
    {
      customerIdx: 0, // Sakura
      costumeIdx: 0,  // Hatsune Miku
      rentalStartDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      rentalEndDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      eventName: "Comic Frontier (Comifuro) 18",
      paymentMethod: "Transfer Bank BCA",
      pickupMethod: "Ambil Sendiri",
      totalAmount: 180000.0,
      notes: "Mohon siapkan wig cap tambahan ya kak, terima kasih!",
      attachmentUrl: "https://docs.google.com/spreadsheets/d/mock-attachment-1",
      status: "SEDANG_DISEWA",
      timeline: [
        { status: "BOOKING_BARU", updatedBy: "System Sync", comment: "Form submitted via Google Forms." },
        { status: "MENUNGGU_KONFIRMASI", updatedBy: "Hana-chan", comment: "Memeriksa ketersediaan kostum." },
        { status: "MENUNGGU_PEMBAYARAN", updatedBy: "Hana-chan", comment: "Kostum dikonfirmasi. Invoice dikirim." },
        { status: "SUDAH_DIBAYAR", updatedBy: "Hana-chan", comment: "Pembayaran Rp180.000 diterima via transfer BCA." },
        { status: "KOSTUM_DISIAPKAN", updatedBy: "Hana-chan", comment: "Kostum sedang disetrika dan dipacking." },
        { status: "SUDAH_DIAMBIL", updatedBy: "Hana-chan", comment: "Kostum diambil di toko oleh customer." },
        { status: "SEDANG_DISEWA", updatedBy: "System Sync", comment: "Memasuki masa sewa aktif." },
      ],
    },
    {
      customerIdx: 1, // Rin Tohsaka
      costumeIdx: 1,  // Raiden Shogun
      rentalStartDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      rentalEndDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      eventName: "Anime Festival Asia (AFA)",
      paymentMethod: "E-Wallet (GoPay)",
      pickupMethod: "Kurir Instan (Gojek)",
      totalAmount: 250000.0,
      notes: "Kirim pakai Gosend instant sebelum jam 10 pagi.",
      attachmentUrl: "https://docs.google.com/spreadsheets/d/mock-attachment-2",
      status: "SELESAI",
      timeline: [
        { status: "BOOKING_BARU", updatedBy: "System Sync", comment: "Form submitted via Google Forms." },
        { status: "SUDAH_DIBAYAR", updatedBy: "Hana-chan", comment: "Lunas via GoPay." },
        { status: "SUDAH_DIAMBIL", updatedBy: "Hana-chan", comment: "Diserahkan ke kurir instant." },
        { status: "SUDAH_DIKEMBALIKAN", updatedBy: "Hana-chan", comment: "Kostum dikembalikan lengkap dan tidak ada noda." },
        { status: "SELESAI", updatedBy: "Hana-chan", comment: "Booking ditutup." },
      ],
    },
    {
      customerIdx: 2, // Megumi flat
      costumeIdx: 5,  // Nezuko
      rentalStartDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // in 3 days
      rentalEndDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      eventName: "Chiba Cosplay Party",
      paymentMethod: "Transfer Bank Mandiri",
      pickupMethod: "Ambil Sendiri",
      totalAmount: 150000.0,
      notes: "Aksesoris bambu Nezuko mohon dipastikan dalam kondisi baik.",
      attachmentUrl: "https://docs.google.com/spreadsheets/d/mock-attachment-3",
      status: "MENUNGGU_KONFIRMASI",
      timeline: [
        { status: "BOOKING_BARU", updatedBy: "System Sync", comment: "Form submitted via Google Forms." },
        { status: "MENUNGGU_KONFIRMASI", updatedBy: "System Sync", comment: "Booking baru masuk." },
      ],
    },
    {
      customerIdx: 0, // Sakura
      costumeIdx: 2,  // Frieren
      rentalStartDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // in 10 days
      rentalEndDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000),
      eventName: "Gath Cosplay Bandung",
      paymentMethod: "E-Wallet (OVO)",
      pickupMethod: "Kurir SameDay",
      totalAmount: 220000.0,
      notes: "Sewa tongkat Frieren juga ya kak.",
      attachmentUrl: "https://docs.google.com/spreadsheets/d/mock-attachment-4",
      status: "BOOKING_BARU",
      timeline: [
        { status: "BOOKING_BARU", updatedBy: "System Sync", comment: "Form submitted via Google Forms." },
      ],
    },
  ];

  for (const bData of bookingsData) {
    const booking = await prisma.booking.create({
      data: {
        rentalStartDate: bData.rentalStartDate,
        rentalEndDate: bData.rentalEndDate,
        eventName: bData.eventName,
        paymentMethod: bData.paymentMethod,
        pickupMethod: bData.pickupMethod,
        totalAmount: bData.totalAmount,
        notes: bData.notes,
        attachmentUrl: bData.attachmentUrl,
        status: bData.status,
        customer: { connect: { id: customers[bData.customerIdx].id } },
        costume: { connect: { id: costumes[bData.costumeIdx].id } },
      },
    });

    for (const t of bData.timeline) {
      await prisma.timeline.create({
        data: {
          bookingId: booking.id,
          status: t.status,
          updatedBy: t.updatedBy,
          comment: t.comment,
        },
      });
    }
  }
  console.log("Created bookings with timelines.");

  // 6. (Optional) Sync logs are no longer stored in Prisma schema.

  console.log("Seeding complete! (｡♥‿♥｡)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // We disconnect manually. In Prisma 7, the Client handles database connection pooling automatically,
    // but manually disconnecting ensures a clean exit for scripts.
    await prisma.$disconnect();
  });
