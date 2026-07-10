import { supabase } from './supabase'

// Initial Premium Mock Database representing Movish Auto (Ashok Leyland Ahmedabad Dealer)
const INITIAL_MOCK_DB = {
  leads: [
    {
      id: "lead-1",
      clientName: "Ahmedabad Logistics Pvt Ltd (Mr. Patel)",
      clientPhone: "9898012345",
      clientEmail: "purchase@ahmedabadlogistics.com",
      vehicleNo: "Ashok Leyland AVTR 2820 (Tippers)",
      status: "Qualified",
      createdAt: "2026-05-20T10:00:00.000Z",
      assignee: { fullName: "Rajesh Sharma" }
    },
    {
      id: "lead-2",
      clientName: "Patel Earthmovers (Mr. Rajesh Patel)",
      clientPhone: "9924098765",
      clientEmail: "rajesh@patelearth.com",
      vehicleNo: "Ashok Leyland Bada Dost i4 LS",
      status: "Proposal",
      createdAt: "2026-05-21T08:30:00.000Z",
      assignee: { fullName: "Amit Patel" }
    },
    {
      id: "lead-3",
      clientName: "Mehta Transports (Mr. Sanjay Mehta)",
      clientPhone: "9825045678",
      clientEmail: "sanjay@mehtatrans.in",
      vehicleNo: "Ashok Leyland Dost LiTE",
      status: "Negotiation",
      createdAt: "2026-05-19T14:15:00.000Z",
      assignee: { fullName: "Rajesh Sharma" }
    },
    {
      id: "lead-4",
      clientName: "Gujarat Agro Distributors",
      clientPhone: "9426011223",
      clientEmail: "info@gujagro.com",
      vehicleNo: "Ashok Leyland Partner Super (14ft)",
      status: "Won",
      createdAt: "2026-05-15T11:00:00.000Z",
      assignee: { fullName: "Amit Patel" }
    },
    {
      id: "lead-5",
      clientName: "Karnavati Builders (Mr. Harsh Shah)",
      clientPhone: "7016055443",
      clientEmail: "contact@karnavatibuilders.com",
      vehicleNo: "Ashok Leyland Ecomet Star 1615",
      status: "New",
      createdAt: "2026-05-21T11:45:00.000Z",
      assignee: { fullName: "Rajesh Sharma" }
    }
  ],
  crm: [
    {
      id: "client-1",
      name: "Ahmedabad Logistics Pvt Ltd (Mr. Patel)",
      phone: "9898012345",
      email: "purchase@ahmedabadlogistics.com",
      address: "402, Sarkhej-Gandhinagar Highway, Ahmedabad",
      kycStatus: "verified",
      policyCount: 0,
      leadId: "lead-1"
    },
    {
      id: "client-2",
      name: "Patel Earthmovers (Mr. Rajesh Patel)",
      phone: "9924098765",
      email: "rajesh@patelearth.com",
      address: "G-15, Naroda GIDC, Ahmedabad",
      kycStatus: "verified",
      policyCount: 0,
      leadId: "lead-2"
    },
    {
      id: "client-3",
      name: "Mehta Transports (Mr. Sanjay Mehta)",
      phone: "9825045678",
      email: "sanjay@mehtatrans.in",
      address: "12, Sanand GIDC Phase 2, Ahmedabad",
      kycStatus: "pending",
      policyCount: 0,
      leadId: "lead-3"
    }
  ],
  claims: [
    {
      id: "ticket-1",
      customerName: "Ahmedabad Logistics Pvt Ltd",
      vehicleNumber: "GJ-01-CU-4321",
      claimType: "Scheduled Service",
      claimAmount: 15500,
      status: "pending",
      createdAt: "2026-05-21T09:30:00.000Z"
    },
    {
      id: "ticket-2",
      customerName: "Mehta Transports",
      vehicleNumber: "GJ-27-AT-9876",
      claimType: "Engine Breakdown",
      claimAmount: 45000,
      status: "completed",
      createdAt: "2026-05-20T14:00:00.000Z"
    },
    {
      id: "ticket-3",
      customerName: "Patel Earthmovers",
      vehicleNumber: "GJ-01-CV-7890",
      claimType: "Accident Repair",
      claimAmount: 125000,
      status: "pending",
      createdAt: "2026-05-21T11:00:00.000Z"
    }
  ],
  loans: [
    {
      id: "loan-1",
      customerName: "Ahmedabad Logistics Pvt Ltd",
      loanType: "Full Vehicle Loan",
      amount: 2450000,
      conversionStatus: "Approved",
      createdAt: "2026-05-20T11:00:00.000Z"
    },
    {
      id: "loan-2",
      customerName: "Patel Earthmovers",
      loanType: "Chassis Funding",
      amount: 750000,
      conversionStatus: "Processing",
      createdAt: "2026-05-21T10:00:00.000Z"
    },
    {
      id: "loan-3",
      customerName: "Mehta Transports",
      loanType: "Body Funding",
      amount: 420000,
      conversionStatus: "Applied",
      createdAt: "2026-05-21T12:00:00.000Z"
    }
  ],
  quotations: [
    {
      id: "quote-1",
      amount: 2845000,
      status: "Approved",
      details: { "chassis": "AVTR 2820 Tipper Chassis", "cabin": "M-Cabin AC", "body": "16 Cum Box Body" },
      createdAt: "2026-05-20T12:00:00.000Z",
      lead: {
        clientName: "Ahmedabad Logistics Pvt Ltd",
        vehicleNo: "AVTR 2820 Tipper"
      }
    },
    {
      id: "quote-2",
      amount: 825000,
      status: "Draft",
      details: { "chassis": "Bada Dost i4 LS Chassis", "cabin": "Day Cabin", "body": "High Deck Cargo Body" },
      createdAt: "2026-05-21T09:00:00.000Z",
      lead: {
        clientName: "Patel Earthmovers",
        vehicleNo: "Bada Dost i4"
      }
    }
  ],
  followups: [
    {
      id: "followup-1",
      leadName: "Ahmedabad Logistics Pvt Ltd",
      type: "call",
      notes: "Discuss AVTR 2820 body customization details and bulk discount.",
      scheduledAt: "2026-05-22T10:00:00.000Z",
      status: "pending"
    },
    {
      id: "followup-2",
      leadName: "Patel Earthmovers",
      type: "visit",
      notes: "Physical visit to Naroda GIDC site for Bada Dost demo drive.",
      scheduledAt: "2026-05-22T15:30:00.000Z",
      status: "pending"
    }
  ],
  policies: [
    {
      id: "policy-1",
      leadId: "lead-1",
      customerName: "Ahmedabad Logistics",
      policyNumber: "POL-AL-2026-0812",
      provider: "ICICI Lombard",
      type: "Comprehensive Commercial",
      premiumAmount: 85000,
      status: "Active",
      startDate: "2026-05-20T00:00:00.000Z",
      endDate: "2027-05-19T23:59:59.000Z"
    },
    {
      id: "policy-2",
      leadId: "lead-2",
      customerName: "Patel Earthmovers",
      policyNumber: "POL-AL-2026-0941",
      provider: "HDFC ERGO",
      type: "Third Party + Damage",
      premiumAmount: 24000,
      status: "Active",
      startDate: "2026-05-21T00:00:00.000Z",
      endDate: "2027-05-20T23:59:59.000Z"
    },
    {
      id: "policy-3",
      leadId: "lead-3",
      customerName: "Mehta Transports",
      policyNumber: "POL-AL-2026-0315",
      provider: "Cholamandalam MS",
      type: "Comprehensive Commercial",
      premiumAmount: 62000,
      status: "Active",
      startDate: "2026-05-19T00:00:00.000Z",
      endDate: "2027-05-18T23:59:59.000Z"
    }
  ],
  responses: [
    { "id": "resp-1", "text": "Thank you for visiting Movish Auto. Your quotation for Ashok Leyland Bada Dost is being prepared.", "isActive": true },
    { "id": "resp-2", "text": "Your commercial vehicle loan application has been submitted to HDFC Bank. Track status on your Movish portal.", "isActive": true }
  ],
  users: [
    { "id": "user-1", "fullName": "Rajesh Sharma", "email": "rajesh@movish.com", "role": { "name": "Manager" }, "isActive": true },
    { "id": "user-2", "fullName": "Amit Patel", "email": "amit@movish.com", "role": { "name": "Executive" }, "isActive": true }
  ],
  roles: [
    { "id": "role-1", "name": "Admin", "description": "System Administrator — full access to all modules", "permissions": [], "_count": { "users": 1 } },
    { "id": "role-2", "name": "Sales Manager", "description": "Manages sales team, leads pipeline and quotations", "permissions": [], "_count": { "users": 2 } },
    { "id": "role-3", "name": "Service Executive", "description": "Handles workshop job cards and service operations", "permissions": [], "_count": { "users": 3 } },
    { "id": "role-4", "name": "Finance Officer", "description": "Manages loans, disbursements and financial reports", "permissions": [], "_count": { "users": 1 } },
    { "id": "role-5", "name": "CRM Agent", "description": "Customer relationship management and follow-ups", "permissions": [], "_count": { "users": 2 } }
  ],
  permissions: [
    { "id": "perm-1", "name": "dashboard.view" },
    { "id": "perm-2", "name": "dashboard.export" },
    { "id": "perm-3", "name": "lead.view" },
    { "id": "perm-4", "name": "lead.create" },
    { "id": "perm-5", "name": "lead.edit" },
    { "id": "perm-6", "name": "lead.delete" },
    { "id": "perm-7", "name": "lead.import" },
    { "id": "perm-8", "name": "crm.view" },
    { "id": "perm-9", "name": "crm.create" },
    { "id": "perm-10", "name": "crm.edit" },
    { "id": "perm-11", "name": "quotation.view" },
    { "id": "perm-12", "name": "quotation.create" },
    { "id": "perm-13", "name": "quotation.approve" },
    { "id": "perm-14", "name": "quotation.share" },
    { "id": "perm-15", "name": "visit.view" },
    { "id": "perm-16", "name": "visit.schedule" },
    { "id": "perm-17", "name": "visit.complete" },
    { "id": "perm-18", "name": "fitness.view" },
    { "id": "perm-19", "name": "fitness.create" },
    { "id": "perm-20", "name": "loan.view" },
    { "id": "perm-21", "name": "loan.create" },
    { "id": "perm-22", "name": "loan.approve" },
    { "id": "perm-23", "name": "loan.disburse" },
    { "id": "perm-24", "name": "accounts.view" },
    { "id": "perm-25", "name": "accounts.create" },
    { "id": "perm-26", "name": "accounts.export" },
    { "id": "perm-27", "name": "hr.view" },
    { "id": "perm-28", "name": "hr.create" },
    { "id": "perm-29", "name": "hr.edit" },
    { "id": "perm-30", "name": "role.view" },
    { "id": "perm-31", "name": "role.create" },
    { "id": "perm-32", "name": "role.edit" },
    { "id": "perm-33", "name": "role.delete" },
    { "id": "perm-34", "name": "system.settings" },
    { "id": "perm-35", "name": "system.audit_log" },
    { "id": "perm-36", "name": "notification.view" },
    { "id": "perm-37", "name": "notification.manage" },
    { "id": "perm-38", "name": "template.view" },
    { "id": "perm-39", "name": "template.create" },
    { "id": "perm-40", "name": "data.export" },
    { "id": "perm-41", "name": "data.import" },
    { "id": "perm-42", "name": "data.delete" },
    { "id": "perm-43", "name": "claims.view" },
    { "id": "perm-44", "name": "claims.create" },
    { "id": "perm-45", "name": "claims.approve" },
    { "id": "perm-46", "name": "rto.view" },
    { "id": "perm-47", "name": "rto.create" },
    { "id": "perm-48", "name": "vahan.view" },
    { "id": "perm-49", "name": "vahan.create" },
    { "id": "perm-50", "name": "rate.view" }
  ],
  rolePermissions: {
    "role-1": ["perm-1","perm-2","perm-3","perm-4","perm-5","perm-6","perm-7","perm-8","perm-9","perm-10","perm-11","perm-12","perm-13","perm-14","perm-15","perm-16","perm-17","perm-18","perm-19","perm-20","perm-21","perm-22","perm-23","perm-24","perm-25","perm-26","perm-27","perm-28","perm-29","perm-30","perm-31","perm-32","perm-33","perm-34","perm-35","perm-36","perm-37","perm-38","perm-39","perm-40","perm-41","perm-42","perm-43","perm-44","perm-45","perm-46","perm-47","perm-48","perm-49","perm-50"],
    "role-2": ["perm-1","perm-3","perm-4","perm-5","perm-7","perm-8","perm-9","perm-10","perm-11","perm-12","perm-13","perm-14","perm-15","perm-16","perm-17","perm-36"],
    "role-3": ["perm-1","perm-3","perm-8","perm-15","perm-16","perm-17","perm-18","perm-19","perm-43","perm-44","perm-36"],
    "role-4": ["perm-1","perm-20","perm-21","perm-22","perm-23","perm-24","perm-25","perm-26","perm-36"],
    "role-5": ["perm-1","perm-3","perm-8","perm-9","perm-10","perm-11","perm-12","perm-14","perm-15","perm-16","perm-36"]
  },
  transactions: [
    {
      "id": "tx-1",
      "type": "income",
      "category": "Vehicle Sale",
      "amount": 2845000,
      "status": "completed",
      "paymentMethod": "Bank Transfer",
      "referenceNumber": "NEFT-AXIS-99221",
      "description": "Down payment for Ashok Leyland AVTR 2820 Tipper - Ahmedabad Logistics",
      "date": "2026-05-20"
    },
    {
      "id": "tx-2",
      "type": "income",
      "category": "Service Fee",
      "amount": 15500,
      "status": "completed",
      "paymentMethod": "UPI",
      "referenceNumber": "UPI-PAYTM-77165",
      "description": "Scheduled service charge - GJ-01-CU-4321",
      "date": "2026-05-21"
    },
    {
      "id": "tx-3",
      "type": "expense",
      "category": "Spare Parts",
      "amount": 42000,
      "status": "completed",
      "paymentMethod": "Credit Card",
      "referenceNumber": "TXN-HDFC-9938",
      "description": "Stock procurement for Ashok Leyland Dost engine filters & brake pads",
      "date": "2026-05-18"
    }
  ],
  partsInventory: [
    { "id": "part-1", "name": "Engine Oil (15W-40 CI4 Plus)", "price": 450, "unit": "L" },
    { "id": "part-2", "name": "Oil Filter Element", "price": 850, "unit": "Pc" },
    { "id": "part-3", "name": "Fuel Filter (Primary)", "price": 1200, "unit": "Pc" },
    { "id": "part-4", "name": "Fuel Filter (Secondary)", "price": 1450, "unit": "Pc" },
    { "id": "part-5", "name": "Air Filter Element Set", "price": 3800, "unit": "Set" },
    { "id": "part-6", "name": "Coolant (Ready to Use)", "price": 250, "unit": "L" },
    { "id": "part-7", "name": "Brake Fluid (DOT 4)", "price": 350, "unit": "Can" },
    { "id": "part-8", "name": "Chassis Grease (Lithium Base)", "price": 380, "unit": "Kg" },
    { "id": "part-9", "name": "Clutch Booster Valve Assembly", "price": 4500, "unit": "Pc" },
    { "id": "part-10", "name": "U-Bolt (Heavy Duty)", "price": 750, "unit": "Pc" },
    { "id": "part-11", "name": "Leaf Spring Bushing", "price": 320, "unit": "Pc" },
    { "id": "part-12", "name": "Brake Lining Set (Rear)", "price": 2800, "unit": "Set" }
  ],
  workshopJobCards: [
    {
      "id": "JC-2026-0001",
      "customerName": "Ahmedabad Logistics Pvt Ltd",
      "vehicleModel": "Ashok Leyland AVTR 2820 Tipper",
      "vehicleNumber": "GJ-01-XX-2920",
      "chassisNumber": "MBL42F8C9G100234",
      "odometerReading": 84500,
      "driverComplaints": "Low engine pickup, excessive dark exhaust smoke and periodic maintenance check",
      "warrantyStatus": "Out of Warranty",
      "amcStatus": "AMC Covered",
      "stage": 1,
      "status": "in-progress",
      "createdAt": "2026-05-22T08:00:00.000Z",
      "documents": {
        "jobCardCreated": true,
        "estimateApproved": false,
        "gateEntryCreated": true
      },
      "generalInspection": {
        "engineCondition": false,
        "oilLeakage": false,
        "coolantLevel": false,
        "batteryCondition": false,
        "tyreWear": false,
        "brakeCondition": false,
        "suspensionCheck": false
      },
      "driverComplaintsDiagnosis": {
        "lowPickup": true,
        "excessSmoke": true,
        "brakeHard": false,
        "clutchSlipping": false,
        "steeringVibration": false
      },
      "serviceSchedule": {
        "interval": "80,000 km",
        "category": "Paid Service"
      },
      "operationsPerformed": {
        "engineOilReplaced": false,
        "oilFilterReplaced": false,
        "fuelFilterServiced": false,
        "airFilterServiced": false,
        "beltTensionChecked": false,
        "gearOilChecked": false,
        "clutchAdjusted": false,
        "brakeLiningInspected": false,
        "airLeakageTested": false,
        "brakeChamberInspected": false,
        "batteryVoltageTested": false,
        "alternatorChecked": false,
        "lightingInspected": false,
        "greasePointsLubricated": false,
        "uBoltTightened": false,
        "leafSpringInspected": false,
        "radiatorCleaned": false,
        "coolantToppedUp": false
      },
      "washingGreasing": {
        "pressureWash": false,
        "chassisGreasing": false,
        "propellerShaftGreasing": false,
        "kingpinLubrication": false
      },
      "partsIssued": [],
      "technicians": {
        "mechanic": "Suresh Kumar",
        "electrician": "Manoj Dev",
        "washingCrew": "Washing Team A",
        "roadTestDriver": "Vikram Singh",
        "laborHours": 0,
        "laborCost": 0
      },
      "qualityCheck": {
        "torqueChecks": false,
        "leakageInspection": false,
        "testDrive": false,
        "brakeTest": false,
        "smokeCheck": false,
        "signedOffBy": ""
      },
      "billing": {
        "partsTotal": 0,
        "laborTotal": 0,
        "gstAmount": 0,
        "totalAmount": 0,
        "invoiceNumber": "",
        "isWarrantyClaim": false
      },
      "delivery": {
        "workExplained": false,
        "nextServiceDueOdo": 92000,
        "customerSignature": "",
        "feedbackRating": 0,
        "feedbackComments": "",
        "deliveredAt": ""
      }
    },
    {
      "id": "JC-2026-0002",
      "customerName": "Patel Earthmovers (Mr. Rajesh Patel)",
      "vehicleModel": "Ashok Leyland Bada Dost i4 LS",
      "vehicleNumber": "GJ-27-AT-1234",
      "chassisNumber": "MBL12A3B4C5D67890",
      "odometerReading": 19800,
      "driverComplaints": "Soft brake pedal action, hard gear shifting and engine noise at high speed.",
      "warrantyStatus": "Under Warranty",
      "amcStatus": "No AMC",
      "stage": 4,
      "status": "in-progress",
      "createdAt": "2026-05-22T06:30:00.000Z",
      "documents": {
        "jobCardCreated": true,
        "estimateApproved": true,
        "gateEntryCreated": true
      },
      "generalInspection": {
        "engineCondition": true,
        "oilLeakage": false,
        "coolantLevel": true,
        "batteryCondition": true,
        "tyreWear": false,
        "brakeCondition": false,
        "suspensionCheck": true
      },
      "driverComplaintsDiagnosis": {
        "lowPickup": false,
        "excessSmoke": false,
        "brakeHard": true,
        "clutchSlipping": true,
        "steeringVibration": false
      },
      "serviceSchedule": {
        "interval": "20,000 km",
        "category": "Minor Service"
      },
      "operationsPerformed": {
        "engineOilReplaced": true,
        "oilFilterReplaced": true,
        "fuelFilterServiced": false,
        "airFilterServiced": false,
        "beltTensionChecked": true,
        "gearOilChecked": false,
        "clutchAdjusted": true,
        "brakeLiningInspected": false,
        "airLeakageTested": false,
        "brakeChamberInspected": false,
        "batteryVoltageTested": true,
        "alternatorChecked": true,
        "lightingInspected": true,
        "greasePointsLubricated": false,
        "uBoltTightened": false,
        "leafSpringInspected": true,
        "radiatorCleaned": false,
        "coolantToppedUp": true
      },
      "washingGreasing": {
        "pressureWash": false,
        "chassisGreasing": false,
        "propellerShaftGreasing": false,
        "kingpinLubrication": false
      },
      "partsIssued": [
        { "id": "part-1", "name": "Engine Oil (15W-40 CI4 Plus)", "quantity": 7, "price": 450 },
        { "id": "part-2", "name": "Oil Filter Element", "quantity": 1, "price": 850 }
      ],
      "technicians": {
        "mechanic": "Suresh Kumar",
        "electrician": "Manoj Dev",
        "washingCrew": "Washing Team B",
        "roadTestDriver": "Vikram Singh",
        "laborHours": 4.5,
        "laborCost": 1800
      },
      "qualityCheck": {
        "torqueChecks": false,
        "leakageInspection": false,
        "testDrive": false,
        "brakeTest": false,
        "smokeCheck": false,
        "signedOffBy": ""
      },
      "billing": {
        "partsTotal": 4000,
        "laborTotal": 1800,
        "gstAmount": 1044,
        "totalAmount": 6844,
        "invoiceNumber": "",
        "isWarrantyClaim": false
      },
      "delivery": {
        "workExplained": false,
        "nextServiceDueOdo": 25000,
        "customerSignature": "",
        "feedbackRating": 0,
        "feedbackComments": "",
        "deliveredAt": ""
      }
    },
    {
      "id": "JC-2026-0003",
      "customerName": "Mehta Transports (Mr. Sanjay Mehta)",
      "vehicleModel": "Ashok Leyland Dost LiTE",
      "vehicleNumber": "GJ-27-AT-9876",
      "chassisNumber": "MBL32A5B8C9D12345",
      "odometerReading": 10200,
      "driverComplaints": "Routine 10,000 km service check, wash and chassis lubrication.",
      "warrantyStatus": "Under Warranty",
      "amcStatus": "No AMC",
      "stage": 8,
      "status": "qc",
      "createdAt": "2026-05-21T09:15:00.000Z",
      "documents": {
        "jobCardCreated": true,
        "estimateApproved": true,
        "gateEntryCreated": true
      },
      "generalInspection": {
        "engineCondition": true,
        "oilLeakage": true,
        "coolantLevel": true,
        "batteryCondition": true,
        "tyreWear": true,
        "brakeCondition": true,
        "suspensionCheck": true
      },
      "driverComplaintsDiagnosis": {
        "lowPickup": false,
        "excessSmoke": false,
        "brakeHard": false,
        "clutchSlipping": false,
        "steeringVibration": false
      },
      "serviceSchedule": {
        "interval": "10,000 km",
        "category": "Free Service"
      },
      "operationsPerformed": {
        "engineOilReplaced": true,
        "oilFilterReplaced": true,
        "fuelFilterServiced": true,
        "airFilterServiced": true,
        "beltTensionChecked": true,
        "gearOilChecked": true,
        "clutchAdjusted": true,
        "brakeLiningInspected": true,
        "airLeakageTested": true,
        "brakeChamberInspected": true,
        "batteryVoltageTested": true,
        "alternatorChecked": true,
        "lightingInspected": true,
        "greasePointsLubricated": true,
        "uBoltTightened": true,
        "leafSpringInspected": true,
        "radiatorCleaned": true,
        "coolantToppedUp": true
      },
      "washingGreasing": {
        "pressureWash": true,
        "chassisGreasing": true,
        "propellerShaftGreasing": true,
        "kingpinLubrication": true
      },
      "partsIssued": [
        { "id": "part-1", "name": "Engine Oil (15W-40 CI4 Plus)", "quantity": 6, "price": 450 },
        { "id": "part-2", "name": "Oil Filter Element", "quantity": 1, "price": 850 },
        { "id": "part-3", "name": "Fuel Filter (Primary)", "quantity": 1, "price": 1200 },
        { "id": "part-8", "name": "Chassis Grease (Lithium Base)", "quantity": 2, "price": 380 }
      ],
      "technicians": {
        "mechanic": "Amit Patel",
        "electrician": "Manoj Dev",
        "washingCrew": "Washing Team A",
        "roadTestDriver": "Amit Patel",
        "laborHours": 3.0,
        "laborCost": 0
      },
      "qualityCheck": {
        "torqueChecks": true,
        "leakageInspection": true,
        "testDrive": true,
        "brakeTest": true,
        "smokeCheck": true,
        "signedOffBy": "Rajesh Sharma"
      },
      "billing": {
        "partsTotal": 5110,
        "laborTotal": 0,
        "gstAmount": 919.8,
        "totalAmount": 6029.8,
        "invoiceNumber": "INV-2026-1029",
        "isWarrantyClaim": true
      },
      "delivery": {
        "workExplained": true,
        "nextServiceDueOdo": 20000,
        "customerSignature": "Sanjay Mehta",
        "feedbackRating": 5,
        "feedbackComments": "Excellent quick servicing and washing! Very satisfied with Movish Auto.",
        "deliveredAt": "2026-05-21T16:30:00.000Z"
      }
    }
  ]
};

const MOCK_DB_VERSION = 'v3'; // Increment this to force reset local mock database when schema changes

// Retrieve or Initialize Local Storage Mock Database
function getMockDb(): typeof INITIAL_MOCK_DB {
  if (typeof window === 'undefined') return INITIAL_MOCK_DB;
  
  const currentVer = localStorage.getItem('movish_db_version');
  if (currentVer !== MOCK_DB_VERSION) {
    localStorage.setItem('movish_db_version', MOCK_DB_VERSION);
    localStorage.setItem('movish_db', JSON.stringify(INITIAL_MOCK_DB));
    return INITIAL_MOCK_DB;
  }

  const stored = localStorage.getItem('movish_db');
  if (!stored) {
    localStorage.setItem('movish_db', JSON.stringify(INITIAL_MOCK_DB));
    return INITIAL_MOCK_DB;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_MOCK_DB;
  }
}

function saveMockDb(db: typeof INITIAL_MOCK_DB) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('movish_db', JSON.stringify(db));
}

export async function fetchApi(path: string, options: RequestInit = {}, retries = 3) {
  // Check if Mock Authentication is active
  const isMock = typeof window !== 'undefined' ? localStorage.getItem('movish_mock_session') === 'true' : false;

  if (isMock) {
    // Add small delay to simulate network latency for extreme realism!
    await new Promise(resolve => setTimeout(resolve, 150));

    const db = getMockDb();
    const url = new URL(path, 'http://localhost:3000');
    const pathname = url.pathname;
    const method = options.method?.toUpperCase() || 'GET';

    // Parse options body
    let bodyData: any = {};
    if (options.body && typeof options.body === 'string') {
      try { bodyData = JSON.parse(options.body); } catch {}
    }

    // INTERCEPT ROUTER
    if (pathname.startsWith('/api/v1/dashboard/stats')) {
      const pendingClaims = db.claims.filter(c => c.status === 'pending').length;
      const activeLoans = db.loans.filter(l => ['Applied', 'Processing', 'Approved'].includes(l.conversionStatus)).length;
      return {
        view: 'admin',
        total_leads: db.leads.length,
        new_leads_today: 3,
        total_employees: db.users.length,
        active_claims: pendingClaims,
        active_loans: activeLoans,
        today_visits: 5,
        // Mobile-specific mapping compatibility
        leads: db.leads.length,
        revenue: '28,45,000',
        pending: activeLoans,
        claims: pendingClaims
      };
    }

    if (pathname.startsWith('/api/v1/notifications')) {
      return {
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
      };
    }

    if (pathname.startsWith('/api/v1/leads/stats')) {
      const assigned = db.leads.filter(l => l.assignee).length;
      const converted = db.leads.filter(l => l.status === 'Won').length;
      return {
        summary: {
          total: db.leads.length,
          assigned: assigned,
          converted: converted,
          followups: db.followups.length
        }
      };
    }

    if (pathname.startsWith('/api/v1/leads')) {
      // GET individual lead: /api/v1/leads/:id
      const leadIdMatch = pathname.match(/^\/api\/v1\/leads\/([^/]+)$/);
      if (leadIdMatch && method === 'GET') {
        const leadId = leadIdMatch[1];
        const found = db.leads.find((l: any) => l.id === leadId);
        if (found) {
          // Clone the lead object to avoid mutating DB reference
          const leadObj = { ...found };
          const clientNameNormalized = (leadObj.clientName || '').toLowerCase();

          // 1. Policies
          leadObj.policies = (db.policies || []).filter((p: any) => 
            p.leadId === leadId || 
            (p.customerName && clientNameNormalized.includes(p.customerName.toLowerCase()))
          );

          // 2. Claims
          leadObj.claims = (db.claims || []).filter((c: any) => 
            c.leadId === leadId || 
            (c.customerName && clientNameNormalized.includes(c.customerName.toLowerCase()))
          );

          // 3. Quotations
          leadObj.quotations = (db.quotations || []).filter((q: any) => 
            q.leadId === leadId || 
            (q.lead && q.lead.clientName && clientNameNormalized.includes(q.lead.clientName.toLowerCase()))
          );

          // 4. Followups (both followups and followUps)
          const filteredFollowups = (db.followups || []).filter((f: any) => 
            f.leadId === leadId || 
            (f.leadName && clientNameNormalized.includes(f.leadName.toLowerCase()))
          );
          leadObj.followups = filteredFollowups;
          leadObj.followUps = filteredFollowups;

          // 5. Loans
          leadObj.loans = (db.loans || []).filter((ln: any) => 
            ln.leadId === leadId || 
            (ln.customerName && clientNameNormalized.includes(ln.customerName.toLowerCase()))
          );

          return leadObj;
        }
        return null;
      }

      if (method === 'POST') {
        const newId = `lead-${Date.now()}`;
        const newLead = {
          id: newId,
          clientName: bodyData.clientName || 'Unnamed Lead',
          clientPhone: bodyData.clientPhone || 'No Phone',
          clientEmail: bodyData.clientEmail || 'No Email',
          vehicleNo: bodyData.vehicleNo || 'Ashok Leyland Bada Dost',
          status: 'New',
          createdAt: new Date().toISOString(),
          assignee: { fullName: "Amit Patel" }
        };
        db.leads.unshift(newLead);
        
        // Also auto-create a CRM client for this lead!
        db.crm.unshift({
          id: `client-${Date.now()}`,
          name: newLead.clientName,
          phone: newLead.clientPhone,
          email: newLead.clientEmail,
          address: 'Ahmedabad showroom visitor',
          kycStatus: 'pending',
          policyCount: 0,
          leadId: newId
        });

        saveMockDb(db);
        return newLead;
      }
      return { leads: db.leads };
    }

    if (pathname.startsWith('/api/v1/crm')) {
      if (method === 'POST') {
        const newClient = {
          id: `client-${Date.now()}`,
          name: bodyData.name || 'Unnamed Client',
          phone: bodyData.phone || 'No Phone',
          email: bodyData.email || 'No Email',
          address: bodyData.address || 'Ahmedabad',
          kycStatus: bodyData.kyc_status || 'pending',
          policyCount: 0,
          leadId: ''
        };
        db.crm.unshift(newClient);
        saveMockDb(db);
        return newClient;
      }
      return db.crm;
    }

    if (pathname.startsWith('/api/v1/claims')) {
      if (method === 'POST') {
        const newClaim = {
          id: `ticket-${Date.now()}`,
          customerName: bodyData.customerName || 'Unnamed Customer',
          vehicleNumber: bodyData.vehicleNumber || 'No Plate',
          claimType: bodyData.type || 'Scheduled Service',
          claimAmount: bodyData.amount || 0,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        db.claims.unshift(newClaim);
        saveMockDb(db);
        return newClaim;
      }
      return db.claims;
    }

    if (pathname.startsWith('/api/v1/workshop/parts')) {
      return db.partsInventory || [];
    }

    if (pathname.startsWith('/api/v1/workshop')) {
      if (method === 'POST') {
        const newCard = {
          id: `JC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: bodyData.customerName || 'Unnamed Customer',
          vehicleModel: bodyData.vehicleModel || 'Ashok Leyland Bada Dost',
          vehicleNumber: bodyData.vehicleNumber || 'GJ-01-XX-9999',
          chassisNumber: bodyData.chassisNumber || 'MBL' + Math.random().toString(36).substring(2, 17).toUpperCase(),
          odometerReading: bodyData.odometerReading || 0,
          driverComplaints: bodyData.driverComplaints || 'General checkup',
          warrantyStatus: bodyData.warrantyStatus || 'Out of Warranty',
          amcStatus: bodyData.amcStatus || 'No AMC',
          stage: 1,
          status: 'in-progress',
          createdAt: new Date().toISOString(),
          documents: {
            jobCardCreated: true,
            estimateApproved: false,
            gateEntryCreated: true
          },
          generalInspection: {
            engineCondition: false,
            oilLeakage: false,
            coolantLevel: false,
            batteryCondition: false,
            tyreWear: false,
            brakeCondition: false,
            suspensionCheck: false
          },
          driverComplaintsDiagnosis: {
            lowPickup: false,
            excessSmoke: false,
            brakeHard: false,
            clutchSlipping: false,
            steeringVibration: false
          },
          serviceSchedule: {
            interval: bodyData.serviceInterval || '5,000 km',
            category: bodyData.serviceCategory || 'Free Service'
          },
          operationsPerformed: {
            engineOilReplaced: false,
            oilFilterReplaced: false,
            fuelFilterServiced: false,
            airFilterServiced: false,
            beltTensionChecked: false,
            gearOilChecked: false,
            clutchAdjusted: false,
            brakeLiningInspected: false,
            airLeakageTested: false,
            brakeChamberInspected: false,
            batteryVoltageTested: false,
            alternatorChecked: false,
            lightingInspected: false,
            greasePointsLubricated: false,
            uBoltTightened: false,
            leafSpringInspected: false,
            radiatorCleaned: false,
            coolantToppedUp: false
          },
          washingGreasing: {
            pressureWash: false,
            chassisGreasing: false,
            propellerShaftGreasing: false,
            kingpinLubrication: false
          },
          partsIssued: [],
          technicians: {
            mechanic: '',
            electrician: '',
            washingCrew: '',
            roadTestDriver: '',
            laborHours: 0,
            laborCost: 0
          },
          qualityCheck: {
            torqueChecks: false,
            leakageInspection: false,
            testDrive: false,
            brakeTest: false,
            smokeCheck: false,
            signedOffBy: ''
          },
          billing: {
            partsTotal: 0,
            laborTotal: 0,
            gstAmount: 0,
            totalAmount: 0,
            invoiceNumber: '',
            isWarrantyClaim: false
          },
          delivery: {
            workExplained: false,
            nextServiceDueOdo: (bodyData.odometerReading || 0) + 5000,
            customerSignature: '',
            feedbackRating: 0,
            feedbackComments: '',
            deliveredAt: ''
          }
        };
        db.workshopJobCards = db.workshopJobCards || [];
        db.workshopJobCards.unshift(newCard);
        saveMockDb(db);
        return newCard;
      }

      if (method === 'PUT' || method === 'PATCH') {
        const updatedCard = bodyData;
        db.workshopJobCards = db.workshopJobCards || [];
        const index = db.workshopJobCards.findIndex((c: any) => c.id === updatedCard.id);
        if (index !== -1) {
          db.workshopJobCards[index] = { ...db.workshopJobCards[index], ...updatedCard };
          
          // Also sync to active claims (tickets log) if they are in Billing (Stage 9) or Completed!
          if (updatedCard.stage >= 9 && updatedCard.billing) {
            const hasClaim = db.claims.some((c: any) => c.id === `ticket-${updatedCard.id}`);
            if (!hasClaim) {
              db.claims.unshift({
                id: `ticket-${updatedCard.id}`,
                customerName: updatedCard.customerName,
                vehicleNumber: updatedCard.vehicleNumber,
                claimType: updatedCard.serviceSchedule?.category || 'Workshop Service',
                claimAmount: updatedCard.billing.totalAmount,
                status: updatedCard.stage === 10 ? 'completed' : 'pending',
                createdAt: updatedCard.createdAt
              });
            } else {
              const claimIndex = db.claims.findIndex((c: any) => c.id === `ticket-${updatedCard.id}`);
              if (claimIndex !== -1) {
                db.claims[claimIndex].status = updatedCard.stage === 10 ? 'completed' : 'pending';
                db.claims[claimIndex].claimAmount = updatedCard.billing.totalAmount;
              }
            }
          }

          saveMockDb(db);
          return db.workshopJobCards[index];
        }
        return { error: 'Job Card not found' };
      }

      return db.workshopJobCards || [];
    }

    if (pathname.startsWith('/api/v1/finance/loans')) {
      if (method === 'POST') {
        const newLoan = {
          id: `loan-${Date.now()}`,
          customerName: bodyData.customer_name || 'Unnamed Customer',
          loanType: bodyData.loan_type || 'Full Vehicle Loan',
          amount: bodyData.amount || 0,
          conversionStatus: 'Applied',
          createdAt: new Date().toISOString()
        };
        db.loans.unshift(newLoan);
        saveMockDb(db);
        return newLoan;
      }
      if (method === 'PATCH') {
        const targetId = bodyData.id;
        const targetLoan = db.loans.find(l => l.id === targetId);
        if (targetLoan) {
          targetLoan.conversionStatus = bodyData.conversionStatus || targetLoan.conversionStatus;
          saveMockDb(db);
        }
        return { success: true };
      }
      return db.loans;
    }

    if (pathname.startsWith('/api/v1/quotations')) {
      if (method === 'POST') {
        const targetLead = db.leads.find(l => l.id === bodyData.lead_id);
        const newQuote = {
          id: `quote-${Date.now()}`,
          amount: bodyData.amount || 0,
          status: 'Draft',
          details: bodyData.details || {},
          createdAt: new Date().toISOString(),
          lead: {
            clientName: targetLead?.clientName || 'Unnamed Customer',
            vehicleNo: targetLead?.vehicleNo || 'Ashok Leyland'
          }
        };
        db.quotations.unshift(newQuote);
        saveMockDb(db);
        return newQuote;
      }
      if (pathname.endsWith('/share')) {
        return { shareUrl: `${window.location.origin}/quotations/view/${Date.now()}` };
      }
      return db.quotations;
    }

    if (pathname.startsWith('/api/v1/follow-ups')) {
      if (method === 'POST') {
        const newFollowup = {
          id: `followup-${Date.now()}`,
          leadName: bodyData.lead_name || 'Unnamed Customer',
          type: bodyData.type || 'call',
          notes: bodyData.notes || 'No notes',
          scheduledAt: bodyData.scheduled_at || new Date().toISOString(),
          status: 'pending'
        };
        db.followups.unshift(newFollowup);
        saveMockDb(db);
        return newFollowup;
      }
      return db.followups;
    }

    if (pathname.startsWith('/api/v1/settings/responses')) {
      if (method === 'POST') {
        const newResp = {
          id: `resp-${Date.now()}`,
          text: bodyData.text || '',
          isActive: true
        };
        db.responses.push(newResp);
        saveMockDb(db);
        return newResp;
      }
      if (method === 'DELETE') {
        const parts = pathname.split('/');
        const id = parts[parts.length - 1];
        db.responses = db.responses.filter(r => r.id !== id);
        saveMockDb(db);
        return { success: true };
      }
      return db.responses;
    }

    if (pathname.startsWith('/api/v1/users')) {
      if (method === 'POST') {
        const newUser = {
          id: `user-${Date.now()}`,
          fullName: bodyData.fullName || 'New User',
          email: bodyData.email || 'user@movish.com',
          role: { name: bodyData.role || 'Executive' },
          isActive: true
        };
        db.users.push(newUser);
        saveMockDb(db);
        return newUser;
      }
      return db.users;
    }

    if (pathname.startsWith('/api/v1/permissions')) {
      return (db as any).permissions || [];
    }

    if (pathname.startsWith('/api/v1/roles')) {
      // GET individual role with permissions: /api/v1/roles/:id
      const roleIdMatch = pathname.match(/^\/api\/v1\/roles\/([^/]+)$/);
      if (roleIdMatch && method === 'GET') {
        const roleId = roleIdMatch[1];
        const rolePerms = ((db as any).rolePermissions || {})[roleId] || [];
        const perms = ((db as any).permissions || []).filter((p: any) => rolePerms.includes(p.id));
        return { permissions: perms };
      }
      // PATCH role permissions
      if (roleIdMatch && (method === 'PATCH' || method === 'PUT')) {
        const roleId = roleIdMatch[1];
        if (!(db as any).rolePermissions) (db as any).rolePermissions = {};
        (db as any).rolePermissions[roleId] = bodyData.permissionIds || [];
        saveMockDb(db as any);
        return { success: true };
      }
      // POST create role
      if (method === 'POST') {
        const newRole = {
          id: `role-${Date.now()}`,
          name: bodyData.name || 'New Role',
          description: bodyData.description || '',
          permissions: [],
          _count: { users: 0 }
        };
        (db as any).roles = (db as any).roles || [];
        (db as any).roles.push(newRole);
        saveMockDb(db as any);
        return newRole;
      }
      // DELETE role
      if (roleIdMatch && method === 'DELETE') {
        const roleId = roleIdMatch[1];
        (db as any).roles = ((db as any).roles || []).filter((r: any) => r.id !== roleId);
        saveMockDb(db as any);
        return { success: true };
      }
      return (db as any).roles || [];
    }

    if (pathname.startsWith('/api/v1/finance/transactions')) {
      if (method === 'POST') {
        const newTx = {
          id: `tx-${Date.now()}`,
          type: bodyData.type || 'income',
          category: bodyData.category || 'Other',
          amount: bodyData.amount || 0,
          status: 'completed',
          paymentMethod: bodyData.paymentMethod || 'UPI',
          referenceNumber: `TXN-${Date.now().toString().slice(-4)}`,
          description: bodyData.description || 'Quick Transaction',
          date: new Date().toISOString().split('T')[0]
        };
        db.transactions.unshift(newTx);
        saveMockDb(db);
        return newTx;
      }
      return db.transactions;
    }

    // Default Intercept Response
    return { success: true };
  }

  // STANDARD SUPABASE / SERVER API LOGIC
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${session?.access_token}`,
    ...((options.headers as Record<string, string>) || {}),
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(path, {
        ...options,
        headers,
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'An unknown error occurred' }))
        throw new Error(error.error || `HTTP error! status: ${res.status}`)
      }

      return res.json()
    } catch (err: any) {
      if (i === retries - 1) throw err
      console.warn(`[api] Fetch failed, retrying (${i + 1}/${retries})...`, err.message)
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)))
    }
  }
}
