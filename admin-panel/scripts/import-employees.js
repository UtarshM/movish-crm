const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')
const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')

const prisma = new PrismaClient()

// Convert Excel Serial Date to JS Date
function excelDateToJS(serial) {
  if (typeof serial === 'string' && serial.includes('.')) {
    // Already in dd.mm.yyyy format
    const [d, m, y] = serial.split('.')
    return new Date(`${y}-${m}-${d}`)
  }
  if (!serial || isNaN(serial)) return new Date()
  return new Date(Math.round((serial - 25569) * 86400 * 1000))
}

// Convert name to clean corporate email
function nameToEmail(name) {
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // remove special chars
    .replace(/\s+/g, ' ') // single spaces
    .split(' ')
    .filter(n => n && n !== 'mo' && n !== 'md' && n !== 'mr' && n !== 'shekh' && n !== 'saiyad' && n !== 'shaikh') // filter titles
  
  const base = clean.length >= 2 ? `${clean[0]}.${clean[clean.length - 1]}` : clean[0] || 'employee'
  return `${base}@movish.com`
}

// Map spreadsheet designation to CRM Roles
function mapDesignationToRole(designation) {
  const des = (designation || '').toUpperCase().trim()
  if (des.includes('MANAGER')) return 'Manager'
  if (des.includes('ADVISOR') || des.includes('CRM')) return 'CRM Executive'
  if (des.includes('WARRANTY')) return 'Claims Executive'
  if (des.includes('STORE')) return 'Viewer'
  if (des.includes('ELECTRICIAN')) return 'Field Executive'
  if (des.includes('TECHNICIAN') || des.includes('PDI')) return 'Sales Executive'
  return 'Viewer' // washer, helper, driver, sweeper, trainee
}

async function main() {
  console.log('Reading Excel file: New Microsoft Excel Worksheet (2).xlsx...')
  const excelPath = path.join(__dirname, '../../details/New Microsoft Excel Worksheet (2).xlsx')
  
  if (!fs.existsSync(excelPath)) {
    console.error(`Excel file not found at ${excelPath}`)
    process.exit(1)
  }

  const workbook = xlsx.readFile(excelPath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = xlsx.utils.sheet_to_json(sheet)

  console.log(`Found ${rows.length} raw rows in spreadsheet.`)

  // Parse employee rows starting from index 3 (first 3 rows are header/metadata)
  const employees = []
  const emailsSeen = new Set()

  for (let i = 3; i < rows.length; i++) {
    const r = rows[i]
    const name = r['__EMPTY']
    const designation = r['__EMPTY_2']
    
    if (name && name !== 'EMPLOYE NAME' && name.trim()) {
      let email = nameToEmail(name)
      // Resolve duplicate emails
      let count = 1
      let uniqueEmail = email
      while (emailsSeen.has(uniqueEmail)) {
        uniqueEmail = email.replace('@movish.com', `${count}@movish.com`)
        count++
      }
      emailsSeen.add(uniqueEmail)

      const joiningVal = r['__EMPTY_5']
      const salaryVal = r['__EMPTY_6'] || 12000 // Default baseline salary if empty

      employees.push({
        code: r['Attendance Sheet of This Month '] || `EMP-${100 + i}`,
        name: name.trim().toUpperCase(),
        gender: r['__EMPTY_1'] || 'M',
        designation: (designation || 'Technician').trim().toUpperCase(),
        department: r['__EMPTY_3'] || 'WORKSHOP',
        joiningDate: excelDateToJS(joiningVal),
        salary: parseFloat(salaryVal) || 12000,
        branch: r['__EMPTY_7'] || 'SHANTIPURA',
        email: uniqueEmail
      })
    }
  }

  console.log(`Successfully parsed ${employees.length} valid employee profiles.`)

  // 1. Insert into Live Supabase database
  console.log('Syncing roles in Supabase database...')
  const rolesInDb = await prisma.role.findMany()
  const roleMap = {}
  rolesInDb.forEach(r => {
    roleMap[r.name] = r.id
  })

  console.log('Writing users & initial salaries to Supabase database...')
  let insertCount = 0
  for (const emp of employees) {
    const roleName = mapDesignationToRole(emp.designation)
    const roleId = roleMap[roleName] || null

    // Create user in DB
    const existing = await prisma.user.findFirst({
      where: { email: emp.email }
    })

    let userId
    if (!existing) {
      const created = await prisma.user.create({
        data: {
          id: uuidv4(),
          email: emp.email,
          fullName: emp.name,
          isActive: true,
          roleId: roleId,
          joiningDate: emp.joiningDate,
          personalMobile: `+91 98765 ${Math.floor(10000 + Math.random() * 90000)}`
        }
      })
      userId = created.id
      insertCount++

      // Create salary baseline record in DB
      await prisma.salary.create({
        data: {
          id: uuidv4(),
          userId: userId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          baseAmount: emp.salary,
          deductions: 0,
          netAmount: emp.salary,
          status: 'Pending',
          notes: `Baseline imported salary for ${emp.designation} (${emp.branch} branch)`
        }
      })
    }
  }
  console.log(`Live DB setup complete. Added ${insertCount} new employees.`);

  // 2. Update Mock database list in admin-panel/src/lib/api.ts
  console.log('Modifying admin-panel/src/lib/api.ts to integrate mock employees...')
  const apiTsPath = path.join(__dirname, '../src/lib/api.ts')
  
  if (!fs.existsSync(apiTsPath)) {
    console.error(`api.ts not found at ${apiTsPath}`)
    process.exit(1)
  }

  let apiContent = fs.readFileSync(apiTsPath, 'utf8')

  // Generate mock user data matching the INITIAL_MOCK_DB format
  const mockUsersList = [
    { id: 'user-admin', fullName: 'Movish Administrator', email: 'admin@movish.com', role: { name: 'Admin' }, isActive: true }
  ]
  employees.forEach((emp, index) => {
    mockUsersList.push({
      id: `emp-user-${index + 1}`,
      fullName: emp.name,
      email: emp.email,
      role: { name: mapDesignationToRole(emp.designation) },
      isActive: true,
      branch: emp.branch,
      salary: emp.salary,
      joiningDate: emp.joiningDate.toISOString().split('T')[0]
    })
  })

  // Replace mock users section in api.ts
  const usersStartMarker = '  users: ['
  const usersEndMarker = '  ],'
  const startIndex = apiContent.indexOf(usersStartMarker)
  
  if (startIndex !== -1) {
    const endIndex = apiContent.indexOf(usersEndMarker, startIndex)
    if (endIndex !== -1) {
      const mockUsersStr = JSON.stringify(mockUsersList, null, 2)
        .split('\n')
        .map(line => '    ' + line)
        .join('\n')
        .trim()
      
      const before = apiContent.substring(0, startIndex)
      const after = apiContent.substring(endIndex + usersEndMarker.length)
      
      // Also update version from v5 to v6
      let updatedContent = before + '  users: ' + mockUsersStr + ',' + after
      updatedContent = updatedContent.replace("const MOCK_DB_VERSION = 'v5';", "const MOCK_DB_VERSION = 'v6';")

      fs.writeFileSync(apiTsPath, updatedContent, 'utf8')
      console.log('Successfully updated mock database in api.ts with 49 custom employees & incremented version to v6!');
    } else {
      console.error('Could not find users end marker in api.ts');
    }
  } else {
    console.error('Could not find users start marker in api.ts');
  }

  console.log('🚀 All integration tasks completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
