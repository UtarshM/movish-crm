/**
 * SAP Business One Service Layer API Client
 * Supports both Live Connection (via OData REST Web Services)
 * and Dry-run Local Simulation Mode when live SAP server is unconfigured.
 */
export class SapClient {
  private static serviceUrl = process.env.SAP_SERVICE_LAYER_URL || '';
  private static companyDb = process.env.SAP_COMPANY_DB || '';
  private static username = process.env.SAP_USERNAME || '';
  private static password = process.env.SAP_PASSWORD || '';

  private static sessionCookie: string | null = null;
  private static sessionExpiry: number | null = null; // timestamp in ms

  /**
   * Determine if SAP should run in Simulation mode (when credentials are not provided)
   */
  public static isSimulationMode(): boolean {
    return !this.serviceUrl || !this.username || !this.password;
  }

  /**
   * Handshake with SAP Service Layer to authenticate and cache the session cookie
   */
  private static async authenticate(): Promise<string> {
    if (this.isSimulationMode()) {
      console.warn('[SAP-Client] Running in local simulation mode. Authenticated as MOCK-SAP-ADMIN.');
      return 'B1SESSION=mock-session-cookie';
    }

    // Return cached cookie if it is still valid (default session timeout is 30 mins)
    if (this.sessionCookie && this.sessionExpiry && Date.now() < this.sessionExpiry) {
      return this.sessionCookie;
    }

    console.log(`[SAP-Client] Requesting session handshake with SAP server at: ${this.serviceUrl}/Login`);
    try {
      const res = await fetch(`${this.serviceUrl}/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CompanyDB: this.companyDb,
          UserName: this.username,
          Password: this.password,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`SAP Authentication Failed (${res.status}): ${errText}`);
      }

      // Parse OData session response
      const data = await res.json();
      const b1Session = data.SessionId;
      
      // Cache session cookie (SAP usually sets SessionTimeout in minutes, default 30)
      const timeoutMs = (data.SessionTimeout || 30) * 60 * 1000;
      this.sessionCookie = `B1SESSION=${b1Session}`;
      this.sessionExpiry = Date.now() + (timeoutMs - 60000); // 1-minute buffer

      console.log('[SAP-Client] Handshake successful. Cached session cookie.');
      return this.sessionCookie;
    } catch (err: any) {
      console.error('[SAP-Client] Network error connecting to SAP Service Layer:', err.message);
      throw err;
    }
  }

  /**
   * Post a Completed Job Card to SAP Business Partners & draft Invoice ledger
   */
  public static async postInvoice(jobCard: any): Promise<{ success: boolean; docEntry?: number; message: string }> {
    const isMock = this.isSimulationMode();
    console.log(`[SAP-Client] Posting invoice for Job Card ${jobCard.id} (Vehicle: ${jobCard.vehicleNumber}) to SAP...`);

    if (isMock) {
      // Simulate network latency for maximum realism
      await new Promise((r) => setTimeout(r, 600));
      const simulatedDocEntry = Math.floor(100000 + Math.random() * 900000);
      return {
        success: true,
        docEntry: simulatedDocEntry,
        message: `Successfully synchronized to SAP ERP Ledger (Simulated Document Entry: ${simulatedDocEntry}).`,
      };
    }

    try {
      const cookie = await this.authenticate();
      
      // 1. Sync / Create Business Partner (Customer)
      const bpCardCode = `C-${jobCard.customerName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase()}`;
      await this.syncCustomer({
        CardCode: bpCardCode,
        CardName: jobCard.customerName,
        CardType: 'cCustomer',
        Phone1: '9900000000',
        EmailAddress: 'sync@sap-customer.com'
      });

      // 2. Map Job Card items to SAP Draft Document Lines
      const docLines = (jobCard.partsIssued || []).map((part: any, index: number) => ({
        LineNum: index,
        ItemCode: part.id || 'SP-GENERIC',
        Quantity: part.quantity || 1,
        UnitPrice: part.price || 0,
      }));

      // Fallback draft line if no parts issued
      if (docLines.length === 0) {
        docLines.push({
          LineNum: 0,
          ItemCode: 'LABOR-SERVICE',
          Quantity: 1,
          UnitPrice: jobCard.billing?.laborTotal || 1500,
        });
      }

      // 3. Post Draft Invoice Document to SAP OData
      const payload = {
        CardCode: bpCardCode,
        DocDate: new Date().toISOString().split('T')[0],
        DocDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Net 30
        Comments: `Generated from Movish CRM - Job Card ${jobCard.id} / Registration: ${jobCard.vehicleNumber}`,
        DocumentLines: docLines,
      };

      const res = await fetch(`${this.serviceUrl}/Drafts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OData Posting Failed: ${errText}`);
      }

      const invoiceResult = await res.json();
      return {
        success: true,
        docEntry: invoiceResult.DocEntry,
        message: `Successfully synchronized to SAP ERP Ledger (Draft Document Entry ID: ${invoiceResult.DocEntry}).`,
      };
    } catch (err: any) {
      console.error('[SAP-Client] Error posting draft invoice to SAP:', err.message);
      return {
        success: false,
        message: `SAP Sync Error: ${err.message}`,
      };
    }
  }

  /**
   * Sync Customer details to SAP Business Partners ledger
   */
  public static async syncCustomer(bpData: any): Promise<boolean> {
    if (this.isSimulationMode()) {
      return true;
    }

    try {
      const cookie = await this.authenticate();
      
      // Check if Business Partner already exists in SAP
      const checkRes = await fetch(
        `${this.serviceUrl}/BusinessPartners('${encodeURIComponent(bpData.CardCode)}')`,
        {
          method: 'GET',
          headers: { Cookie: cookie },
        }
      );

      if (checkRes.ok) {
        console.log(`[SAP-Client] BP ${bpData.CardCode} already exists in SAP. Skipping creation.`);
        return true;
      }

      // Create new Business Partner card in SAP
      const createRes = await fetch(`${this.serviceUrl}/BusinessPartners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify(bpData),
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        console.error(`[SAP-Client] Failed to create BP in SAP: ${err}`);
        return false;
      }

      console.log(`[SAP-Client] Customer Card ${bpData.CardCode} created successfully in SAP Business Partners ledger.`);
      return true;
    } catch (err: any) {
      console.error('[SAP-Client] BP sync error:', err.message);
      return false;
    }
  }

  /**
   * Get Spare Parts inventory stock quantities and current unit price levels from SAP
   */
  public static async getInventory(): Promise<any[]> {
    if (this.isSimulationMode()) {
      return [
        { ItemCode: 'part-1', ItemName: 'Engine Oil (15W-40 CI4 Plus)', StockOnHand: 45, Price: 450 },
        { ItemCode: 'part-2', ItemName: 'Oil Filter Element', StockOnHand: 18, Price: 850 },
        { ItemCode: 'part-3', ItemName: 'Fuel Filter (Primary)', StockOnHand: 22, Price: 1200 },
        { ItemCode: 'part-8', ItemName: 'Chassis Grease (Lithium Base)', StockOnHand: 60, Price: 380 },
      ];
    }

    try {
      const cookie = await this.authenticate();
      // OData Query: select ItemCode, ItemName, QuantityOnStock, and Price levels
      const res = await fetch(
        `${this.serviceUrl}/Items?$select=ItemCode,ItemName,QuantityOnStock,ItemPrices`,
        {
          method: 'GET',
          headers: { Cookie: cookie },
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Inventory OData query failed: ${err}`);
      }

      const data = await res.json();
      return (data.value || []).map((item: any) => ({
        ItemCode: item.ItemCode,
        ItemName: item.ItemName,
        StockOnHand: item.QuantityOnStock || 0,
        Price: item.ItemPrices?.[0]?.Price || 0,
      }));
    } catch (err: any) {
      console.error('[SAP-Client] Inventory fetch error:', err.message);
      throw err;
    }
  }
}
