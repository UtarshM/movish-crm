const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Get or create the admin user to assign records
  let admin = await prisma.user.findUnique({ where: { email: 'admin@movish.com' } })
  if (!admin) {
    admin = await prisma.user.findFirst({ where: { email: 'jiya.scalezix@gmail.com' } })
  }
  if (!admin) {
    admin = await prisma.user.findFirst()
  }
  if (!admin) {
    let role = await prisma.role.findFirst({ where: { name: 'super_admin' } })
    if (!role) {
      role = await prisma.role.create({ data: { name: 'super_admin', description: 'Super Administrator' } })
    }
    admin = await prisma.user.create({
      data: {
        email: 'admin@movish.com',
        fullName: 'Movish Auto Admin',
        roleId: role.id,
        isActive: true
      }
    })
  }
  const uid = admin.id

  console.log('Seeding Movish Auto CV Dealer sample data (idempotent)...')

  // 1. CRM / Customers (Ahmedabad Districts & Commercial Cargo Operators)
  const customers = [
    { name: 'Amit Patel (Maruti Roadlines)', phone: '9823456781', email: 'amit.patel@marutiroadlines.com', address: 'Naroda GIDC, Ahmedabad, Gujarat', kycStatus: 'verified', totalRevenue: 1250000, policyCount: 3 },
    { name: 'Karan Singh (Gujarat Cargo)', phone: '9823456782', email: 'karan.singh@gujaratcargo.com', address: 'Sarkhej, Ahmedabad, Gujarat', kycStatus: 'verified', totalRevenue: 870000, policyCount: 2 },
    { name: 'Meera Shah (Shreeji Logistics)', phone: '9823456783', email: 'meera.shah@shreejilogistics.com', address: 'Sanand GIDC, Ahmedabad, Gujarat', kycStatus: 'pending', totalRevenue: 450000, policyCount: 1 },
    { name: 'Suresh Patel (Ahmedabad Bulk Carriers)', phone: '9823456784', email: 'suresh.patel@bulkcarriers.com', address: 'Gota, Ahmedabad, Gujarat', kycStatus: 'verified', totalRevenue: 2100000, policyCount: 4 },
    { name: 'Vijay Gupta (Sabarmati Movers)', phone: '9823456785', email: 'vijay.gupta@sabarmati.com', address: 'SG Highway, Ahmedabad, Gujarat', kycStatus: 'verified', totalRevenue: 950000, policyCount: 2 },
    { name: 'Rohan Shah (City Logistics)', phone: '9823456786', email: 'rohan.shah@citylogistics.com', address: 'Bapunagar, Ahmedabad, Gujarat', kycStatus: 'pending', totalRevenue: 320000, policyCount: 1 },
  ]
  
  // Clean up existing customers to avoid duplicate phone/email conflicts if required, but let's do find-or-create or try-catch
  for (const c of customers) {
    const existing = await prisma.customer.findFirst({ where: { phone: c.phone } })
    if (!existing) {
      await prisma.customer.create({ data: c })
    }
  }
  console.log('✓ 6 CRM customers')

  // 2. Leads (Commercial Fleet Owners in Ahmedabad)
  const leads = [
    { clientName: 'Rajesh Sharma', clientPhone: '9876543210', clientEmail: 'rajesh.sharma@fleetowner.com', status: 'New', assignedTo: uid, vehicleNo: 'GJ-01-XX-9901', city: 'Ahmedabad' },
    { clientName: 'Priya Patel', clientPhone: '9876543211', clientEmail: 'priya.patel@logistics.com', status: 'Contacted', assignedTo: uid, vehicleNo: 'GJ-01-YY-8822', city: 'Ahmedabad' },
    { clientName: 'Ankit Patel', clientPhone: '9876543212', clientEmail: 'ankit.patel@transporters.com', status: 'Qualified', assignedTo: uid, vehicleNo: 'GJ-01-ZZ-7733', city: 'Ahmedabad' },
    { clientName: 'Deepak Shah', clientPhone: '9876543213', clientEmail: 'deepak.shah@fleet.com', status: 'Proposal', assignedTo: uid, vehicleNo: 'GJ-01-AA-6644', city: 'Ahmedabad' },
    { clientName: 'Sanjay Joshi', clientPhone: '9876543214', clientEmail: 'sanjay.joshi@transco.com', status: 'Won', assignedTo: uid, vehicleNo: 'GJ-01-BB-5555', city: 'Ahmedabad' },
  ]
  const createdLeads = []
  for (const l of leads) {
    let lead = await prisma.lead.findFirst({ where: { vehicleNo: l.vehicleNo } })
    if (!lead) {
      lead = await prisma.lead.create({ data: l })
    }
    createdLeads.push(lead)
  }
  console.log('✓ 5 Leads')

  // 3. Workshop Tickets (rebranded from Claims)
  const claims = [
    { customerName: 'Rajesh Sharma', vehicleNumber: 'GJ-01-XX-9901', claimType: 'scheduled_service', claimAmount: 4500, status: 'filed', assignedTo: uid, leadId: createdLeads[0].id },
    { customerName: 'Priya Patel', vehicleNumber: 'GJ-01-YY-8822', claimType: 'warranty_claim', claimAmount: 12000, status: 'under_review', assignedTo: uid, leadId: createdLeads[1].id },
    { customerName: 'Ankit Patel', vehicleNumber: 'GJ-01-ZZ-7733', claimType: 'breakdown_repair', claimAmount: 7500, status: 'approved', approvedAmount: 7500, assignedTo: uid, leadId: createdLeads[2].id },
    { customerName: 'Deepak Shah', vehicleNumber: 'GJ-01-AA-6644', claimType: 'accident_repair', claimAmount: 32000, status: 'settled', approvedAmount: 30000, assignedTo: uid, leadId: createdLeads[3].id },
    { customerName: 'Sanjay Joshi', vehicleNumber: 'GJ-01-BB-5555', claimType: 'scheduled_service', claimAmount: 5800, status: 'approved', approvedAmount: 5800, assignedTo: uid, leadId: createdLeads[4].id },
    { customerName: 'Amit Patel', vehicleNumber: 'GJ-01-XX-1100', claimType: 'breakdown_repair', claimAmount: 9200, status: 'filed', assignedTo: uid, leadId: createdLeads[0].id }
  ]
  for (const c of claims) {
    const existing = await prisma.claim.findFirst({ where: { vehicleNumber: c.vehicleNumber, claimType: c.claimType } })
    if (!existing) await prisma.claim.create({ data: c })
  }
  console.log('✓ 6 Workshop Tickets')

  // 4. RTO Work (Kept for DB safety, formatted as commercial truck registration hubs)
  const rtoItems = [
    { customerName: 'Rajesh Sharma', vehicleNumber: 'GJ-01-XX-9901', workType: 'Registration', status: 'pending', rtoOffice: 'Ahmedabad East RTO (Vastral)', fees: 4500, assignedTo: uid, leadId: createdLeads[0].id },
    { customerName: 'Priya Patel', vehicleNumber: 'GJ-01-YY-8822', workType: 'Permit Renewal', status: 'in_progress', rtoOffice: 'Ahmedabad West RTO (Subhash Bridge)', fees: 6500, assignedTo: uid, leadId: createdLeads[1].id },
    { customerName: 'Ankit Patel', vehicleNumber: 'GJ-01-ZZ-7733', workType: 'NOC', status: 'completed', rtoOffice: 'Sanand RTO', fees: 2500, assignedTo: uid, leadId: createdLeads[2].id },
    { customerName: 'Deepak Shah', vehicleNumber: 'GJ-01-AA-6644', workType: 'Tax Payment', status: 'pending', rtoOffice: 'Ahmedabad East RTO (Vastral)', fees: 12000, assignedTo: uid, leadId: createdLeads[3].id },
    { customerName: 'Sanjay Joshi', vehicleNumber: 'GJ-01-BB-5555', workType: 'Fitness Certificate', status: 'completed', rtoOffice: 'Bavla RTO', fees: 3800, assignedTo: uid, leadId: createdLeads[4].id }
  ]
  for (const r of rtoItems) {
    const existing = await prisma.rTOWork.findFirst({ where: { vehicleNumber: r.vehicleNumber, workType: r.workType } })
    if (!existing) await prisma.rTOWork.create({ data: r })
  }
  console.log('✓ 5 RTO tasks')

  // 5. Fitness Work (Kept for DB safety, formatted as commercial transport fleet tests)
  const fitnessItems = [
    { customerName: 'Maruti Roadlines (Ahmedabad)', vehicleNumber: 'GJ-01-XX-1100', status: 'pending', fees: 3500, assignedTo: uid, leadId: createdLeads[0].id },
    { customerName: 'Ahmedabad Cargo Movers', vehicleNumber: 'GJ-01-YY-2200', status: 'passed', fees: 4000, assignedTo: uid, leadId: createdLeads[1].id },
    { customerName: 'Sabarmati Logistics', vehicleNumber: 'GJ-01-ZZ-3300', status: 'failed', fees: 3200, assignedTo: uid, leadId: createdLeads[2].id },
    { customerName: 'Gujarat Cargo Operator', vehicleNumber: 'GJ-01-AA-4400', status: 'passed', fees: 4200, assignedTo: uid, leadId: createdLeads[3].id },
    { customerName: 'Karnavati Road Carrier', vehicleNumber: 'GJ-01-BB-5500', status: 'pending', fees: 3900, assignedTo: uid, leadId: createdLeads[4].id }
  ]
  for (const f of fitnessItems) {
    const existing = await prisma.fitnessWork.findFirst({ where: { vehicleNumber: f.vehicleNumber } })
    if (!existing) await prisma.fitnessWork.create({ data: f })
  }
  console.log('✓ 5 Fitness tasks')

  // 6. Finance & Loans (Commercial Vehicle Financiers)
  const loanItems = [
    { customerName: 'Rajesh Sharma', loanType: 'Commercial Vehicle Finance', amount: 850000, tenureMonths: 48, interestRate: 9.5, status: 'applied', bankName: 'IndusInd Bank', assignedTo: uid, leadId: createdLeads[0].id },
    { customerName: 'Priya Patel', loanType: 'Commercial Vehicle Finance', amount: 1100000, tenureMonths: 36, interestRate: 9.2, status: 'approved', bankName: 'Cholamandalam Finance', assignedTo: uid, leadId: createdLeads[1].id },
    { customerName: 'Deepak Shah', loanType: 'Commercial Vehicle Finance', amount: 1500000, tenureMonths: 60, interestRate: 8.9, status: 'disbursed', bankName: 'Sundaram Finance', assignedTo: uid, leadId: createdLeads[3].id },
    { customerName: 'Ankit Patel', loanType: 'Commercial Vehicle Finance', amount: 720000, tenureMonths: 24, interestRate: 10.2, status: 'applied', bankName: 'Tata Capital', assignedTo: uid, leadId: createdLeads[2].id },
    { customerName: 'Sanjay Joshi', loanType: 'Commercial Vehicle Finance', amount: 2400000, tenureMonths: 60, interestRate: 8.8, status: 'approved', bankName: 'SBI Commercial', assignedTo: uid, leadId: createdLeads[4].id }
  ]
  for (const l of loanItems) {
    const existing = await prisma.loan.findFirst({ where: { customerName: l.customerName, loanType: l.loanType, amount: l.amount } })
    if (!existing) await prisma.loan.create({ data: l })
  }
  console.log('✓ 5 Loans')

  // 7. Finance / Transactions (Branded Commercial Dealership & Workshop receipts)
  const txns = [
    { type: 'income', category: 'Workshop Ticket Settlement', amount: 45000, description: 'Invoice payment for breakdown repair service', paymentMethod: 'UPI', status: 'completed', userId: uid },
    { type: 'income', category: 'Vehicle Sale Booking', amount: 100000, description: 'Booking amount for Ashok Leyland Bada Dost', paymentMethod: 'Bank Transfer', status: 'completed', userId: uid },
    { type: 'expense', category: 'Dealership Utilities', amount: 15000, description: 'Electricity and internet charges for Naroda Showroom', paymentMethod: 'Bank Transfer', status: 'completed', userId: uid },
    { type: 'income', category: 'Finance Commission', amount: 18500, description: 'Subsidized loan commission from Cholamandalam Finance', paymentMethod: 'UPI', status: 'completed', userId: uid },
    { type: 'expense', category: 'Staff Incentive', amount: 25000, description: 'Incentive payout for sales executives', paymentMethod: 'Bank Transfer', status: 'completed', userId: uid },
  ]
  for (const t of txns) {
    await prisma.transaction.create({ data: t })
  }
  console.log('✓ 5 Transactions')

  // 8. Visits (Commercial Truck Demos & Fleet Meetings)
  const visitItems = [
    { purpose: 'Commercial Vehicle Demo (Bada Dost i4)', scheduledAt: new Date(Date.now() + 86400000), status: 'scheduled', location: 'Naroda Showroom, Ahmedabad', userId: uid, leadId: createdLeads[0].id },
    { purpose: 'Service Ticket Handover & Delivery', scheduledAt: new Date(Date.now() - 86400000), status: 'completed', location: 'Sarkhej Workshop, Ahmedabad', userId: uid, leadId: createdLeads[1].id, distanceKm: 12.5 },
    { purpose: 'New Fleet Quotation Discussion', scheduledAt: new Date(), status: 'in_progress', location: 'Sanand GIDC, Ahmedabad', userId: uid, leadId: createdLeads[2].id },
    { purpose: 'Demo Drive for AVTR 2820', scheduledAt: new Date(Date.now() + 172800000), status: 'scheduled', location: 'Sarkhej Workshop, Ahmedabad', userId: uid, leadId: createdLeads[3].id },
    { purpose: 'AMC Maintenance Discussion Meeting', scheduledAt: new Date(Date.now() - 172800000), status: 'completed', location: 'SG Highway Showroom, Ahmedabad', userId: uid, leadId: createdLeads[4].id, distanceKm: 8.0 }
  ]
  for (const v of visitItems) {
    await prisma.visit.create({ data: v })
  }
  console.log('✓ 5 Visits')

  // 9. Quotations (Commercial Ashok Leyland Configurator details)
  const quoteItems = [
    { leadId: createdLeads[0].id, createdBy: uid, amount: 895000, status: 'Draft', details: { customer_name: 'Rajesh Sharma', vehicle_model: 'Ashok Leyland Bada Dost i4', dealership_location: 'Naroda Showroom', usage_type: 'Agricultural Transport' } },
    { leadId: createdLeads[1].id, createdBy: uid, amount: 785000, status: 'Sent', details: { customer_name: 'Priya Patel', vehicle_model: 'Ashok Leyland Dost LiTE', dealership_location: 'Sarkhej Workshop', usage_type: 'City Logistics' } },
    { leadId: createdLeads[4].id, createdBy: uid, amount: 2850000, status: 'Accepted', details: { customer_name: 'Sanjay Joshi', vehicle_model: 'Ashok Leyland AVTR 2820', dealership_location: 'SG Highway Showroom', usage_type: 'Bulk Goods Carrying' } },
    { leadId: createdLeads[2].id, createdBy: uid, amount: 825000, status: 'Draft', details: { customer_name: 'Ankit Patel', vehicle_model: 'Ashok Leyland Bada Dost i4 LS', dealership_location: 'Sanand Showroom', usage_type: 'E-commerce Delivery' } },
    { leadId: createdLeads[3].id, createdBy: uid, amount: 1250000, status: 'Sent', details: { customer_name: 'Deepak Shah', vehicle_model: 'Ashok Leyland Partner Super (14ft)', dealership_location: 'Naroda Showroom', usage_type: 'Industrial Logistics' } }
  ]
  for (const q of quoteItems) {
    await prisma.quotation.create({ data: q })
  }
  console.log('✓ 5 Quotations')

  console.log('\n✅ All sample data seeded successfully!')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
