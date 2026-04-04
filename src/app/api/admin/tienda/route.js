import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Middleware-like check for Maestro role
async function checkMaestro() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.rol !== "Maestro") {
        return { authorized: false };
    }
    return { authorized: true, user: session.user };
}

export async function GET() {
    try {
        const { authorized } = await checkMaestro();
        if (!authorized) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });

        const items = await prisma.tiendaItem.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ ok: true, items });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { authorized } = await checkMaestro();
        if (!authorized) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });

        const data = await req.json();
        const item = await prisma.tiendaItem.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                precio: parseFloat(data.precio),
                precioTinta: data.precioTinta ? parseInt(data.precioTinta) : null,
                tipo: data.tipo, // tinta, libro, objeto
                cantidad: data.cantidad ? parseInt(data.cantidad) : null,
                imagenUrl: data.imagenUrl,
                enlacePdf: data.enlacePdf,
                enlaceEpub: data.enlaceEpub,
                disponible: data.disponible !== undefined ? data.disponible : true
            }
        });
        return NextResponse.json({ ok: true, item });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { authorized } = await checkMaestro();
        if (!authorized) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });

        const data = await req.json();
        const { id, ...updateData } = data;

        if (updateData.precio) updateData.precio = parseFloat(updateData.precio);
        if (updateData.precioTinta) updateData.precioTinta = parseInt(updateData.precioTinta);
        if (updateData.cantidad) updateData.cantidad = parseInt(updateData.cantidad);

        const item = await prisma.tiendaItem.update({
            where: { id },
            data: updateData
        });
        return NextResponse.json({ ok: true, item });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { authorized } = await checkMaestro();
        if (!authorized) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        await prisma.tiendaItem.delete({
            where: { id }
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
