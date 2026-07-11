const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')
const prisma = new PrismaClient()

async function main() {
  console.log('Inserting invoice data into Supabase...')

  // 1. Get or create a Service Executive / Employee User to assign the work to
  let role = await prisma.role.findFirst({
    where: { name: { in: ['Sales Executive', 'Admin', 'Super Admin'] } }
  })
  
  if (!role) {
    role = await prisma.role.findFirst()
  }

  // Create a default employee user if none exists
  let user = await prisma.user.findFirst({
    where: { email: 'shaikh.jaanmohammad@movish.com' }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: 'shaikh.jaanmohammad@movish.com',
        fullName: 'Shaikh Jaanmohammad',
        isActive: true,
        roleId: role ? role.id : null,
      }
    })
    console.log('Created user Shaikh Jaanmohammad')
  }

  // 2. Create the Lead
  const leadId = uuidv4()
  const lead = await prisma.lead.create({
    data: {
      id: leadId,
      clientName: 'Jigar Transport And Company',
      clientPhone: '9904877465',
      clientEmail: 'info@jigartransport.com',
      vehicleNo: 'L0891700TCSCC_WHT (Reg: GJ01LT4513)',
      status: 'Won',
      assignedTo: user.id,
      createdAt: new Date('2026-06-11T10:00:00Z'),
      updatedAt: new Date('2026-06-11T17:28:00Z')
    }
  })
  console.log(`Created Lead for Jigar Transport (${lead.id})`)

  // 3. Create the Customer record
  const customer = await prisma.customer.create({
    data: {
      id: uuidv4(),
      leadId: leadId,
      name: 'Jigar Transport And Company',
      phone: '9904877465',
      email: 'info@jigartransport.com',
      address: '380054 AHMEDABAD-AHMEDABAD, INDIA',
      kycStatus: 'verified',
      totalRevenue: 650.04,
      lastSaleDate: new Date('2026-06-11T17:28:00Z')
    }
  })
  console.log(`Created Customer profile (${customer.id})`)

  // 4. Create the Transaction record
  const transaction = await prisma.transaction.create({
    data: {
      id: uuidv4(),
      leadId: leadId,
      userId: user.id,
      type: 'income',
      category: 'Service Fee',
      amount: 650.04,
      status: 'completed',
      paymentMethod: 'Cash',
      referenceNumber: 'INV7770260001485',
      description: 'LCV Minor Service charge (R&R ScanTool) - GJ01LT4513',
      date: new Date('2026-06-11T17:28:00Z')
    }
  })
  console.log(`Created Transaction record (${transaction.id})`)

  // 5. Create a FitnessWork record (since it tracks vehicle fitness/expiry)
  const fitness = await prisma.fitnessWork.create({
    data: {
      id: uuidv4(),
      leadId: leadId,
      assignedTo: user.id,
      customerName: 'Jigar Transport And Company',
      vehicleNumber: 'GJ01LT4513',
      status: 'completed',
      testDate: new Date('2026-06-11T10:00:00Z'),
      fees: 650.04
    }
  })
  console.log(`Created FitnessWork record (${fitness.id})`)

  console.log('✅ All invoice database records successfully integrated!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
