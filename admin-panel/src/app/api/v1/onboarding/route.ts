import { validateAuth } from '@/lib/auth-guard'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  // Public endpoint for new employee registration

  try {
    const body = await req.json()
    const { 
      fullName, email, password,
      highestQualification, dateOfBirth, joiningDate, personalMobile, homeMobile,
      documents // Array of { type: string, url: string }
    } = body

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'fullName, email, and password are required' }, { status: 400 })
    }

    // 1. Create user in Supabase Auth (with admin fallback for standard sign up if service role key is missing)
    let authData: any = null
    let authError: any = null

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const res = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      })
      authData = res.data
      authError = res.error
    } else {
      console.log('[onboarding] Missing SUPABASE_SERVICE_ROLE_KEY, falling back to standard signUp');
      const res = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })
      authData = res.data
      authError = res.error
    }

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData || !authData.user) {
      return NextResponse.json({ error: 'Failed to create user in authentication system' }, { status: 400 })
    }

    // 2. Create user in Prisma DB (marked as inactive until admin approval)
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        fullName,
        isActive: false, // Wait for admin approval
        highestQualification,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        personalMobile,
        homeMobile,
        documents: documents?.length ? {
          create: documents.map((doc: any) => ({
            entityType: 'User',
            fileName: doc.type,
            filePath: doc.url
          }))
        } : undefined
      }
    })

    return NextResponse.json({
      message: 'Onboarding application submitted. Please wait for admin approval.',
      userId: user.id
    })
  } catch (error: any) {
    console.error('Onboarding POST Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
