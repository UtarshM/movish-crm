const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')
const prisma = new PrismaClient()

async function main() {
  console.log('Inserting Municipal Vehicle GJ15AX3940 details into Supabase...')

  // 1. Find or create Ganpat Ladva as Service Advisor
  let advisor = await prisma.user.findFirst({
    where: { fullName: { contains: 'GANPAT' } }
  })

  if (!advisor) {
    let role = await prisma.role.findFirst({
      where: { name: 'CRM Executive' }
    })
    if (!role) role = await prisma.role.findFirst()

    advisor = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: 'ganpat.ladva@movish.com',
        fullName: 'GANPAT KANJIBHAI LADVA',
        isActive: true,
        roleId: role ? role.id : null,
      }
    })
    console.log('Created SA Ganpat Ladva')
  }

  // 2. Create Lead for Sanand Nagarpalika
  const leadId = uuidv4()
  const lead = await prisma.lead.create({
    data: {
      id: leadId,
      clientName: 'Sanand Nagarpalika (Mr. Dave)',
      clientPhone: '9974023456',
      clientEmail: 'admin@sanandnagarpalika.org',
      vehicleNo: 'Ashok Leyland Dost (Reg: GJ15AX3940)',
      status: 'Won',
      assignedTo: advisor.id,
      createdAt: new Date('2026-06-12T10:00:00Z'),
      updatedAt: new Date('2026-06-12T18:45:00Z')
    }
  })
  console.log(`Created Lead for Sanand Nagarpalika (${lead.id})`)

  // 3. Create Customer
  const customer = await prisma.customer.create({
    data: {
      id: uuidv4(),
      leadId: leadId,
      name: 'Sanand Nagarpalika',
      phone: '9974023456',
      email: 'admin@sanandnagarpalika.org',
      address: 'Nagarpalika Office, Sanand, Gujarat, India',
      kycStatus: 'verified',
      totalRevenue: 8500,
    }
  })
  console.log(`Created Customer Profile (${customer.id})`)

  // 4. Create Transaction
  const tx = await prisma.transaction.create({
    data: {
      id: uuidv4(),
      type: 'income',
      category: 'Service Fee',
      amount: 8500,
      status: 'completed',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'NEFT-SBI-44321',
      description: 'Final Inspection & Servicing - GJ15AX3940',
      date: new Date('2026-06-12')
    }
  })
  console.log(`Created transaction log for ₹8,500 (${tx.id})`)

  console.log('✅ Municipal Vehicle GJ15AX3940 integrated into Supabase successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
