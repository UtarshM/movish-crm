const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')
const prisma = new PrismaClient()

async function main() {
  console.log('Inserting Repair Order #4535 data into Supabase...')

  // 1. Get or create a Service Advisor / Employee User (Danish)
  let role = await prisma.role.findFirst({
    where: { name: { in: ['Sales Executive', 'Admin', 'Super Admin'] } }
  })
  
  if (!role) {
    role = await prisma.role.findFirst()
  }

  let user = await prisma.user.findFirst({
    where: { email: 'danish@movish.com' }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: 'danish@movish.com',
        fullName: 'Danish',
        isActive: true,
        roleId: role ? role.id : null,
      }
    })
    console.log('Created user Danish')
  }

  // 2. Create the Lead (active repair status, so we mark it as in-progress/negotiation or similar status)
  const leadId = uuidv4()
  const lead = await prisma.lead.create({
    data: {
      id: leadId,
      clientName: 'Mayur Bhai',
      clientPhone: '9724992981',
      clientEmail: 'mayur.bhai@mandal.com',
      vehicleNo: 'Ashok Leyland Bada Dost (Reg: GJ38TA5028)',
      status: 'Qualified', // Active service lead
      assignedTo: user.id,
      createdAt: new Date('2026-06-09T09:52:00Z'),
      updatedAt: new Date('2026-06-09T09:52:00Z')
    }
  })
  console.log(`Created Lead for Mayur Bhai (${lead.id})`)

  // 3. Create the Customer record
  const customer = await prisma.customer.create({
    data: {
      id: uuidv4(),
      leadId: leadId,
      name: 'Mayur Bhai',
      phone: '9724992981',
      email: 'mayur.bhai@mandal.com',
      address: 'Mandal, Gujarat, India',
      kycStatus: 'pending',
      totalRevenue: 0, // In-progress service, no revenue yet
    }
  })
  console.log(`Created Customer profile for Mayur Bhai (${customer.id})`)

  // 4. Create a FollowUp task for Danish to check the regeneration light status
  const followup = await prisma.followUp.create({
    data: {
      id: uuidv4(),
      leadId: leadId,
      assignedTo: user.id,
      leadName: 'Mayur Bhai',
      type: 'call',
      scheduledAt: new Date('2026-06-10T10:00:00Z'),
      notes: 'Follow up on DPF Regeneration Light check status and road test results.',
      status: 'pending'
    }
  })
  console.log(`Created FollowUp task for Danish (${followup.id})`)

  console.log('✅ Repair Order #4535 integrated into Supabase database successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
