import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL;

  if (!databaseUrl) {
    return res.status(503).json({
      success: false,
      error: 'DATABASE_URL environment variable is not configured',
    });
  }

  try {
    const sql = neon(databaseUrl);

    // GET: Fetch all data from Neon database
    if (req.method === 'GET') {
      // Ensure tables exist
      await sql`
        CREATE TABLE IF NOT EXISTS customers (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          contact VARCHAR(100) NOT NULL,
          title VARCHAR(100),
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(150) NOT NULL,
          tax_id VARCHAR(20) NOT NULL,
          address TEXT NOT NULL,
          payment_terms VARCHAR(100) NOT NULL,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS vendors (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          contact VARCHAR(100) NOT NULL,
          title VARCHAR(100),
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(150) NOT NULL,
          tax_id VARCHAR(20) NOT NULL,
          address TEXT NOT NULL,
          payment_terms VARCHAR(100) NOT NULL,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          vendor_id VARCHAR(50),
          vendor_name VARCHAR(255) NOT NULL,
          cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
          price NUMERIC(15, 2) NOT NULL DEFAULT 0,
          stock INTEGER NOT NULL DEFAULT 0,
          brand VARCHAR(100),
          spec VARCHAR(200),
          description TEXT,
          image TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS quotations (
          id VARCHAR(50) PRIMARY KEY,
          date VARCHAR(20) NOT NULL,
          customer_id VARCHAR(50) NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_tax_id VARCHAR(20) NOT NULL,
          customer_contact VARCHAR(100),
          quoter VARCHAR(100) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          address TEXT NOT NULL,
          terms TEXT,
          status VARCHAR(30) NOT NULL DEFAULT '待確認',
          subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
          tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
          total NUMERIC(15, 2) NOT NULL DEFAULT 0,
          items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      const rawCustomers = await sql`SELECT * FROM customers ORDER BY id ASC`;
      const rawVendors = await sql`SELECT * FROM vendors ORDER BY id ASC`;
      const rawProducts = await sql`SELECT * FROM products ORDER BY id ASC`;
      const rawQuotations = await sql`SELECT * FROM quotations ORDER BY date DESC, id DESC`;

      // Map snake_case to frontend camelCase
      const customers = rawCustomers.map((c: any) => ({
        id: c.id,
        name: c.name,
        contact: c.contact,
        title: c.title || '',
        phone: c.phone,
        email: c.email,
        taxId: c.tax_id,
        address: c.address,
        paymentTerms: c.payment_terms,
        notes: c.notes || '',
        createdAt: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
      }));

      const vendors = rawVendors.map((v: any) => ({
        id: v.id,
        name: v.name,
        contact: v.contact,
        title: v.title || '',
        phone: v.phone,
        email: v.email,
        taxId: v.tax_id,
        address: v.address,
        paymentTerms: v.payment_terms,
        notes: v.notes || '',
        createdAt: v.created_at ? new Date(v.created_at).toISOString() : new Date().toISOString(),
      }));

      const products = rawProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        vendorId: p.vendor_id || undefined,
        vendorName: p.vendor_name,
        cost: Number(p.cost) || 0,
        price: Number(p.price) || 0,
        stock: Number(p.stock) || 0,
        brand: p.brand || '',
        spec: p.spec || '',
        description: p.description || '',
        image: p.image || undefined,
        createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
      }));

      const quotations = rawQuotations.map((q: any) => {
        let items = [];
        try {
          items = typeof q.items_json === 'string' ? JSON.parse(q.items_json) : (q.items_json || []);
        } catch {
          items = [];
        }
        return {
          id: q.id,
          date: q.date,
          customerId: q.customer_id,
          customerName: q.customer_name,
          customerTaxId: q.customer_tax_id,
          customerContact: q.customer_contact || '',
          quoter: q.quoter,
          phone: q.phone,
          address: q.address,
          terms: q.terms || '',
          status: q.status,
          subtotal: Number(q.subtotal) || 0,
          tax: Number(q.tax) || 0,
          total: Number(q.total) || 0,
          items,
          createdAt: q.created_at ? new Date(q.created_at).toISOString() : new Date().toISOString(),
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          customers,
          vendors,
          products,
          quotations,
        },
      });
    }

    // POST: Bulk sync or save entity changes to Neon
    if (req.method === 'POST') {
      const { type, entity, data } = req.body || {};

      // Case A: Full state sync
      if (type === 'full_sync' && data) {
        const { customers = [], vendors = [], products = [], quotations = [] } = data;

        // Upsert Customers
        for (const c of customers) {
          await sql`
            INSERT INTO customers (id, name, contact, title, phone, email, tax_id, address, payment_terms, notes)
            VALUES (${c.id}, ${c.name}, ${c.contact}, ${c.title || null}, ${c.phone}, ${c.email}, ${c.taxId}, ${c.address}, ${c.paymentTerms}, ${c.notes || null})
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              contact = EXCLUDED.contact,
              title = EXCLUDED.title,
              phone = EXCLUDED.phone,
              email = EXCLUDED.email,
              tax_id = EXCLUDED.tax_id,
              address = EXCLUDED.address,
              payment_terms = EXCLUDED.payment_terms,
              notes = EXCLUDED.notes,
              updated_at = NOW();
          `;
        }

        // Upsert Vendors
        for (const v of vendors) {
          await sql`
            INSERT INTO vendors (id, name, contact, title, phone, email, tax_id, address, payment_terms, notes)
            VALUES (${v.id}, ${v.name}, ${v.contact}, ${v.title || null}, ${v.phone}, ${v.email}, ${v.taxId}, ${v.address}, ${v.paymentTerms}, ${v.notes || null})
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              contact = EXCLUDED.contact,
              title = EXCLUDED.title,
              phone = EXCLUDED.phone,
              email = EXCLUDED.email,
              tax_id = EXCLUDED.tax_id,
              address = EXCLUDED.address,
              payment_terms = EXCLUDED.payment_terms,
              notes = EXCLUDED.notes,
              updated_at = NOW();
          `;
        }

        // Upsert Products
        for (const p of products) {
          await sql`
            INSERT INTO products (id, name, vendor_id, vendor_name, cost, price, stock, brand, spec, description, image)
            VALUES (${p.id}, ${p.name}, ${p.vendorId || null}, ${p.vendorName}, ${p.cost}, ${p.price}, ${p.stock}, ${p.brand || null}, ${p.spec || null}, ${p.description || null}, ${p.image || null})
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              vendor_id = EXCLUDED.vendor_id,
              vendor_name = EXCLUDED.vendor_name,
              cost = EXCLUDED.cost,
              price = EXCLUDED.price,
              stock = EXCLUDED.stock,
              brand = EXCLUDED.brand,
              spec = EXCLUDED.spec,
              description = EXCLUDED.description,
              image = EXCLUDED.image,
              updated_at = NOW();
          `;
        }

        // Upsert Quotations
        for (const q of quotations) {
          const itemsJson = JSON.stringify(q.items || []);
          await sql`
            INSERT INTO quotations (id, date, customer_id, customer_name, customer_tax_id, customer_contact, quoter, phone, address, terms, status, subtotal, tax, total, items_json)
            VALUES (${q.id}, ${q.date}, ${q.customerId}, ${q.customerName}, ${q.customerTaxId}, ${q.customerContact || null}, ${q.quoter}, ${q.phone}, ${q.address}, ${q.terms || null}, ${q.status}, ${q.subtotal}, ${q.tax}, ${q.total}, ${itemsJson}::jsonb)
            ON CONFLICT (id) DO UPDATE SET
              date = EXCLUDED.date,
              customer_id = EXCLUDED.customer_id,
              customer_name = EXCLUDED.customer_name,
              customer_tax_id = EXCLUDED.customer_tax_id,
              customer_contact = EXCLUDED.customer_contact,
              quoter = EXCLUDED.quoter,
              phone = EXCLUDED.phone,
              address = EXCLUDED.address,
              terms = EXCLUDED.terms,
              status = EXCLUDED.status,
              subtotal = EXCLUDED.subtotal,
              tax = EXCLUDED.tax,
              total = EXCLUDED.total,
              items_json = EXCLUDED.items_json,
              updated_at = NOW();
          `;
        }

        return res.status(200).json({ success: true, message: '全量同步完成' });
      }

      // Case B: Upsert single customer
      if (type === 'save_customer' && entity) {
        const c = entity;
        await sql`
          INSERT INTO customers (id, name, contact, title, phone, email, tax_id, address, payment_terms, notes)
          VALUES (${c.id}, ${c.name}, ${c.contact}, ${c.title || null}, ${c.phone}, ${c.email}, ${c.taxId}, ${c.address}, ${c.paymentTerms}, ${c.notes || null})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            contact = EXCLUDED.contact,
            title = EXCLUDED.title,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            tax_id = EXCLUDED.tax_id,
            address = EXCLUDED.address,
            payment_terms = EXCLUDED.payment_terms,
            notes = EXCLUDED.notes,
            updated_at = NOW();
        `;
        return res.status(200).json({ success: true });
      }

      // Case C: Delete entity
      if (type === 'delete_item') {
        const { target, id } = req.body;
        if (target === 'customer') {
          await sql`DELETE FROM customers WHERE id = ${id}`;
        } else if (target === 'vendor') {
          await sql`DELETE FROM vendors WHERE id = ${id}`;
        } else if (target === 'product') {
          await sql`DELETE FROM products WHERE id = ${id}`;
        } else if (target === 'quotation') {
          await sql`DELETE FROM quotations WHERE id = ${id}`;
        }
        return res.status(200).json({ success: true });
      }

      // Case D: Upsert single vendor
      if (type === 'save_vendor' && entity) {
        const v = entity;
        await sql`
          INSERT INTO vendors (id, name, contact, title, phone, email, tax_id, address, payment_terms, notes)
          VALUES (${v.id}, ${v.name}, ${v.contact}, ${v.title || null}, ${v.phone}, ${v.email}, ${v.taxId}, ${v.address}, ${v.paymentTerms}, ${v.notes || null})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            contact = EXCLUDED.contact,
            title = EXCLUDED.title,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            tax_id = EXCLUDED.tax_id,
            address = EXCLUDED.address,
            payment_terms = EXCLUDED.payment_terms,
            notes = EXCLUDED.notes,
            updated_at = NOW();
        `;
        return res.status(200).json({ success: true });
      }

      // Case E: Upsert single product
      if (type === 'save_product' && entity) {
        const p = entity;
        await sql`
          INSERT INTO products (id, name, vendor_id, vendor_name, cost, price, stock, brand, spec, description, image)
          VALUES (${p.id}, ${p.name}, ${p.vendorId || null}, ${p.vendorName}, ${p.cost}, ${p.price}, ${p.stock}, ${p.brand || null}, ${p.spec || null}, ${p.description || null}, ${p.image || null})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            vendor_id = EXCLUDED.vendor_id,
            vendor_name = EXCLUDED.vendor_name,
            cost = EXCLUDED.cost,
            price = EXCLUDED.price,
            stock = EXCLUDED.stock,
            brand = EXCLUDED.brand,
            spec = EXCLUDED.spec,
            description = EXCLUDED.description,
            image = EXCLUDED.image,
            updated_at = NOW();
        `;
        return res.status(200).json({ success: true });
      }

      // Case F: Upsert single quotation
      if (type === 'save_quotation' && entity) {
        const q = entity;
        const itemsJson = JSON.stringify(q.items || []);
        await sql`
          INSERT INTO quotations (id, date, customer_id, customer_name, customer_tax_id, customer_contact, quoter, phone, address, terms, status, subtotal, tax, total, items_json)
          VALUES (${q.id}, ${q.date}, ${q.customerId}, ${q.customerName}, ${q.customerTaxId}, ${q.customerContact || null}, ${q.quoter}, ${q.phone}, ${q.address}, ${q.terms || null}, ${q.status}, ${q.subtotal}, ${q.tax}, ${q.total}, ${itemsJson}::jsonb)
          ON CONFLICT (id) DO UPDATE SET
            date = EXCLUDED.date,
            customer_id = EXCLUDED.customer_id,
            customer_name = EXCLUDED.customer_name,
            customer_tax_id = EXCLUDED.customer_tax_id,
            customer_contact = EXCLUDED.customer_contact,
            quoter = EXCLUDED.quoter,
            phone = EXCLUDED.phone,
            address = EXCLUDED.address,
            terms = EXCLUDED.terms,
            status = EXCLUDED.status,
            subtotal = EXCLUDED.subtotal,
            tax = EXCLUDED.tax,
            total = EXCLUDED.total,
            items_json = EXCLUDED.items_json,
            updated_at = NOW();
        `;
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Unsupported type' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Neon API Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Database execution error',
    });
  }
}
