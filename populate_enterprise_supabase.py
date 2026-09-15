import os
import sys
import random
from datetime import datetime, timedelta, date
from decimal import Decimal
from sqlalchemy import create_engine, text

def generate_and_seed_enterprise_db(db_url: str):
    print(f"[*] Connecting to Supabase database...")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    engine = create_engine(db_url)

    # 1. DDL Script for 15 Enterprise Tables
    ddl_script = """
    -- Drop existing tables with CASCADE
    DROP TABLE IF EXISTS marketing_campaigns CASCADE;
    DROP TABLE IF EXISTS inventory_logs CASCADE;
    DROP TABLE IF EXISTS product_reviews CASCADE;
    DROP TABLE IF EXISTS shipments CASCADE;
    DROP TABLE IF EXISTS payments CASCADE;
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS discounts CASCADE;
    DROP TABLE IF EXISTS customer_addresses CASCADE;
    DROP TABLE IF EXISTS customers CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS product_categories CASCADE;
    DROP TABLE IF EXISTS suppliers CASCADE;
    DROP TABLE IF EXISTS employees CASCADE;
    DROP TABLE IF EXISTS departments CASCADE;

    -- 1. Departments
    CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(80) NOT NULL UNIQUE,
        manager_name VARCHAR(100) NOT NULL,
        annual_budget NUMERIC(14, 2) NOT NULL
    );

    -- 2. Employees
    CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        department_id INTEGER NOT NULL REFERENCES departments(id),
        first_name VARCHAR(60) NOT NULL,
        last_name VARCHAR(60) NOT NULL,
        email VARCHAR(120) NOT NULL UNIQUE,
        title VARCHAR(80) NOT NULL,
        salary NUMERIC(10, 2) NOT NULL,
        hire_date DATE NOT NULL
    );

    -- 3. Suppliers
    CREATE TABLE suppliers (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(120) NOT NULL,
        contact_name VARCHAR(100) NOT NULL,
        email VARCHAR(120) NOT NULL,
        phone VARCHAR(40) NOT NULL,
        country VARCHAR(60) NOT NULL,
        city VARCHAR(60) NOT NULL,
        rating NUMERIC(3, 1) DEFAULT 4.5
    );

    -- 4. Product Categories
    CREATE TABLE product_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(80) NOT NULL UNIQUE,
        description TEXT
    );

    -- 5. Products
    CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL REFERENCES product_categories(id),
        supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
        sku VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        cost_price NUMERIC(10, 2) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        stock_quantity INTEGER NOT NULL,
        reorder_level INTEGER NOT NULL DEFAULT 20
    );

    -- 6. Customers
    CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(60) NOT NULL,
        last_name VARCHAR(60) NOT NULL,
        email VARCHAR(120) NOT NULL UNIQUE,
        phone VARCHAR(40),
        country VARCHAR(60) NOT NULL,
        city VARCHAR(60) NOT NULL,
        loyalty_tier VARCHAR(20) NOT NULL DEFAULT 'Bronze' CHECK(loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
        signup_date DATE NOT NULL
    );

    -- 7. Customer Addresses
    CREATE TABLE customer_addresses (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        street VARCHAR(150) NOT NULL,
        city VARCHAR(60) NOT NULL,
        state VARCHAR(60),
        postal_code VARCHAR(30) NOT NULL,
        country VARCHAR(60) NOT NULL,
        is_default BOOLEAN DEFAULT true
    );

    -- 8. Discounts / Coupons
    CREATE TABLE discounts (
        id SERIAL PRIMARY KEY,
        code VARCHAR(40) NOT NULL UNIQUE,
        discount_percent INTEGER NOT NULL,
        min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        active BOOLEAN DEFAULT true
    );

    -- 9. Orders
    CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        discount_id INTEGER REFERENCES discounts(id),
        order_date DATE NOT NULL,
        status VARCHAR(30) NOT NULL CHECK(status IN ('completed', 'pending', 'cancelled', 'shipped', 'processing')),
        payment_method VARCHAR(40) NOT NULL,
        shipping_fee NUMERIC(8, 2) NOT NULL DEFAULT 0,
        tax_amount NUMERIC(8, 2) NOT NULL DEFAULT 0,
        total_amount NUMERIC(10, 2) NOT NULL
    );

    -- 10. Order Items
    CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price NUMERIC(10, 2) NOT NULL,
        line_total NUMERIC(10, 2) NOT NULL
    );

    -- 11. Payments
    CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        payment_date TIMESTAMP NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        payment_provider VARCHAR(50) NOT NULL,
        payment_status VARCHAR(30) NOT NULL CHECK(payment_status IN ('captured', 'refunded', 'failed', 'authorized'))
    );

    -- 12. Shipments
    CREATE TABLE shipments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        carrier VARCHAR(50) NOT NULL,
        tracking_number VARCHAR(80) NOT NULL UNIQUE,
        shipped_date DATE,
        delivered_date DATE,
        delivery_status VARCHAR(40) NOT NULL CHECK(delivery_status IN ('delivered', 'in_transit', 'out_for_delivery', 'pending'))
    );

    -- 13. Product Reviews
    CREATE TABLE product_reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
        headline VARCHAR(150),
        review_text TEXT,
        created_at DATE NOT NULL
    );

    -- 14. Inventory Logs
    CREATE TABLE inventory_logs (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        change_type VARCHAR(40) NOT NULL CHECK(change_type IN ('restock', 'sale', 'damaged', 'return')),
        quantity_change INTEGER NOT NULL,
        previous_quantity INTEGER NOT NULL,
        new_quantity INTEGER NOT NULL,
        logged_at TIMESTAMP NOT NULL
    );

    -- 15. Marketing Campaigns
    CREATE TABLE marketing_campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        channel VARCHAR(50) NOT NULL,
        budget NUMERIC(10, 2) NOT NULL,
        spend NUMERIC(10, 2) NOT NULL,
        revenue_generated NUMERIC(12, 2) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL
    );
    """

    with engine.connect() as conn:
        print("[*] Creating 15 enterprise tables in Supabase...")
        for st in ddl_script.split(";"):
            if st.strip():
                conn.execute(text(st))
        conn.commit()
        print("[+] Tables successfully created!")

    # 2. Data Generators
    random.seed(42) # Deterministic data

    # 1. Departments (6 rows)
    departments_data = [
        ("Engineering & Product", "Sarah Connor", 1200000.00),
        ("Sales & Business Development", "Michael Scott", 850000.00),
        ("Marketing & Growth", "Don Draper", 650000.00),
        ("Customer Support", "Pam Beesly", 400000.00),
        ("Finance & Legal", "Gordon Gekko", 500000.00),
        ("Logistics & Supply Chain", "Walter White", 750000.00),
    ]

    # 2. Employees (30 rows)
    first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
                   "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
                   "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
                  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"]
    
    titles_by_dept = {
        1: ["Senior Full-Stack Engineer", "DevOps Architect", "Product Manager", "QA Automation Lead", "Data Scientist"],
        2: ["Account Executive", "Sales Director", "Enterprise Representative", "Inside Sales Lead", "Partnership Manager"],
        3: ["Growth Marketing Specialist", "SEO Lead", "Content Strategist", "Social Media Coordinator", "Paid Acquisition Manager"],
        4: ["Support Tier 2 Specialist", "Customer Success Lead", "Support Agent", "Onboarding Specialist", "Client Care Manager"],
        5: ["Senior Financial Analyst", "Staff Accountant", "Compliance Officer", "Billing Manager", "Controller"],
        6: ["Warehouse Supervisor", "Inventory Coordinator", "Fulfillment Specialist", "Procurement Manager", "Logistics Analyst"]
    }

    employees_rows = []
    for i in range(30):
        dept_id = (i % 6) + 1
        fn = first_names[i]
        ln = last_names[i]
        email = f"{fn.lower()}.{ln.lower()}@company.com"
        title = random.choice(titles_by_dept[dept_id])
        salary = round(random.uniform(55000, 165000), 2)
        hire_d = (date(2020, 1, 1) + timedelta(days=random.randint(0, 1400))).isoformat()
        employees_rows.append((dept_id, fn, ln, email, title, salary, hire_d))

    # 3. Suppliers (15 rows)
    suppliers_data = [
        ("Apex Micro Electronics", "Kenji Sato", "orders@apexmicro.jp", "+81-3-555-0192", "Japan", "Tokyo", 4.9),
        ("Nordic Pine Furnishings", "Freja Lind", "contact@nordicpine.se", "+46-8-555-0143", "Sweden", "Stockholm", 4.8),
        ("Bavarian Precision Hardware", "Hans Meyer", "sales@bavarianhw.de", "+49-89-555-0188", "Germany", "Munich", 4.7),
        ("SilkRoad Textiles Ltd", "Chen Wei", "info@silkroadtex.cn", "+86-21-555-0129", "China", "Shanghai", 4.4),
        ("Verona Leather & Craft", "Marco Rossi", "info@veronacraft.it", "+39-045-555-0177", "Italy", "Verona", 4.9),
        ("Cascade Gear Co", "Laura Adams", "supply@cascadegear.com", "+1-206-555-0199", "USA", "Seattle", 4.6),
        ("Seoul Display Tech", "Min-jun Kim", "export@seouldisplay.kr", "+82-2-555-0164", "South Korea", "Seoul", 4.8),
        ("Celtic Woodworks", "Sean O'Brien", "sales@celticwood.ie", "+353-1-555-0131", "Ireland", "Dublin", 4.5),
        ("Ontario Office Ergonomics", "Claire Dubois", "b2b@ontarioergo.ca", "+1-416-555-0182", "Canada", "Toronto", 4.7),
        ("Iberian Culinary Cookware", "Mateo Silva", "pedidos@iberiacook.es", "+34-91-555-0155", "Spain", "Madrid", 4.6),
        ("Taipei Component Foundry", "Hao Lin", "sales@taipeifoundry.tw", "+886-2-555-0122", "Taiwan", "Taipei", 4.8),
        ("Kyoto Ceramic House", "Yuki Tanaka", "export@kyotoceramics.jp", "+81-75-555-0111", "Japan", "Kyoto", 4.9),
        ("London Heritage Apparel", "Oliver Smith", "trade@londonheritage.uk", "+44-20-555-0144", "UK", "London", 4.5),
        ("Guadalajara Glass & Home", "Sofia Gomez", "ventas@guadalajaraglass.mx", "+52-33-555-0173", "Mexico", "Guadalajara", 4.3),
        ("Bengaluru Tech Components", "Arjun Patel", "contact@bengalurutech.in", "+91-80-555-0198", "India", "Bangalore", 4.7)
    ]

    # 4. Product Categories (8 rows)
    categories_data = [
        ("Electronics & Gadgets", "Consumer electronics, audio accessories, keyboards, and smart home appliances."),
        ("Office Furniture", "Ergonomic executive chairs, height-adjustable standing desks, and file organization."),
        ("Kitchen & Dining", "Cookware, thermal drinkware, ceramic drippers, and artisan culinary gear."),
        ("Apparel & Footwear", "Organic cotton everyday wear, weather-resistant jackets, and backpacks."),
        ("Home & Lighting", "Smart LED ambient lighting, air purifiers, and acoustic wall panels."),
        ("Fitness & Wellness", "Smart fitness bands, yoga mats, resistance bands, and foam rollers."),
        ("Outdoor & Travel", "Waterproof luggage, hiking gear, camping lanterns, and travel adapters."),
        ("Books & Stationery", "Dot-grid notebooks, fountain pens, desk organizers, and planners.")
    ]

    # 5. Products (50 rows)
    products_master = [
        (1, 1, "EL-101", "Ultra ANC Wireless Headphones Pro", 110.00, 299.99, 140, 30),
        (1, 7, "EL-102", "Studio Pro 4K 144Hz Monitor 27in", 280.00, 549.99, 65, 15),
        (1, 11, "EL-103", "Mechanical RGB Gaming Keyboard (Brown Switches)", 45.00, 129.50, 180, 40),
        (1, 11, "EL-104", "Wireless Ergonomic Vertical Mouse", 22.00, 69.99, 210, 50),
        (1, 1, "EL-105", "Noise-Cancelling True Wireless Earbuds", 38.00, 119.99, 250, 60),
        (1, 7, "EL-106", "Smart 4K HDR Streaming Hub", 28.00, 79.99, 320, 80),
        (1, 15, "EL-107", "Fast Charging 100W GaN Desktop Charger", 18.00, 49.99, 450, 100),
        (2, 9, "OF-201", "Ergonomic Lumbar Mesh Office Chair", 95.00, 289.00, 85, 20),
        (2, 2, "OF-202", "Motorized Dual-Motor Standing Desk (Oak Top)", 180.00, 519.00, 42, 10),
        (2, 8, "OF-203", "Solid Walnut Monitor Riser Stand", 24.00, 79.00, 115, 25),
        (2, 9, "OF-204", "Under-Desk Adjustable Footrest", 14.00, 42.50, 190, 30),
        (2, 3, "OF-205", "Heavy Duty Dual Monitor Gas-Spring Arm", 32.00, 99.00, 130, 25),
        (3, 10, "KT-301", "Cast Iron Pre-Seasoned Dutch Oven 6qt", 36.00, 95.00, 120, 30),
        (3, 12, "KT-302", "Artisan Ceramic Pour-Over Coffee Dripper", 11.00, 34.99, 340, 50),
        (3, 10, "KT-303", "Professional Damascus Steel Chef Knife 8in", 48.00, 149.00, 95, 20),
        (3, 14, "KT-304", "Thermal Stainless Steel Insulated Tumbler 32oz", 8.50, 28.00, 600, 100),
        (3, 12, "KT-305", "Handcrafted Matcha Tea Bowl Set", 16.00, 48.00, 175, 40),
        (4, 4, "AP-401", "Heavyweight Organic Cotton T-Shirt", 8.00, 32.00, 850, 150),
        (4, 4, "AP-402", "Brushed Fleece Zip Hoodie (Grey)", 22.00, 78.00, 420, 80),
        (4, 5, "AP-403", "Water-Resistant City Commuter Backpack 22L", 34.00, 115.00, 190, 40),
        (4, 5, "AP-404", "Full-Grain Italian Leather Everyday Belt", 18.00, 58.00, 230, 50),
        (4, 13, "AP-405", "Merino Wool Thermal Crew Socks (3-Pack)", 9.00, 29.50, 510, 100),
        (5, 1, "HM-501", "Smart WiFi Color-Changing Ambient Light Bar", 24.00, 68.00, 210, 40),
        (5, 7, "HM-502", "HEPA Ultra-Quiet Room Air Purifier", 55.00, 149.99, 75, 15),
        (5, 8, "HM-503", "Acoustic Felt Hexagonal Wall Tile Set (10-Pack)", 15.00, 45.00, 300, 50),
        (6, 6, "FT-601", "High-Density Non-Slip Cork Yoga Mat", 18.00, 52.00, 240, 50),
        (6, 6, "FT-602", "Adjustable Quick-Select Dumbbell Pair 50lb", 120.00, 299.00, 35, 10),
        (6, 11, "FT-603", "Percussive Deep Tissue Massage Gun", 39.00, 129.00, 110, 25),
        (7, 6, "OD-701", "Ultralight 2-Person Backpacking Tent", 85.00, 220.00, 60, 15),
        (7, 14, "OD-702", "Rechargeable LED Camping Lantern 1000lm", 12.00, 39.99, 310, 60),
        (7, 5, "OD-703", "Weatherproof Duffel Bag 65L", 31.00, 89.99, 145, 30),
        (8, 4, "BK-801", "Hardcover Dot Grid Executive Journal", 6.50, 24.00, 720, 120),
        (8, 3, "BK-802", "Brass Minimalist Refillable Rollerball Pen", 14.00, 42.00, 380, 70),
        (1, 15, "EL-108", "Magnetic Wireless MagSafe Power Bank 10000mAh", 17.00, 49.99, 410, 90),
        (1, 1, "EL-109", "Premium USB-C Condenser Microphone", 42.00, 119.00, 130, 30),
        (2, 2, "OF-206", "Solid Bamboo Desktop Drawer Organizer", 16.00, 48.00, 220, 40),
        (3, 10, "KT-306", "Non-Stick Ceramic Frying Pan Set", 30.00, 89.00, 160, 35),
        (4, 13, "AP-406", "Waterproof Shell Raincoat (Packable)", 38.00, 120.00, 170, 35),
        (5, 1, "HM-504", "Minimalist Sunset Projection Ambient Lamp", 12.00, 36.00, 400, 80),
        (6, 6, "FT-604", "Fabric Resistance Loop Bands Set (5-Levels)", 5.00, 19.99, 850, 150),
        (7, 6, "OD-704", "Double Camping Hammock with Tree Straps", 14.00, 39.00, 280, 50),
        (8, 4, "BK-803", "Vegan Leather Desk Blotter Mat 36x18", 11.00, 32.00, 450, 80),
        (1, 7, "EL-110", "Ultra-Slim 65W GaN Laptop Travel Adapter", 19.00, 54.99, 390, 75),
        (2, 9, "OF-207", "Cable Management Spine & Tray Kit", 12.00, 35.00, 310, 60),
        (3, 12, "KT-307", "Precision Electric Gooseneck Kettle", 38.00, 99.00, 140, 30),
        (4, 4, "AP-407", "Relaxed Fit Chino Trousers", 24.00, 75.00, 260, 50),
        (5, 8, "HM-505", "Smart Ultrasonic Aroma Diffuser", 16.00, 46.00, 290, 60),
        (6, 11, "FT-605", "Smart Bluetooth Body Composition Scale", 21.00, 59.99, 210, 40),
        (7, 14, "OD-705", "All-Weather Polarized Sunglasses", 18.00, 65.00, 320, 60),
        (8, 3, "BK-804", "Weekly Desk Pad Calendar & Habit Tracker", 7.00, 21.00, 550, 100)
    ]

    # 6. Customers (100 rows)
    countries_cities = [
        ("USA", "New York"), ("USA", "San Francisco"), ("USA", "Austin"), ("USA", "Seattle"), ("USA", "Chicago"),
        ("UK", "London"), ("UK", "Manchester"), ("Canada", "Toronto"), ("Canada", "Vancouver"),
        ("Germany", "Berlin"), ("Germany", "Frankfurt"), ("France", "Paris"), ("France", "Lyon"),
        ("Australia", "Sydney"), ("Australia", "Melbourne"), ("Japan", "Tokyo"), ("India", "Bangalore"),
        ("India", "Mumbai"), ("Italy", "Milan"), ("Spain", "Barcelona"), ("Mexico", "Mexico City")
    ]
    tiers = ["Bronze", "Bronze", "Silver", "Silver", "Gold", "Platinum"]
    
    customers_rows = []
    addresses_rows = []
    for cid in range(1, 101):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        email = f"{fn.lower()}.{ln.lower()}{cid}@example.com"
        phone = f"+1-{random.randint(200,999)}-555-{random.randint(1000,9999)}"
        c_country, c_city = random.choice(countries_cities)
        tier = random.choice(tiers)
        s_date = (date(2022, 1, 1) + timedelta(days=random.randint(0, 900))).isoformat()
        customers_rows.append((fn, ln, email, phone, c_country, c_city, tier, s_date))

        # Address for each customer
        street = f"{random.randint(100, 9999)} {random.choice(['Market St', 'Broadway', 'Oak Ave', 'Maple Rd', 'Pine Way', 'Elm St'])}"
        postal = f"{random.randint(10000, 99999)}"
        addresses_rows.append((cid, street, c_city, "Region", postal, c_country, True))

    # 7. Discounts (8 rows)
    discounts_data = [
        ("SUMMER10", 10, 50.00, True),
        ("WELCOME15", 15, 0.00, True),
        ("VIP25", 25, 150.00, True),
        ("BLACKFRIDAY", 30, 100.00, False),
        ("FREESHIP", 5, 40.00, True),
        ("SPRING20", 20, 80.00, True),
        ("TECHSALE", 12, 120.00, True),
        ("FLASH40", 40, 200.00, False)
    ]

    # 8. Orders & Order Items (300 orders, ~900 items)
    statuses = ["completed", "completed", "completed", "completed", "shipped", "processing", "pending", "cancelled"]
    pay_methods = ["Credit Card", "PayPal", "Apple Pay", "Google Pay", "Stripe", "Bank Transfer"]
    pay_providers = ["Stripe", "PayPal", "Adyen", "Square", "Authorize.net"]
    carriers = ["FedEx", "UPS", "DHL Express", "USPS Priority", "Royal Mail"]
    
    orders_rows = []
    order_items_rows = []
    payments_rows = []
    shipments_rows = []

    order_base_date = date(2023, 1, 1)
    
    for oid in range(1, 301):
        cust_id = random.randint(1, 100)
        disc_id = random.choice([None, None, None, 1, 2, 3, 5, 6, 7])
        o_date = order_base_date + timedelta(days=random.randint(0, 600))
        status = random.choice(statuses)
        pay_m = random.choice(pay_methods)

        # 1 to 5 items per order
        num_items = random.randint(1, 5)
        chosen_prods = random.sample(range(1, 51), num_items)

        items_subtotal = Decimal("0.00")
        for pid in chosen_prods:
            prod_price = Decimal(str(products_master[pid - 1][5]))
            qty = random.randint(1, 3)
            lt = prod_price * qty
            items_subtotal += lt
            order_items_rows.append((oid, pid, qty, float(prod_price), float(lt)))

        discount_val = Decimal("0.00")
        if disc_id:
            disc_pct = Decimal(str(discounts_data[disc_id - 1][1]))
            discount_val = items_subtotal * (disc_pct / Decimal("100"))

        tax = round((items_subtotal - discount_val) * Decimal("0.08"), 2)
        shipping = Decimal("0.00") if (items_subtotal > Decimal("100")) else Decimal("12.50")
        total_amt = round(items_subtotal - discount_val + tax + shipping, 2)

        orders_rows.append((cust_id, disc_id, o_date.isoformat(), status, pay_m, float(shipping), float(tax), float(total_amt)))

        # Payments record
        p_status = "captured" if status in ("completed", "shipped", "processing") else ("refunded" if status == "cancelled" else "authorized")
        p_date = datetime.combine(o_date, datetime.min.time()) + timedelta(minutes=random.randint(2, 45))
        payments_rows.append((oid, p_date.isoformat(), float(total_amt), random.choice(pay_providers), p_status))

        # Shipments record (for orders that were shipped or completed)
        if status in ("shipped", "completed"):
            ship_d = o_date + timedelta(days=random.randint(1, 2))
            deliv_d = ship_d + timedelta(days=random.randint(2, 5)) if status == "completed" else None
            deliv_status = "delivered" if status == "completed" else random.choice(["in_transit", "out_for_delivery"])
            tracking = f"TRK-{random.randint(10000000, 99999999)}"
            shipments_rows.append((oid, random.choice(carriers), tracking, ship_d.isoformat(), deliv_d.isoformat() if deliv_d else None, deliv_status))

    # 9. Product Reviews (250 reviews)
    headlines = [
        "Exceeded my expectations!", "Fantastic build quality", "Very good value for money",
        "Decent product, quick shipping", "Absolute game changer for my desk", "Solid performance",
        "Could be slightly better", "Works as advertised", "Highly recommend to colleagues", "Top tier design"
    ]
    reviews_rows = []
    for _ in range(250):
        pid = random.randint(1, 50)
        cid = random.randint(1, 100)
        rating = random.choices([5, 4, 3, 2, 1], weights=[50, 30, 10, 6, 4])[0]
        headline = random.choice(headlines)
        body = f"I have been using this for several weeks now. The quality and performance are {headline.lower()}."
        r_date = (date(2023, 2, 1) + timedelta(days=random.randint(0, 500))).isoformat()
        reviews_rows.append((pid, cid, rating, headline, body, r_date))

    # 10. Inventory Logs (350 logs)
    inv_logs_rows = []
    for _ in range(350):
        pid = random.randint(1, 50)
        change_t = random.choice(["sale", "sale", "sale", "restock", "restock", "return", "damaged"])
        q_change = random.randint(1, 3) if change_t == "sale" else (random.randint(20, 50) if change_t == "restock" else 1)
        if change_t in ("sale", "damaged"):
            q_change = -abs(q_change)
        prev_q = products_master[pid - 1][6]
        new_q = max(0, prev_q + q_change)
        log_dt = datetime.now() - timedelta(days=random.randint(1, 180), hours=random.randint(0, 23))
        inv_logs_rows.append((pid, change_t, q_change, prev_q, new_q, log_dt.isoformat()))

    # 11. Marketing Campaigns (12 campaigns)
    campaigns_data = [
        ("Q1 New Year Tech Kickoff", "Google Ads", 25000.00, 24500.00, 112000.00, "2023-01-05", "2023-02-15"),
        ("Spring Ergonomics Upgrade", "Meta / Instagram", 18000.00, 17850.00, 84300.00, "2023-03-01", "2023-04-15"),
        ("Earth Day Sustainable Apparel", "TikTok Influencer", 12000.00, 12000.00, 48900.00, "2023-04-10", "2023-04-30"),
        ("Summer Outdoor Gear Blast", "YouTube Sponsorships", 35000.00, 34200.00, 168000.00, "2023-05-15", "2023-07-01"),
        ("Back to School Desk Organization", "Pinterest & Search", 15000.00, 14900.00, 67200.00, "2023-08-01", "2023-09-15"),
        ("Autumn Gourmet Coffee & Kitchen", "Email Retargeting", 8000.00, 7800.00, 52400.00, "2023-09-20", "2023-10-31"),
        ("Early Black Friday Teaser", "Google Ads", 30000.00, 29800.00, 145000.00, "2023-11-01", "2023-11-20"),
        ("Cyber Week Mega Blitz", "Omnichannel (Meta+Google+TikTok)", 65000.00, 64950.00, 389000.00, "2023-11-21", "2023-11-30"),
        ("Holiday Gift Guide Push", "Affiliate Networks", 20000.00, 19500.00, 98000.00, "2023-12-01", "2023-12-23"),
        ("New Year Resolution Fitness", "Meta / Instagram", 22000.00, 21800.00, 94500.00, "2024-01-02", "2024-02-10"),
        ("Spring Workstation Renewal 2024", "LinkedIn B2B", 16000.00, 15900.00, 78000.00, "2024-03-01", "2024-04-15"),
        ("VIP Customer Appreciation", "SMS & Email", 5000.00, 4850.00, 41200.00, "2024-04-20", "2024-05-10")
    ]

    # Execute batch inserts
    print("[*] Seeding records into Supabase in parallel transactions...")
    with engine.connect() as conn:
        # Departments
        conn.execute(
            text("INSERT INTO departments (name, manager_name, annual_budget) VALUES (:n, :m, :b)"),
            [{"n": d[0], "m": d[1], "b": d[2]} for d in departments_data]
        )
        
        # Employees
        conn.execute(
            text("INSERT INTO employees (department_id, first_name, last_name, email, title, salary, hire_date) VALUES (:d, :fn, :ln, :em, :t, :s, :hd)"),
            [{"d": r[0], "fn": r[1], "ln": r[2], "em": r[3], "t": r[4], "s": r[5], "hd": r[6]} for r in employees_rows]
        )

        # Suppliers
        conn.execute(
            text("INSERT INTO suppliers (company_name, contact_name, email, phone, country, city, rating) VALUES (:c, :cn, :em, :p, :co, :ci, :r)"),
            [{"c": s[0], "cn": s[1], "em": s[2], "p": s[3], "co": s[4], "ci": s[5], "r": s[6]} for s in suppliers_data]
        )

        # Categories
        conn.execute(
            text("INSERT INTO product_categories (name, description) VALUES (:n, :d)"),
            [{"n": c[0], "d": c[1]} for c in categories_data]
        )

        # Products
        conn.execute(
            text("INSERT INTO products (category_id, supplier_id, sku, name, cost_price, price, stock_quantity, reorder_level) VALUES (:cat, :sup, :sku, :n, :cp, :p, :sq, :rl)"),
            [{"cat": p[0], "sup": p[1], "sku": p[2], "n": p[3], "cp": p[4], "p": p[5], "sq": p[6], "rl": p[7]} for p in products_master]
        )

        # Customers
        conn.execute(
            text("INSERT INTO customers (first_name, last_name, email, phone, country, city, loyalty_tier, signup_date) VALUES (:fn, :ln, :em, :p, :co, :ci, :lt, :sd)"),
            [{"fn": c[0], "ln": c[1], "em": c[2], "p": c[3], "co": c[4], "ci": c[5], "lt": c[6], "sd": c[7]} for c in customers_rows]
        )

        # Customer Addresses
        conn.execute(
            text("INSERT INTO customer_addresses (customer_id, street, city, state, postal_code, country, is_default) VALUES (:cid, :st, :ci, :s, :pc, :co, :def)"),
            [{"cid": a[0], "st": a[1], "ci": a[2], "s": a[3], "pc": a[4], "co": a[5], "def": a[6]} for a in addresses_rows]
        )

        # Discounts
        conn.execute(
            text("INSERT INTO discounts (code, discount_percent, min_order_amount, active) VALUES (:c, :dp, :moa, :act)"),
            [{"c": d[0], "dp": d[1], "moa": d[2], "act": d[3]} for d in discounts_data]
        )

        # Orders
        conn.execute(
            text("INSERT INTO orders (customer_id, discount_id, order_date, status, payment_method, shipping_fee, tax_amount, total_amount) VALUES (:cid, :did, :od, :st, :pm, :sf, :tx, :tot)"),
            [{"cid": o[0], "did": o[1], "od": o[2], "st": o[3], "pm": o[4], "sf": o[5], "tx": o[6], "tot": o[7]} for o in orders_rows]
        )

        # Order Items
        conn.execute(
            text("INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total) VALUES (:oid, :pid, :q, :up, :lt)"),
            [{"oid": it[0], "pid": it[1], "q": it[2], "up": it[3], "lt": it[4]} for it in order_items_rows]
        )

        # Payments
        conn.execute(
            text("INSERT INTO payments (order_id, payment_date, amount, payment_provider, payment_status) VALUES (:oid, :pd, :amt, :pp, :ps)"),
            [{"oid": py[0], "pd": py[1], "amt": py[2], "pp": py[3], "ps": py[4]} for py in payments_rows]
        )

        # Shipments
        conn.execute(
            text("INSERT INTO shipments (order_id, carrier, tracking_number, shipped_date, delivered_date, delivery_status) VALUES (:oid, :car, :trk, :sd, :dd, :ds)"),
            [{"oid": sh[0], "car": sh[1], "trk": sh[2], "sd": sh[3], "dd": sh[4], "ds": sh[5]} for sh in shipments_rows]
        )

        # Product Reviews
        conn.execute(
            text("INSERT INTO product_reviews (product_id, customer_id, rating, headline, review_text, created_at) VALUES (:pid, :cid, :r, :hl, :txt, :ca)"),
            [{"pid": rv[0], "cid": rv[1], "r": rv[2], "hl": rv[3], "txt": rv[4], "ca": rv[5]} for rv in reviews_rows]
        )

        # Inventory Logs
        conn.execute(
            text("INSERT INTO inventory_logs (product_id, change_type, quantity_change, previous_quantity, new_quantity, logged_at) VALUES (:pid, :ct, :qc, :pq, :nq, :la)"),
            [{"pid": il[0], "ct": il[1], "qc": il[2], "pq": il[3], "nq": il[4], "la": il[5]} for il in inv_logs_rows]
        )

        # Marketing Campaigns
        conn.execute(
            text("INSERT INTO marketing_campaigns (name, channel, budget, spend, revenue_generated, start_date, end_date) VALUES (:n, :c, :b, :s, :r, :sd, :ed)"),
            [{"n": mc[0], "c": mc[1], "b": mc[2], "s": mc[3], "r": mc[4], "sd": mc[5], "ed": mc[6]} for mc in campaigns_data]
        )

        conn.commit()

        # Print detailed report of all tables & rows
        tables = [
            "departments", "employees", "suppliers", "product_categories", "products",
            "customers", "customer_addresses", "discounts", "orders", "order_items",
            "payments", "shipments", "product_reviews", "inventory_logs", "marketing_campaigns"
        ]
        print("\n========================================================")
        print("  [SUCCESS] ENTERPRISE SUPABASE DATABASE SEEDED! ")
        print("========================================================")
        total_rows = 0
        for tbl in tables:
            cnt = conn.execute(text(f'SELECT COUNT(*) FROM "{tbl}"')).scalar()
            total_rows += cnt
            print(f"  [+] {tbl.ljust(22)} : {str(cnt).rjust(6)} rows")
        print("--------------------------------------------------------")
        print(f"  TOTAL RECORDS SEEDED    : {str(total_rows).rjust(6)} rows across 15 tables!")
        print("========================================================\n")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "postgresql://postgres:pP8M7xe9tHXETEVn@db.egpnulkdzlwodrmmdfqz.supabase.co:5432/postgres"
    generate_and_seed_enterprise_db(url)
