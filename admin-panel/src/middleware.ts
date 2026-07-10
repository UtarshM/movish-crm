import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'
  
  // 1. Handle Preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // 2. Intercept Mock Mode requests and bypass server endpoints / database checks
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer mock-token-')) {
    const url = new URL(request.url)
    const pathname = url.pathname
    
    let responseData: any = { success: true }
    
    if (pathname.startsWith('/api/v1/dashboard/stats')) {
      responseData = {
        view: 'admin',
        total_leads: 5,
        new_leads_today: 3,
        total_employees: 4,
        active_claims: 2,
        active_loans: 2,
        today_visits: 5,
        // Mobile compatible keys
        leads: 5,
        revenue: '28,45,000',
        pending: 2,
        claims: 2
      }
    } else if (pathname.startsWith('/api/v1/notifications')) {
      responseData = {
        notifications: [
          {
            id: 'n1',
            title: 'Workshop QC pending on GJ-01-XX-2920',
            type: 'alert',
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            read: false
          },
          {
            id: 'n2',
            title: 'Follow-up due: Patel Earthmovers in 30 min',
            type: 'reminder',
            createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
            read: false
          },
          {
            id: 'n3',
            title: 'Estimate approved by Mehta Transports',
            type: 'system',
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            read: true
          },
          {
            id: 'n4',
            title: 'New loan application: Gujarat Agro Distributors',
            type: 'alert',
            createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
            read: true
          },
          {
            id: 'n5',
            title: 'Vehicle GJ-27-AT-9876 service overdue by 2,000 km',
            type: 'reminder',
            createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
            read: true
          }
        ]
      }
    } else if (pathname === '/api/v1/leads/stats') {
      responseData = {
        summary: {
          total: 5,
          assigned: 5,
          converted: 1,
          followups: 2
        }
      }
    } else if (pathname.startsWith('/api/v1/leads/')) {
      const leadId = pathname.substring('/api/v1/leads/'.length)
      const mockLeads = [
        {
          id: 'lead-1',
          clientName: 'Ahmedabad Logistics Pvt Ltd (Mr. Patel)',
          clientPhone: '9898012345',
          clientEmail: 'purchase@ahmedabadlogistics.com',
          vehicleNo: 'Ashok Leyland AVTR 2820 (Tippers)',
          status: 'Qualified',
          createdAt: '2026-05-20T10:00:00.000Z',
          assignee: { fullName: 'Rajesh Sharma' },
          city: 'Ahmedabad',
          existingAgent: 'Rajesh Sharma',
          gvw: '28 Tons',
          policies: [
            {
              id: 'policy-1',
              policyNumber: 'POL-AL-2026-0812',
              provider: 'ICICI Lombard',
              type: 'Comprehensive Commercial',
              endDate: '2027-05-19T23:59:59.000Z'
            }
          ],
          claims: [
            {
              id: 'ticket-1',
              customerName: 'Ahmedabad Logistics Pvt Ltd',
              vehicleNumber: 'GJ-01-XX-1122',
              claimType: 'Engine Repair (Warranty)',
              claimAmount: 45000,
              status: 'approved',
              createdAt: '2026-05-18T10:00:00.000Z'
            }
          ],
          followUps: [
            {
              id: 'followup-1',
              leadName: 'Ahmedabad Logistics Pvt Ltd',
              type: 'call',
              notes: 'Discuss AVTR 2820 pricing breakdown',
              scheduledAt: '2026-05-23T10:00:00.000Z',
              status: 'pending'
            }
          ],
          quotations: []
        },
        {
          id: 'lead-2',
          clientName: 'Patel Earthmovers (Mr. Rajesh Patel)',
          clientPhone: '9924098765',
          clientEmail: 'rajesh@patelearth.com',
          vehicleNo: 'Ashok Leyland Bada Dost i4 LS',
          status: 'Proposal',
          createdAt: '2026-05-21T08:30:00.000Z',
          assignee: { fullName: 'Amit Patel' },
          city: 'Ahmedabad',
          existingAgent: 'Amit Patel',
          gvw: '3.49 Tons',
          policies: [
            {
              id: 'policy-2',
              policyNumber: 'POL-AL-2026-0941',
              provider: 'HDFC ERGO',
              type: 'Third Party + Damage',
              endDate: '2027-05-20T23:59:59.000Z'
            }
          ],
          claims: [],
          followUps: [],
          quotations: []
        },
        {
          id: 'lead-3',
          clientName: 'Mehta Transports (Mr. Sanjay Mehta)',
          clientPhone: '9825045678',
          clientEmail: 'sanjay@mehtatrans.in',
          vehicleNo: 'Ashok Leyland Dost LiTE',
          status: 'Negotiation',
          createdAt: '2026-05-19T14:15:00.000Z',
          assignee: { fullName: 'Rajesh Sharma' },
          city: 'Ahmedabad',
          existingAgent: 'Rajesh Sharma',
          gvw: '2.59 Tons',
          policies: [],
          claims: [],
          followUps: [],
          quotations: []
        },
        {
          id: 'lead-4',
          clientName: 'Gujarat Agro Distributors',
          clientPhone: '9426011223',
          clientEmail: 'info@gujagro.com',
          vehicleNo: 'Ashok Leyland Partner Super (14ft)',
          status: 'Won',
          createdAt: '2026-05-15T11:00:00.000Z',
          assignee: { fullName: 'Amit Patel' },
          city: 'Ahmedabad',
          existingAgent: 'Amit Patel',
          gvw: '7.2 Tons',
          policies: [],
          claims: [],
          followUps: [],
          quotations: []
        },
        {
          id: 'lead-5',
          clientName: 'Karnavati Builders (Mr. Harsh Shah)',
          clientPhone: '7016055443',
          clientEmail: 'contact@karnavatibuilders.com',
          vehicleNo: 'Ashok Leyland Ecomet Star 1115',
          status: 'New',
          createdAt: '2026-05-22T09:15:00.000Z',
          assignee: { fullName: 'Rajesh Sharma' },
          city: 'Ahmedabad',
          existingAgent: 'Rajesh Sharma',
          gvw: '11 Tons',
          policies: [],
          claims: [],
          followUps: [],
          quotations: []
        }
      ]
      responseData = mockLeads.find(l => l.id === leadId) || mockLeads[0]
    } else if (pathname === '/api/v1/leads') {
      responseData = {
        leads: [
          {
            id: 'lead-1',
            clientName: 'Ahmedabad Logistics Pvt Ltd (Mr. Patel)',
            clientPhone: '9898012345',
            clientEmail: 'purchase@ahmedabadlogistics.com',
            vehicleNo: 'Ashok Leyland AVTR 2820 (Tippers)',
            status: 'Qualified',
            createdAt: '2026-05-20T10:00:00.000Z',
            assignee: { fullName: 'Rajesh Sharma' }
          },
          {
            id: 'lead-2',
            clientName: 'Patel Earthmovers (Mr. Rajesh Patel)',
            clientPhone: '9924098765',
            clientEmail: 'rajesh@patelearth.com',
            vehicleNo: 'Ashok Leyland Bada Dost i4 LS',
            status: 'Proposal',
            createdAt: '2026-05-21T08:30:00.000Z',
            assignee: { fullName: 'Amit Patel' }
          },
          {
            id: 'lead-3',
            clientName: 'Mehta Transports (Mr. Sanjay Mehta)',
            clientPhone: '9825045678',
            clientEmail: 'sanjay@mehtatrans.in',
            vehicleNo: 'Ashok Leyland Dost LiTE',
            status: 'Negotiation',
            createdAt: '2026-05-19T14:15:00.000Z',
            assignee: { fullName: 'Rajesh Sharma' }
          },
          {
            id: 'lead-4',
            clientName: 'Gujarat Agro Distributors',
            clientPhone: '9426011223',
            clientEmail: 'info@gujagro.com',
            vehicleNo: 'Ashok Leyland Partner Super (14ft)',
            status: 'Won',
            createdAt: '2026-05-15T11:00:00.000Z',
            assignee: { fullName: 'Amit Patel' }
          },
          {
            id: 'lead-5',
            clientName: 'Karnavati Builders (Mr. Harsh Shah)',
            clientPhone: '7016055443',
            clientEmail: 'contact@karnavatibuilders.com',
            vehicleNo: 'Ashok Leyland Ecomet Star 1115',
            status: 'New',
            createdAt: '2026-05-22T09:15:00.000Z',
            assignee: { fullName: 'Rajesh Sharma' }
          }
        ]
      }
    } else if (pathname.startsWith('/api/v1/crm')) {
      responseData = [
        {
          id: 'client-1',
          name: 'Ahmedabad Logistics Pvt Ltd',
          phone: '9898012345',
          email: 'purchase@ahmedabadlogistics.com',
          address: 'Sarkhej-Gandhinagar Highway, Ahmedabad',
          kycStatus: 'completed',
          policyCount: 3,
          leadId: 'lead-1'
        },
        {
          id: 'client-2',
          name: 'Patel Earthmovers',
          phone: '9924098765',
          email: 'rajesh@patelearth.com',
          address: 'Naroda Industrial Estate, Ahmedabad',
          kycStatus: 'completed',
          policyCount: 1,
          leadId: 'lead-2'
        },
        {
          id: 'client-3',
          name: 'Mehta Transports',
          phone: '9825045678',
          email: 'sanjay@mehtatrans.in',
          address: 'Aslali bypass, Ahmedabad',
          kycStatus: 'pending',
          policyCount: 2,
          leadId: 'lead-3'
        }
      ]
    } else if (pathname.startsWith('/api/v1/claims')) {
      responseData = [
        {
          id: 'ticket-1',
          customerName: 'Ahmedabad Logistics Pvt Ltd',
          vehicleNumber: 'GJ-01-XX-1122',
          claimType: 'Engine Repair (Warranty)',
          claimAmount: 45000,
          status: 'approved',
          createdAt: '2026-05-18T10:00:00.000Z'
        },
        {
          id: 'ticket-2',
          customerName: 'Mehta Transports',
          vehicleNumber: 'GJ-01-XX-3344',
          claimType: 'Body Painting (Accident)',
          claimAmount: 75000,
          status: 'under_review',
          createdAt: '2026-05-19T14:30:00.000Z'
        }
      ]
    } else if (pathname.startsWith('/api/v1/finance/loans')) {
      responseData = [
        {
          id: 'loan-1',
          customerName: 'Gujarat Agro Distributors',
          loanType: 'Commercial Vehicle Loan (SBI)',
          amount: 1850000,
          conversionStatus: 'Approved',
          createdAt: '2026-05-16T11:00:00.000Z'
        },
        {
          id: 'loan-2',
          customerName: 'Patel Earthmovers',
          loanType: 'Chassis & Body Funding (HDFC)',
          amount: 2400000,
          conversionStatus: 'Processing',
          createdAt: '2026-05-21T08:30:00.000Z'
        }
      ]
    } else if (pathname.startsWith('/api/v1/follow-ups')) {
      responseData = [
        {
          id: 'followup-1',
          leadName: 'Ahmedabad Logistics Pvt Ltd',
          type: 'call',
          notes: 'Discuss AVTR 2820 pricing breakdown',
          scheduledAt: '2026-05-23T10:00:00.000Z',
          status: 'pending'
        },
        {
          id: 'followup-2',
          leadName: 'Patel Earthmovers',
          type: 'visit',
          notes: 'Bada Dost test drive at client site',
          scheduledAt: '2026-05-24T14:00:00.000Z',
          status: 'pending'
        }
      ]
    } else if (pathname.startsWith('/api/v1/workshop')) {
      responseData = [
        {
          id: 'JC-2026-7841',
          customerName: 'Mehta Transports',
          vehicleModel: 'Ashok Leyland Dost LiTE',
          vehicleNumber: 'GJ-01-XX-3344',
          chassisNumber: 'MBLD234567890',
          odometerReading: 12500,
          driverComplaints: 'Low mileage, engine noise check',
          warrantyStatus: 'In Warranty',
          amcStatus: 'No AMC',
          stage: 3,
          status: 'in-progress',
          createdAt: '2026-05-22T08:00:00.000Z'
        }
      ]
    }
    
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
      }
    })
  }

  // 3. Add CORS headers to all other requests
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
