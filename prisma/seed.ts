import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding database…");

  await prisma.teamAssignment.deleteMany();
  await prisma.agreement.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectVendor.deleteMany();
  await prisma.project.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.client.deleteMany();

  const team = await Promise.all(
    [
      { name: "Ananya Rao", role: "PRINCIPAL_DESIGNER" as const, email: "ananya@roarstudio.in", phone: "9820011223" },
      { name: "Vikram Shetty", role: "ARCHITECT" as const, email: "vikram@roarstudio.in", phone: "9820011224" },
      { name: "Meera Nair", role: "DESIGNER" as const, email: "meera@roarstudio.in", phone: "9820011225" },
      { name: "Karan Desai", role: "SITE_SUPERVISOR" as const, email: "karan@roarstudio.in", phone: "9820011226" },
      { name: "Priya Iyer", role: "PROCUREMENT" as const, email: "priya@roarstudio.in", phone: "9820011227" },
      { name: "Rahul Bhatt", role: "ACCOUNTS" as const, email: "rahul@roarstudio.in", phone: "9820011228" },
    ].map((m) => prisma.teamMember.create({ data: m }))
  );

  const clients = await Promise.all(
    [
      { name: "Aditya & Sneha Malhotra", phone: "9811100001", email: "aditya.malhotra@example.com", city: "Mumbai", status: "ACTIVE" as const, source: "REFERRAL" as const },
      { name: "The Bombay Canteen (Andheri)", phone: "9811100002", email: "ops@bombaycanteen.example", city: "Mumbai", status: "ACTIVE" as const, source: "WEBSITE" as const },
      { name: "Rhea Kapoor", phone: "9811100003", email: "rhea.kapoor@example.com", city: "Pune", status: "ACTIVE" as const, source: "SOCIAL_MEDIA" as const },
      { name: "Nimbus Coworks LLP", phone: "9811100004", email: "admin@nimbuscoworks.example", city: "Bengaluru", status: "LEAD" as const, source: "EXHIBITION" as const },
      { name: "Dr. Farhan Sheikh", phone: "9811100005", email: "farhan.sheikh@example.com", city: "Mumbai", status: "PAST" as const, source: "REFERRAL" as const },
      { name: "Kavita & Ramesh Iyengar", phone: "9811100006", email: "kavita.iyengar@example.com", city: "Chennai", status: "ON_HOLD" as const, source: "WALK_IN" as const },
      { name: "Studio Verde Cafe", phone: "9811100007", email: "hello@studioverde.example", city: "Pune", status: "LEAD" as const, source: "WEBSITE" as const },
      { name: "Arjun Malhoutra", phone: "9811100008", email: "arjun.m@example.com", city: "Mumbai", status: "ACTIVE" as const, source: "OTHER" as const },
    ].map((c) => prisma.client.create({ data: c }))
  );

  const vendors = await Promise.all(
    [
      { name: "Craftwood Interiors", category: "CARPENTRY" as const, phone: "9922200001", contactName: "Suresh Patil", paymentTerms: "50% advance, 50% on delivery", rating: 5 },
      { name: "Elite Modular Kitchens", category: "MODULAR_KITCHEN" as const, phone: "9922200002", contactName: "Deepak Shah", paymentTerms: "30-40-30", rating: 4 },
      { name: "Lumos Lighting Co.", category: "LIGHTING" as const, phone: "9922200003", contactName: "Neha Joshi", paymentTerms: "Net 15", rating: 4 },
      { name: "Bright Spark Electricals", category: "ELECTRICAL" as const, phone: "9922200004", contactName: "Manoj Kumar", paymentTerms: "Net 30", rating: 3 },
      { name: "AquaFlow Plumbing Works", category: "PLUMBING" as const, phone: "9922200005", contactName: "Irfan Sheikh", paymentTerms: "Net 15", rating: 4 },
      { name: "Marble & Stone Co.", category: "FLOORING" as const, phone: "9922200006", contactName: "Sanjay Rathi", paymentTerms: "50% advance", rating: 5 },
      { name: "ChromaCoat Painters", category: "PAINTING" as const, phone: "9922200007", contactName: "Ravi Verma", paymentTerms: "Net 7", rating: 3 },
      { name: "Vitrage Glass & Metal", category: "GLASS_METAL" as const, phone: "9922200008", contactName: "Alok Mehta", paymentTerms: "Net 30", rating: 4 },
    ].map((v) => prisma.vendor.create({ data: v }))
  );

  type Seed = {
    name: string;
    type: "RESIDENTIAL" | "COMMERCIAL" | "RENOVATION" | "TURNKEY" | "CONSULTATION";
    status: "ENQUIRY" | "DESIGN" | "APPROVAL" | "EXECUTION" | "HANDOVER" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
    clientIdx: number;
    budget: number;
    city: string;
    area: number;
  };

  const projectSeeds: Seed[] = [
    { name: "Malhotra Residence — 3BHK Turnkey", type: "TURNKEY", status: "EXECUTION", clientIdx: 0, budget: 4200000, city: "Mumbai", area: 1450 },
    { name: "Bombay Canteen — Andheri Outlet Fitout", type: "COMMERCIAL", status: "DESIGN", clientIdx: 1, budget: 6800000, city: "Mumbai", area: 3200 },
    { name: "Kapoor Duplex Renovation", type: "RENOVATION", status: "APPROVAL", clientIdx: 2, budget: 1850000, city: "Pune", area: 980 },
    { name: "Nimbus Coworks — Phase 1", type: "COMMERCIAL", status: "ENQUIRY", clientIdx: 3, budget: 9500000, city: "Bengaluru", area: 5400 },
    { name: "Dr. Sheikh Clinic Interior", type: "COMMERCIAL", status: "COMPLETED", clientIdx: 4, budget: 1250000, city: "Mumbai", area: 620 },
    { name: "Iyengar Residence — Full Home", type: "RESIDENTIAL", status: "ON_HOLD", clientIdx: 5, budget: 3100000, city: "Chennai", area: 1800 },
    { name: "Studio Verde Cafe Concept", type: "CONSULTATION", status: "ENQUIRY", clientIdx: 6, budget: 450000, city: "Pune", area: 850 },
    { name: "Malhoutra Weekend Home", type: "RESIDENTIAL", status: "HANDOVER", clientIdx: 7, budget: 5600000, city: "Mumbai", area: 2100 },
  ];

  const phases: Array<{ title: string; phase: string; status: "PENDING" | "IN_PROGRESS" | "DONE" | "DELAYED" }> = [
    { title: "Site Measurement & Brief", phase: "Design", status: "DONE" },
    { title: "Concept Design & Moodboard", phase: "Design", status: "DONE" },
    { title: "3D Visualization", phase: "Design", status: "IN_PROGRESS" },
    { title: "Client Approval & Sign-off", phase: "Approval", status: "PENDING" },
    { title: "Civil & Carpentry Execution", phase: "Execution", status: "PENDING" },
    { title: "MEP & Finishing", phase: "Execution", status: "PENDING" },
    { title: "Styling & Handover", phase: "Handover", status: "PENDING" },
  ];

  for (let i = 0; i < projectSeeds.length; i++) {
    const s = projectSeeds[i];
    const project = await prisma.project.create({
      data: {
        name: s.name,
        code: `RS-${2026}-${String(i + 1).padStart(3, "0")}`,
        type: s.type,
        status: s.status,
        city: s.city,
        area: s.area,
        budget: s.budget,
        clientId: clients[s.clientIdx].id,
        startDate: daysFromNow(-60 + i * 5),
        targetEndDate: daysFromNow(120 + i * 10),
        description: `${s.type.replace("_", " ").toLowerCase()} project in ${s.city}.`,
      },
    });

    await Promise.all(
      phases.map((p, idx) =>
        prisma.milestone.create({
          data: {
            projectId: project.id,
            title: p.title,
            phase: p.phase,
            status: idx <= i % phases.length ? p.status : "PENDING",
            order: idx,
            startDate: daysFromNow(-40 + idx * 12),
            dueDate: daysFromNow(-40 + idx * 12 + 10),
          },
        })
      )
    );

    const vendorPicks = [vendors[i % vendors.length], vendors[(i + 3) % vendors.length]];
    await Promise.all(
      vendorPicks.map((v, idx) =>
        prisma.projectVendor.create({
          data: {
            projectId: project.id,
            vendorId: v.id,
            scope: idx === 0 ? "Primary execution" : "Supporting scope",
            poValue: Math.round(s.budget * (idx === 0 ? 0.25 : 0.12)),
          },
        })
      )
    );

    await Promise.all(
      team.slice(0, 3).map((t, idx) =>
        prisma.teamAssignment.create({
          data: {
            projectId: project.id,
            teamMemberId: t.id,
            role: idx === 0 ? "Lead" : "Support",
          },
        })
      )
    );

    await prisma.transaction.create({
      data: {
        type: "CLIENT_PAYMENT",
        status: "PAID",
        amount: Math.round(s.budget * 0.3),
        paidDate: daysFromNow(-45 + i * 4),
        method: "Bank Transfer",
        reference: `ADV-${1000 + i}`,
        projectId: project.id,
        clientId: clients[s.clientIdx].id,
      },
    });
    await prisma.transaction.create({
      data: {
        type: "CLIENT_PAYMENT",
        status: i % 3 === 0 ? "OVERDUE" : "PENDING",
        amount: Math.round(s.budget * 0.3),
        dueDate: daysFromNow(7 + i * 3),
        projectId: project.id,
        clientId: clients[s.clientIdx].id,
      },
    });
    await prisma.transaction.create({
      data: {
        type: "VENDOR_PAYMENT",
        status: "PAID",
        amount: Math.round(s.budget * 0.15),
        paidDate: daysFromNow(-20 + i * 2),
        method: "NEFT",
        projectId: project.id,
        vendorId: vendorPicks[0].id,
      },
    });
    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        status: "PAID",
        amount: 25000 + i * 3000,
        paidDate: daysFromNow(-10 + i),
        notes: "Site visit & logistics",
        projectId: project.id,
      },
    });

    await prisma.agreement.create({
      data: {
        title: `${s.name} — Design Agreement`,
        type: "DESIGN_AGREEMENT",
        status: i % 4 === 0 ? "DRAFT" : i % 4 === 1 ? "SENT" : "SIGNED",
        value: Math.round(s.budget * 0.08),
        startDate: daysFromNow(-60 + i * 5),
        projectId: project.id,
        clientId: clients[s.clientIdx].id,
      },
    });
  }

  console.log(`Seeded ${clients.length} clients, ${projectSeeds.length} projects, ${vendors.length} vendors, ${team.length} team members.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
