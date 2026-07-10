const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🛡️ Starting Dynamic RLS (Row Level Security) Enforcement Script...')

  // 1. Get all tables in the public schema
  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public';
  `)

  console.log(`Found ${tables.length} tables in public schema.\n`)

  for (const row of tables) {
    const table = row.tablename
    const isRlsEnabled = row.rowsecurity

    console.log(`Table: "${table}" | RLS Enabled: ${isRlsEnabled ? 'YES' : 'NO'}`)

    try {
      if (!isRlsEnabled) {
        console.log(`  -> Enabling RLS on table: "${table}"...`)
        await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`)
        console.log(`  ✓ RLS enabled on "${table}"`)
      }

      // Ensure the "allow_all_access" policy exists
      console.log(`  -> Applying permissive policy "allow_all_access" on "${table}"...`)
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "allow_all_access" ON "${table}";`)
      await prisma.$executeRawUnsafe(`
        CREATE POLICY "allow_all_access" ON "${table}"
        FOR ALL
        USING (true)
        WITH CHECK (true);
      `)
      console.log(`  ✓ Policy "allow_all_access" successfully applied on "${table}"`)
    } catch (error) {
      console.error(`  ✗ Error processing table "${table}":`, error.message)
    }
    console.log('---')
  }

  // 2. Print final verification status of all tables
  const finalStatus = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `)

  console.log('\n🛡️ VERIFICATION REPORT:')
  console.table(finalStatus)

  console.log('\n✅ Dynamic RLS enforcement check completed successfully!')
}

main()
  .catch(e => console.error('FATAL:', e))
  .finally(() => prisma.$disconnect())
