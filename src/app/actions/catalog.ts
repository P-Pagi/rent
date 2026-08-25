"use server";

import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const ACTIVE_RENTAL_STATUSES = [
  "SUDAH_DIBAYAR",
  "KOSTUM_DISIAPKAN",
  "SUDAH_DIAMBIL",
  "SEDANG_DISEWA",
  "SUDAH_DIKEMBALIKAN",
] as const;

function splitImageUrls(imageUrl?: string | null) {
  return imageUrl
    ?.split(",")
    .map((url) => url.trim())
    .filter(Boolean) ?? [];
}

function normalizeImageUrl(imageUrl?: string | null) {
  const urls = splitImageUrls(imageUrl);
  return urls.length ? urls.join(",") : null;
}

async function removeUnusedLocalImages(
  oldImageUrl?: string | null,
  newImageUrl?: string | null
) {
  const oldUrls = splitImageUrls(oldImageUrl);
  const newUrls = new Set(splitImageUrls(newImageUrl));

  const removedUrls = oldUrls.filter((url) => !newUrls.has(url));

  for (const url of removedUrls) {
    if (!url.startsWith("/uploads/")) {
      continue;
    }

    const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));

    try {
      await unlink(filePath);
    } catch {
      // Ignore file-not-found or already removed assets.
    }
  }
}

export async function getCostumes(search?: string) {
  const where: any = {};
  if (search) {
    where.name = { contains: search };
  }

  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const costumes = await prisma.costume.findMany({
    where,
    orderBy: { popularity: "desc" },
    select: {
      id: true,
      name: true,
      stock: true,
      available: true,
      borrowed: true,
      maintenance: true,
      imageUrl: true,
      popularity: true,
      price: true,
      bookings: {
        where: {
          status: { in: [...ACTIVE_RENTAL_STATUSES] },
          rentalStartDate: { lte: endOfToday },
          rentalEndDate: { gte: startOfToday },
        },
        select: {
          id: true,
          status: true,
          rentalStartDate: true,
          rentalEndDate: true,
        },
      },
    },
  });

  return costumes.map(({ bookings, ...costume }) => {
    const rentedUnits = bookings.length;
    const maintenanceUnits = Math.max(0, costume.maintenance || 0);
    return {
      ...costume,
      borrowed: rentedUnits,
      available: Math.max(costume.stock - rentedUnits - maintenanceUnits, 0),
    };
  });
}

export async function createCostume(input: {
  name: string;
  stock: number;
  popularity?: number;
  maintenance?: number;
  price?: number;
  imageUrl?: string | null;
}) {
  const name = input.name.trim();
  const stock = Math.max(0, Number(input.stock) || 0);
  const price = Math.max(0, Number(input.price) || 0);

  if (!name) {
    throw new Error("Nama kostum wajib diisi.");
  }

  const existing = await prisma.costume.findUnique({ where: { name } });
  if (existing) {
    throw new Error("Nama kostum sudah ada.");
  }

  const costume = await prisma.costume.create({
    data: {
      name,
      stock,
      available: stock,
      borrowed: 0,
      popularity: Math.max(0, Number(input.popularity) || 0),
      maintenance: Math.max(0, Number(input.maintenance) || 0),
      price,
      imageUrl: normalizeImageUrl(input.imageUrl),
    },
  });

  revalidatePath("/costumes");
  revalidatePath("/catalog");
  revalidatePath("/");

  return costume;
}

export async function updateCostume(
  id: string,
  input: {
    name: string;
    stock: number;
    popularity?: number;
    maintenance?: number;
    price?: number;
    imageUrl?: string | null;
  }
) {
  const name = input.name.trim();
  const stock = Math.max(0, Number(input.stock) || 0);
  const price = Math.max(0, Number(input.price) || 0);

  if (!name) {
    throw new Error("Nama kostum wajib diisi.");
  }

  const sameName = await prisma.costume.findUnique({ where: { name } });
  if (sameName && sameName.id !== id) {
    throw new Error("Nama kostum sudah dipakai oleh item lain.");
  }

  const existing = await prisma.costume.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Kostum tidak ditemukan.");
  }

  const nextImageUrl = normalizeImageUrl(input.imageUrl);

  if (existing.imageUrl) {
    await removeUnusedLocalImages(existing.imageUrl, nextImageUrl);
  }

  const costume = await prisma.costume.update({
    where: { id },
    data: {
      name,
      stock,
      available: stock,
      popularity: Math.max(0, Number(input.popularity) || 0),
      maintenance: Math.max(0, Number(input.maintenance) || 0),
      price,
      imageUrl: nextImageUrl,
    },
  });

  revalidatePath("/costumes");
  revalidatePath("/catalog");
  revalidatePath("/");

  return costume;
}

export async function deleteCostume(id: string) {
  const costume = await prisma.costume.findUnique({ where: { id } });
  if (!costume) {
    throw new Error("Kostum tidak ditemukan.");
  }

  const bookings = await prisma.booking.count({ where: { costumeId: id } });
  if (bookings > 0) {
    throw new Error("Kostum tidak bisa dihapus karena masih memiliki riwayat sewa.");
  }

  await removeUnusedLocalImages(costume.imageUrl, null);
  await prisma.costume.delete({ where: { id } });

  revalidatePath("/costumes");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function getCustomers(search?: string) {
  const where: any = {};
  if (search) {
    const s = search.toLowerCase();
    where.OR = [
      { name: { contains: s } },
      { instagram: { contains: s } },
      { phone: { contains: s } },
      { address: { contains: s } },
    ];
  }

  return prisma.customer.findMany({
    where,
    orderBy: { totalRentals: "desc" },
    include: {
      bookings: {
        orderBy: { bookingDate: "desc" },
        take: 1,
        select: {
          bookingDate: true,
        },
      },
    },
  });
}

export async function finishMaintenance(costumeId: string) {
  const costume = await prisma.costume.findUnique({ where: { id: costumeId } });
  if (!costume) {
    throw new Error("Kostum tidak ditemukan.");
  }
  if (costume.maintenance <= 0) {
    return costume;
  }

  const updated = await prisma.costume.update({
    where: { id: costumeId },
    data: {
      maintenance: { decrement: 1 },
      available: { increment: 1 },
    },
  });

  revalidatePath("/costumes");
  revalidatePath("/catalog");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return updated;
}
