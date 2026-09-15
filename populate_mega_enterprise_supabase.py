import os
import sys
import random
from datetime import datetime, timedelta, date
from decimal import Decimal
from sqlalchemy import create_engine, text

def populate_mega_enterprise_supabase(db_url: str):
    print("[*] Connecting to Supabase PostgreSQL database...")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        connect_args={
            "connect_timeout": 30,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5
        }
    )

    # 1. DDL Schema Definition for 40 Enterprise Tables
    ddl_statements = [
        # Drop existing tables with CASCADE to ensure clean state
        """
        DROP TABLE IF EXISTS customer_subscriptions CASCADE;
        DROP TABLE IF EXISTS subscription_plans CASCADE;
        DROP TABLE IF EXISTS invoices CASCADE;
        DROP TABLE IF EXISTS chart_of_accounts CASCADE;
        DROP TABLE IF EXISTS affiliate_partners CASCADE;
        DROP TABLE IF EXISTS web_sessions CASCADE;
        DROP TABLE IF EXISTS email_campaign_logs CASCADE;
        DROP TABLE IF EXISTS marketing_campaigns CASCADE;
        DROP TABLE IF EXISTS customer_satisfaction_surveys CASCADE;
        DROP TABLE IF EXISTS support_ticket_messages CASCADE;
        DROP TABLE IF EXISTS support_tickets CASCADE;
        DROP TABLE IF EXISTS shipments CASCADE;
        DROP TABLE IF EXISTS shipping_carriers CASCADE;
        DROP TABLE IF EXISTS payments CASCADE;
        DROP TABLE IF EXISTS order_items CASCADE;
        DROP TABLE IF EXISTS orders CASCADE;
        DROP TABLE IF EXISTS discounts CASCADE;
        DROP TABLE IF EXISTS product_reviews CASCADE;
        DROP TABLE IF EXISTS customer_wishlists CASCADE;
        DROP TABLE IF EXISTS customer_addresses CASCADE;
        DROP TABLE IF EXISTS customers CASCADE;
        DROP TABLE IF EXISTS product_tag_mappings CASCADE;
        DROP TABLE IF EXISTS product_tags CASCADE;
        DROP TABLE IF EXISTS product_variants CASCADE;
        DROP TABLE IF EXISTS products CASCADE;
        DROP TABLE IF EXISTS product_categories CASCADE;
        DROP TABLE IF EXISTS inventory_logs CASCADE;
        DROP TABLE IF EXISTS warehouse_inventory CASCADE;
        DROP TABLE IF EXISTS warehouse_locations CASCADE;
        DROP TABLE IF EXISTS warehouses CASCADE;
        DROP TABLE IF EXISTS purchase_order_items CASCADE;
        DROP TABLE IF EXISTS purchase_orders CASCADE;
        DROP TABLE IF EXISTS supplier_contracts CASCADE;
        DROP TABLE IF EXISTS suppliers CASCADE;
        DROP TABLE IF EXISTS performance_reviews CASCADE;
        DROP TABLE IF EXISTS employee_leave_requests CASCADE;
        DROP TABLE IF EXISTS payroll_records CASCADE;
        DROP TABLE IF EXISTS employees CASCADE;
        DROP TABLE IF EXISTS job_roles CASCADE;
        DROP TABLE IF EXISTS departments CASCADE;
        """,

        # Category 1: Human Resources & Organization
        """
        CREATE TABLE departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(80) NOT NULL UNIQUE,
            code VARCHAR(20) NOT NULL UNIQUE,
            manager_name VARCHAR(100) NOT NULL,
            annual_budget NUMERIC(14, 2) NOT NULL,
            location VARCHAR(80) NOT NULL
        );
        """,
        """
        CREATE TABLE job_roles (
            id SERIAL PRIMARY KEY,
            department_id INTEGER NOT NULL REFERENCES departments(id),
            title VARCHAR(100) NOT NULL,
            min_salary NUMERIC(10, 2) NOT NULL,
            max_salary NUMERIC(10, 2) NOT NULL,
            experience_level VARCHAR(30) NOT NULL CHECK(experience_level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Executive'))
        );
        """,
        """
        CREATE TABLE employees (
            id SERIAL PRIMARY KEY,
            department_id INTEGER NOT NULL REFERENCES departments(id),
            job_role_id INTEGER NOT NULL REFERENCES job_roles(id),
            first_name VARCHAR(60) NOT NULL,
            last_name VARCHAR(60) NOT NULL,
            email VARCHAR(120) NOT NULL UNIQUE,
            phone VARCHAR(40) NOT NULL,
            salary NUMERIC(10, 2) NOT NULL,
            hire_date DATE NOT NULL,
            employment_status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK(employment_status IN ('active', 'on_leave', 'terminated'))
        );
        """,
        """
        CREATE TABLE payroll_records (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
            pay_period_month INTEGER NOT NULL CHECK(pay_period_month BETWEEN 1 AND 12),
            pay_period_year INTEGER NOT NULL,
            base_salary NUMERIC(10, 2) NOT NULL,
            bonus NUMERIC(10, 2) NOT NULL DEFAULT 0,
            deductions NUMERIC(10, 2) NOT NULL DEFAULT 0,
            net_pay NUMERIC(10, 2) NOT NULL,
            payment_date DATE NOT NULL
        );
        """,
        """
        CREATE TABLE employee_leave_requests (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
            leave_type VARCHAR(40) NOT NULL CHECK(leave_type IN ('vacation', 'sick', 'parental', 'unpaid', 'bereavement')),
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            total_days INTEGER NOT NULL,
            status VARCHAR(30) NOT NULL CHECK(status IN ('approved', 'pending', 'rejected'))
        );
        """,
        """
        CREATE TABLE performance_reviews (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
            reviewer_id INTEGER NOT NULL REFERENCES employees(id),
            review_period VARCHAR(30) NOT NULL,
            performance_score INTEGER NOT NULL CHECK(performance_score BETWEEN 1 AND 5),
            feedback_summary TEXT,
            promotion_eligible BOOLEAN DEFAULT false
        );
        """,

        # Category 2: Suppliers & Procurement
        """
        CREATE TABLE suppliers (
            id SERIAL PRIMARY KEY,
            company_name VARCHAR(120) NOT NULL,
            contact_name VARCHAR(100) NOT NULL,
            email VARCHAR(120) NOT NULL,
            phone VARCHAR(40) NOT NULL,
            country VARCHAR(60) NOT NULL,
            city VARCHAR(60) NOT NULL,
            payment_terms VARCHAR(40) NOT NULL DEFAULT 'Net 30',
            rating NUMERIC(3, 1) DEFAULT 4.5
        );
        """,
        """
        CREATE TABLE supplier_contracts (
            id SERIAL PRIMARY KEY,
            supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
            contract_number VARCHAR(60) NOT NULL UNIQUE,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            annual_commitment_value NUMERIC(12, 2) NOT NULL,
            status VARCHAR(30) NOT NULL CHECK(status IN ('active', 'expired', 'under_review'))
        );
        """,
        """
        CREATE TABLE purchase_orders (
            id SERIAL PRIMARY KEY,
            supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
            order_date DATE NOT NULL,
            expected_delivery_date DATE NOT NULL,
            status VARCHAR(30) NOT NULL CHECK(status IN ('draft', 'sent', 'received', 'cancelled')),
            total_cost NUMERIC(12, 2) NOT NULL,
            approved_by_employee_id INTEGER REFERENCES employees(id)
        );
        """,

        # Category 3: Warehousing & Inventory Logistics
        """
        CREATE TABLE warehouses (
            id SERIAL PRIMARY KEY,
            warehouse_code VARCHAR(30) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            city VARCHAR(60) NOT NULL,
            state VARCHAR(60),
            country VARCHAR(60) NOT NULL,
            capacity_sqft INTEGER NOT NULL,
            operational_status VARCHAR(30) NOT NULL DEFAULT 'operational'
        );
        """,
        """
        CREATE TABLE warehouse_locations (
            id SERIAL PRIMARY KEY,
            warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
            aisle VARCHAR(20) NOT NULL,
            shelf VARCHAR(20) NOT NULL,
            bin_code VARCHAR(30) NOT NULL,
            zone_type VARCHAR(40) NOT NULL DEFAULT 'ambient'
        );
        """,

        # Category 4: Products & Catalog
        """
        CREATE TABLE product_categories (
            id SERIAL PRIMARY KEY,
            parent_category_id INTEGER REFERENCES product_categories(id),
            name VARCHAR(80) NOT NULL UNIQUE,
            slug VARCHAR(80) NOT NULL UNIQUE,
            description TEXT
        );
        """,
        """
        CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            category_id INTEGER NOT NULL REFERENCES product_categories(id),
            supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
            sku VARCHAR(50) NOT NULL UNIQUE,
            name VARCHAR(150) NOT NULL,
            description TEXT,
            cost_price NUMERIC(10, 2) NOT NULL,
            price NUMERIC(10, 2) NOT NULL,
            msrp NUMERIC(10, 2) NOT NULL,
            stock_quantity INTEGER NOT NULL,
            reorder_level INTEGER NOT NULL DEFAULT 20,
            is_active BOOLEAN DEFAULT true
        );
        """,
        """
        CREATE TABLE product_variants (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            sku_variant VARCHAR(60) NOT NULL UNIQUE,
            color VARCHAR(40),
            size VARCHAR(30),
            material VARCHAR(60),
            additional_cost NUMERIC(8, 2) DEFAULT 0,
            stock_quantity INTEGER NOT NULL DEFAULT 0
        );
        """,
        """
        CREATE TABLE product_tags (
            id SERIAL PRIMARY KEY,
            tag_name VARCHAR(50) NOT NULL UNIQUE,
            slug VARCHAR(50) NOT NULL UNIQUE
        );
        """,
        """
        CREATE TABLE product_tag_mappings (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            tag_id INTEGER NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
            UNIQUE(product_id, tag_id)
        );
        """,
        """
        CREATE TABLE purchase_order_items (
            id SERIAL PRIMARY KEY,
            purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id),
            quantity_ordered INTEGER NOT NULL,
            quantity_received INTEGER NOT NULL DEFAULT 0,
            unit_cost NUMERIC(10, 2) NOT NULL,
            total_cost NUMERIC(12, 2) NOT NULL
        );
        """,
        """
        CREATE TABLE warehouse_inventory (
            id SERIAL PRIMARY KEY,
            warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity_on_hand INTEGER NOT NULL,
            quantity_reserved INTEGER NOT NULL DEFAULT 0,
            quantity_available INTEGER NOT NULL,
            last_counted_at DATE NOT NULL
        );
        """,
        """
        CREATE TABLE inventory_logs (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            warehouse_id INTEGER REFERENCES warehouses(id),
            change_type VARCHAR(40) NOT NULL CHECK(change_type IN ('restock', 'sale', 'damaged', 'return', 'audit_adjustment')),
            quantity_change INTEGER NOT NULL,
            previous_quantity INTEGER NOT NULL,
            new_quantity INTEGER NOT NULL,
            logged_at TIMESTAMP NOT NULL
        );
        """,

        # Category 5: Customers & Profiles
        """
        CREATE TABLE customers (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(60) NOT NULL,
            last_name VARCHAR(60) NOT NULL,
            email VARCHAR(120) NOT NULL UNIQUE,
            phone VARCHAR(40),
            country VARCHAR(60) NOT NULL,
            city VARCHAR(60) NOT NULL,
            loyalty_tier VARCHAR(20) NOT NULL DEFAULT 'Bronze' CHECK(loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
            lifetime_spend NUMERIC(12, 2) DEFAULT 0,
            signup_date DATE NOT NULL
        );
        """,
        """
        CREATE TABLE customer_addresses (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            address_type VARCHAR(30) NOT NULL DEFAULT 'shipping' CHECK(address_type IN ('shipping', 'billing')),
            street VARCHAR(150) NOT NULL,
            city VARCHAR(60) NOT NULL,
            state VARCHAR(60),
            postal_code VARCHAR(30) NOT NULL,
            country VARCHAR(60) NOT NULL,
            is_default BOOLEAN DEFAULT true
        );
        """,
        """
        CREATE TABLE customer_wishlists (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
            date_added DATE NOT NULL,
            UNIQUE(customer_id, product_id)
        );
        """,
        """
        CREATE TABLE product_reviews (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
            verified_purchase BOOLEAN DEFAULT true,
            headline VARCHAR(150),
            review_text TEXT,
            helpful_votes INTEGER DEFAULT 0,
            created_at DATE NOT NULL
        );
        """,

        # Category 6: E-Commerce Orders, Payments & Logistics
        """
        CREATE TABLE discounts (
            id SERIAL PRIMARY KEY,
            code VARCHAR(40) NOT NULL UNIQUE,
            description VARCHAR(150),
            discount_type VARCHAR(30) NOT NULL DEFAULT 'percentage' CHECK(discount_type IN ('percentage', 'fixed_amount')),
            discount_value NUMERIC(8, 2) NOT NULL,
            min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
            usage_limit INTEGER,
            times_used INTEGER DEFAULT 0,
            active BOOLEAN DEFAULT true,
            expires_at DATE
        );
        """,
        """
        CREATE TABLE orders (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER NOT NULL REFERENCES customers(id),
            discount_id INTEGER REFERENCES discounts(id),
            order_date DATE NOT NULL,
            status VARCHAR(30) NOT NULL CHECK(status IN ('completed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'pending')),
            payment_method VARCHAR(40) NOT NULL,
            payment_status VARCHAR(30) NOT NULL DEFAULT 'paid' CHECK(payment_status IN ('paid', 'pending', 'refunded', 'failed')),
            shipping_fee NUMERIC(8, 2) NOT NULL DEFAULT 0,
            tax_amount NUMERIC(8, 2) NOT NULL DEFAULT 0,
            total_amount NUMERIC(10, 2) NOT NULL
        );
        """,
        """
        CREATE TABLE order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id),
            variant_id INTEGER REFERENCES product_variants(id),
            quantity INTEGER NOT NULL,
            unit_price NUMERIC(10, 2) NOT NULL,
            discount_applied NUMERIC(8, 2) NOT NULL DEFAULT 0,
            line_total NUMERIC(10, 2) NOT NULL
        );
        """,
        """
        CREATE TABLE payments (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            transaction_id VARCHAR(80) NOT NULL UNIQUE,
            payment_date TIMESTAMP NOT NULL,
            amount NUMERIC(10, 2) NOT NULL,
            payment_provider VARCHAR(50) NOT NULL,
            payment_status VARCHAR(30) NOT NULL CHECK(payment_status IN ('captured', 'refunded', 'authorized', 'failed'))
        );
        """,
        """
        CREATE TABLE shipping_carriers (
            id SERIAL PRIMARY KEY,
            carrier_name VARCHAR(60) NOT NULL UNIQUE,
            carrier_code VARCHAR(30) NOT NULL UNIQUE,
            tracking_url_template VARCHAR(200),
            service_level VARCHAR(40) NOT NULL
        );
        """,
        """
        CREATE TABLE shipments (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            carrier_id INTEGER NOT NULL REFERENCES shipping_carriers(id),
            tracking_number VARCHAR(80) NOT NULL UNIQUE,
            origin_warehouse_id INTEGER REFERENCES warehouses(id),
            shipped_date DATE,
            estimated_delivery_date DATE,
            delivered_date DATE,
            delivery_status VARCHAR(40) NOT NULL CHECK(delivery_status IN ('delivered', 'in_transit', 'out_for_delivery', 'delayed', 'pending', 'exception'))
        );
        """,

        # Category 7: Customer Support & Surveys
        """
        CREATE TABLE support_tickets (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            assigned_employee_id INTEGER REFERENCES employees(id),
            order_id INTEGER REFERENCES orders(id),
            subject VARCHAR(150) NOT NULL,
            category VARCHAR(50) NOT NULL CHECK(category IN ('billing', 'shipping', 'product_defect', 'return', 'general_inquiry', 'account')),
            priority VARCHAR(30) NOT NULL CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
            status VARCHAR(30) NOT NULL CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
            created_at TIMESTAMP NOT NULL,
            resolved_at TIMESTAMP
        );
        """,
        """
        CREATE TABLE support_ticket_messages (
            id SERIAL PRIMARY KEY,
            ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
            sender_role VARCHAR(30) NOT NULL CHECK(sender_role IN ('customer', 'support_agent', 'system')),
            message_body TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL
        );
        """,
        """
        CREATE TABLE customer_satisfaction_surveys (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            order_id INTEGER REFERENCES orders(id),
            ticket_id INTEGER REFERENCES support_tickets(id),
            nps_score INTEGER NOT NULL CHECK(nps_score BETWEEN 0 AND 10),
            csat_score INTEGER NOT NULL CHECK(csat_score BETWEEN 1 AND 5),
            comments TEXT,
            survey_date DATE NOT NULL
        );
        """,

        # Category 8: Marketing, Digital Analytics & Affiliates
        """
        CREATE TABLE marketing_campaigns (
            id SERIAL PRIMARY KEY,
            campaign_name VARCHAR(120) NOT NULL,
            channel VARCHAR(60) NOT NULL,
            target_audience VARCHAR(100),
            budget NUMERIC(10, 2) NOT NULL,
            actual_spend NUMERIC(10, 2) NOT NULL,
            revenue_generated NUMERIC(12, 2) NOT NULL,
            roi_percentage NUMERIC(6, 2) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            status VARCHAR(30) NOT NULL CHECK(status IN ('active', 'completed', 'scheduled', 'paused'))
        );
        """,
        """
        CREATE TABLE email_campaign_logs (
            id SERIAL PRIMARY KEY,
            campaign_id INTEGER NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
            customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            email_subject VARCHAR(150) NOT NULL,
            sent_at TIMESTAMP NOT NULL,
            opened BOOLEAN DEFAULT false,
            clicked BOOLEAN DEFAULT false,
            unsubscribed BOOLEAN DEFAULT false
        );
        """,
        """
        CREATE TABLE web_sessions (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER REFERENCES customers(id),
            session_start TIMESTAMP NOT NULL,
            duration_seconds INTEGER NOT NULL,
            landing_page VARCHAR(150) NOT NULL,
            traffic_medium VARCHAR(50) NOT NULL CHECK(traffic_medium IN ('cpc', 'organic', 'social', 'email', 'direct', 'referral')),
            device_type VARCHAR(30) NOT NULL CHECK(device_type IN ('mobile', 'desktop', 'tablet')),
            browser VARCHAR(40) NOT NULL,
            converted_to_order BOOLEAN DEFAULT false
        );
        """,
        """
        CREATE TABLE affiliate_partners (
            id SERIAL PRIMARY KEY,
            partner_name VARCHAR(100) NOT NULL,
            website VARCHAR(120),
            contact_email VARCHAR(120) NOT NULL UNIQUE,
            commission_rate_pct NUMERIC(4, 2) NOT NULL,
            total_referrals INTEGER DEFAULT 0,
            total_commission_earned NUMERIC(10, 2) DEFAULT 0,
            payout_status VARCHAR(30) NOT NULL DEFAULT 'current' CHECK(payout_status IN ('current', 'pending', 'review'))
        );
        """,

        # Category 9: Financial Accounting & Subscriptions
        """
        CREATE TABLE chart_of_accounts (
            id SERIAL PRIMARY KEY,
            account_code VARCHAR(30) NOT NULL UNIQUE,
            account_name VARCHAR(100) NOT NULL,
            account_category VARCHAR(40) NOT NULL CHECK(account_category IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
            balance NUMERIC(14, 2) NOT NULL DEFAULT 0
        );
        """,
        """
        CREATE TABLE invoices (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            customer_id INTEGER NOT NULL REFERENCES customers(id),
            invoice_number VARCHAR(60) NOT NULL UNIQUE,
            invoice_date DATE NOT NULL,
            due_date DATE NOT NULL,
            subtotal NUMERIC(10, 2) NOT NULL,
            tax NUMERIC(8, 2) NOT NULL,
            total NUMERIC(10, 2) NOT NULL,
            status VARCHAR(30) NOT NULL CHECK(status IN ('paid', 'pending', 'overdue', 'cancelled'))
        );
        """,
        """
        CREATE TABLE subscription_plans (
            id SERIAL PRIMARY KEY,
            plan_name VARCHAR(60) NOT NULL UNIQUE,
            billing_interval VARCHAR(20) NOT NULL CHECK(billing_interval IN ('monthly', 'annual')),
            price NUMERIC(8, 2) NOT NULL,
            trial_period_days INTEGER DEFAULT 14,
            features_summary TEXT,
            is_active BOOLEAN DEFAULT true
        );
        """,
        """
        CREATE TABLE customer_subscriptions (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
            status VARCHAR(30) NOT NULL CHECK(status IN ('active', 'trialing', 'past_due', 'cancelled')),
            start_date DATE NOT NULL,
            renewal_date DATE NOT NULL,
            cancelled_at DATE,
            mrr_value NUMERIC(8, 2) NOT NULL
        );
        """
    ]

    print(f"[*] Executing DDL schema statements (40 Enterprise Tables)...")
    with engine.connect() as conn:
        for idx, statement in enumerate(ddl_statements):
            conn.execute(text(statement))
        conn.commit()
    print("[+] All 40 Enterprise Tables created with constraints, foreign keys and indexes!")

    # 2. SEED DATA GENERATION
    random.seed(2024)

    # Departments (8 rows)
    departments_data = [
        {"name": "Engineering & Technology", "code": "ENG", "manager_name": "Sarah Connor", "annual_budget": 2500000.00, "location": "San Francisco, CA"},
        {"name": "Sales & Global Partnerships", "code": "SLS", "manager_name": "Michael Scott", "annual_budget": 1800000.00, "location": "New York, NY"},
        {"name": "Marketing & Brand Strategy", "code": "MKT", "manager_name": "Don Draper", "annual_budget": 1400000.00, "location": "Austin, TX"},
        {"name": "Customer Care & Support", "code": "SUP", "manager_name": "Pam Beesly", "annual_budget": 750000.00, "location": "Chicago, IL"},
        {"name": "Finance & Accounting", "code": "FIN", "manager_name": "Gordon Gekko", "annual_budget": 950000.00, "location": "New York, NY"},
        {"name": "Supply Chain & Warehousing", "code": "SCM", "manager_name": "Walter White", "annual_budget": 1600000.00, "location": "Seattle, WA"},
        {"name": "Human Resources & Talent", "code": "HR", "manager_name": "Toby Flenderson", "annual_budget": 600000.00, "location": "Austin, TX"},
        {"name": "Legal & Corporate Compliance", "code": "LGL", "manager_name": "Kim Wexler", "annual_budget": 850000.00, "location": "San Francisco, CA"}
    ]

    # Job Roles (25 roles)
    job_roles_data = [
        {"department_id": 1, "title": "VP of Engineering", "min_salary": 200000, "max_salary": 280000, "experience_level": "Executive"},
        {"department_id": 1, "title": "Lead Software Architect", "min_salary": 160000, "max_salary": 210000, "experience_level": "Lead"},
        {"department_id": 1, "title": "Senior Full-Stack Engineer", "min_salary": 125000, "max_salary": 165000, "experience_level": "Senior"},
        {"department_id": 1, "title": "DevOps / Infrastructure Engineer", "min_salary": 115000, "max_salary": 155000, "experience_level": "Mid"},
        {"department_id": 1, "title": "Junior Backend Developer", "min_salary": 75000, "max_salary": 95000, "experience_level": "Entry"},
        {"department_id": 2, "title": "Director of Sales", "min_salary": 150000, "max_salary": 220000, "experience_level": "Executive"},
        {"department_id": 2, "title": "Enterprise Account Executive", "min_salary": 100000, "max_salary": 160000, "experience_level": "Senior"},
        {"department_id": 2, "title": "Business Development Representative", "min_salary": 60000, "max_salary": 85000, "experience_level": "Entry"},
        {"department_id": 3, "title": "Head of Marketing", "min_salary": 140000, "max_salary": 195000, "experience_level": "Lead"},
        {"department_id": 3, "title": "Performance Marketing Manager", "min_salary": 95000, "max_salary": 135000, "experience_level": "Senior"},
        {"department_id": 3, "title": "Content & SEO Specialist", "min_salary": 65000, "max_salary": 90000, "experience_level": "Mid"},
        {"department_id": 4, "title": "Customer Support Director", "min_salary": 110000, "max_salary": 150000, "experience_level": "Lead"},
        {"department_id": 4, "title": "Tier 2 Technical Support Engineer", "min_salary": 70000, "max_salary": 95000, "experience_level": "Mid"},
        {"department_id": 4, "title": "Customer Support Representative", "min_salary": 45000, "max_salary": 62000, "experience_level": "Entry"},
        {"department_id": 5, "title": "Chief Financial Officer", "min_salary": 210000, "max_salary": 310000, "experience_level": "Executive"},
        {"department_id": 5, "title": "Senior Financial Controller", "min_salary": 120000, "max_salary": 160000, "experience_level": "Senior"},
        {"department_id": 5, "title": "Staff Accountant", "min_salary": 68000, "max_salary": 88000, "experience_level": "Mid"},
        {"department_id": 6, "title": "Supply Chain Director", "min_salary": 145000, "max_salary": 190000, "experience_level": "Lead"},
        {"department_id": 6, "title": "Regional Warehouse Manager", "min_salary": 85000, "max_salary": 120000, "experience_level": "Senior"},
        {"department_id": 6, "title": "Logistics & Fleet Coordinator", "min_salary": 55000, "max_salary": 78000, "experience_level": "Mid"},
        {"department_id": 7, "title": "VP of People Operations", "min_salary": 150000, "max_salary": 205000, "experience_level": "Executive"},
        {"department_id": 7, "title": "Technical Recruiter", "min_salary": 75000, "max_salary": 105000, "experience_level": "Mid"},
        {"department_id": 7, "title": "HR Generalist", "min_salary": 60000, "max_salary": 82000, "experience_level": "Entry"},
        {"department_id": 8, "title": "General Counsel", "min_salary": 190000, "max_salary": 270000, "experience_level": "Executive"},
        {"department_id": 8, "title": "Regulatory Compliance Officer", "min_salary": 110000, "max_salary": 150000, "experience_level": "Senior"}
    ]

    # Employees (50 employees)
    first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
                   "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
                   "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra",
                   "Paul", "Ashley", "Steven", "Kimberly", "Andrew", "Emily", "Kenneth", "Donna", "Joshua", "Michelle",
                   "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah", "Ronald", "Stephanie"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
                  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
                  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
                  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"]

    employees_data = []
    for i in range(50):
        role_idx = i % len(job_roles_data)
        role = job_roles_data[role_idx]
        fn = first_names[i]
        ln = last_names[i]
        dept_id = role["department_id"]
        salary = round(random.uniform(float(role["min_salary"]), float(role["max_salary"])), 2)
        hire_d = (date(2019, 1, 15) + timedelta(days=random.randint(0, 1600))).isoformat()
        employees_data.append({
            "department_id": dept_id,
            "job_role_id": role_idx + 1,
            "first_name": fn,
            "last_name": ln,
            "email": f"{fn.lower()}.{ln.lower()}{i+1}@enterprise.com",
            "phone": f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "salary": salary,
            "hire_date": hire_d,
            "employment_status": "active" if i < 48 else "on_leave"
        })

    # Payroll records (600 rows: 12 months for 50 employees)
    payroll_data = []
    for emp_id in range(1, 51):
        base_sal = round(employees_data[emp_id - 1]["salary"] / 12, 2)
        for month in range(1, 13):
            bonus = round(random.choice([0, 0, 0, 250.0, 500.0, 1200.0]), 2)
            deductions = round(base_sal * 0.18, 2)
            net_pay = round(base_sal + bonus - deductions, 2)
            pay_d = date(2023, month, 28).isoformat()
            payroll_data.append({
                "employee_id": emp_id,
                "pay_period_month": month,
                "pay_period_year": 2023,
                "base_salary": base_sal,
                "bonus": bonus,
                "deductions": deductions,
                "net_pay": net_pay,
                "payment_date": pay_d
            })

    # Employee Leave Requests (200 records)
    leave_types = ["vacation", "sick", "parental", "unpaid", "bereavement"]
    leave_statuses = ["approved", "approved", "approved", "pending", "rejected"]
    leave_requests_data = []
    for _ in range(200):
        emp_id = random.randint(1, 50)
        l_type = random.choice(leave_types)
        days = random.randint(1, 14)
        s_date = date(2023, 1, 1) + timedelta(days=random.randint(0, 500))
        e_date = s_date + timedelta(days=days)
        leave_requests_data.append({
            "employee_id": emp_id,
            "leave_type": l_type,
            "start_date": s_date.isoformat(),
            "end_date": e_date.isoformat(),
            "total_days": days,
            "status": random.choice(leave_statuses)
        })

    # Performance Reviews (100 reviews)
    perf_reviews_data = []
    for r_id in range(1, 101):
        emp_id = (r_id % 50) + 1
        reviewer_id = random.choice([1, 6, 9, 12, 15, 18, 21, 24]) # Directors / Executives
        score = random.choices([5, 4, 3, 2], weights=[25, 45, 25, 5])[0]
        promotable = score >= 4 and random.random() > 0.4
        perf_reviews_data.append({
            "employee_id": emp_id,
            "reviewer_id": reviewer_id,
            "review_period": "2023-H2" if r_id > 50 else "2023-H1",
            "performance_score": score,
            "feedback_summary": f"Exemplary dedication, hit key OKRs. Collaboration score: {score * 20}%.",
            "promotion_eligible": promotable
        })

    # Suppliers (20 suppliers)
    suppliers_data = [
        {"company_name": "Apex Micro Electronics", "contact_name": "Kenji Sato", "email": "orders@apexmicro.jp", "phone": "+81-3-555-0192", "country": "Japan", "city": "Tokyo", "payment_terms": "Net 30", "rating": 4.9},
        {"company_name": "Nordic Pine Furnishings", "contact_name": "Freja Lind", "email": "contact@nordicpine.se", "phone": "+46-8-555-0143", "country": "Sweden", "city": "Stockholm", "payment_terms": "Net 60", "rating": 4.8},
        {"company_name": "Bavarian Precision Hardware", "contact_name": "Hans Meyer", "email": "sales@bavarianhw.de", "phone": "+49-89-555-0188", "country": "Germany", "city": "Munich", "payment_terms": "Net 30", "rating": 4.7},
        {"company_name": "SilkRoad Textiles Ltd", "contact_name": "Chen Wei", "email": "info@silkroadtex.cn", "phone": "+86-21-555-0129", "country": "China", "city": "Shanghai", "payment_terms": "Net 30", "rating": 4.4},
        {"company_name": "Verona Leather & Craft", "contact_name": "Marco Rossi", "email": "info@veronacraft.it", "phone": "+39-045-555-0177", "country": "Italy", "city": "Verona", "payment_terms": "Net 30", "rating": 4.9},
        {"company_name": "Cascade Gear Co", "contact_name": "Laura Adams", "email": "supply@cascadegear.com", "phone": "+1-206-555-0199", "country": "USA", "city": "Seattle", "payment_terms": "Net 30", "rating": 4.6},
        {"company_name": "Seoul Display Tech", "contact_name": "Min-jun Kim", "email": "export@seouldisplay.kr", "phone": "+82-2-555-0164", "country": "South Korea", "city": "Seoul", "payment_terms": "Net 60", "rating": 4.8},
        {"company_name": "Celtic Woodworks", "contact_name": "Sean O'Brien", "email": "sales@celticwood.ie", "phone": "+353-1-555-0131", "country": "Ireland", "city": "Dublin", "payment_terms": "Net 30", "rating": 4.5},
        {"company_name": "Ontario Ergonomics", "contact_name": "Claire Dubois", "email": "b2b@ontarioergo.ca", "phone": "+1-416-555-0182", "country": "Canada", "city": "Toronto", "payment_terms": "Net 30", "rating": 4.7},
        {"company_name": "Iberian Cookware", "contact_name": "Mateo Silva", "email": "pedidos@iberiacook.es", "phone": "+34-91-555-0155", "country": "Spain", "city": "Madrid", "payment_terms": "Net 30", "rating": 4.6},
        {"company_name": "Taipei Foundry", "contact_name": "Hao Lin", "email": "sales@taipeifoundry.tw", "phone": "+886-2-555-0122", "country": "Taiwan", "city": "Taipei", "payment_terms": "Net 60", "rating": 4.8},
        {"company_name": "Kyoto Ceramic House", "contact_name": "Yuki Tanaka", "email": "export@kyotoceramics.jp", "phone": "+81-75-555-0111", "country": "Japan", "city": "Kyoto", "payment_terms": "Net 30", "rating": 4.9},
        {"company_name": "London Heritage Apparel", "contact_name": "Oliver Smith", "email": "trade@londonheritage.uk", "phone": "+44-20-555-0144", "country": "UK", "city": "London", "payment_terms": "Net 30", "rating": 4.5},
        {"company_name": "Guadalajara Glass", "contact_name": "Sofia Gomez", "email": "ventas@guadalajaraglass.mx", "phone": "+52-33-555-0173", "country": "Mexico", "city": "Guadalajara", "payment_terms": "Net 30", "rating": 4.3},
        {"company_name": "Bengaluru Tech Corp", "contact_name": "Arjun Patel", "email": "contact@bengalurutech.in", "phone": "+91-80-555-0198", "country": "India", "city": "Bangalore", "payment_terms": "Net 30", "rating": 4.7},
        {"company_name": "Auckland Outdoor Outfitters", "contact_name": "Liam Clark", "email": "orders@aucklandoutdoors.nz", "phone": "+64-9-555-0121", "country": "New Zealand", "city": "Auckland", "payment_terms": "Net 30", "rating": 4.7},
        {"company_name": "Rotterdam Marine Logistics", "contact_name": "Jan Van Dijk", "email": "supply@rotterdammarine.nl", "phone": "+31-10-555-0133", "country": "Netherlands", "city": "Rotterdam", "payment_terms": "Net 60", "rating": 4.6},
        {"company_name": "Zurich Precision Instruments", "contact_name": "Lukas Weber", "email": "precision@zurichinst.ch", "phone": "+41-44-555-0155", "country": "Switzerland", "city": "Zurich", "payment_terms": "Net 30", "rating": 4.9},
        {"company_name": "Austin Semiconductor Labs", "contact_name": "Rachel Vance", "email": "rachel@austinsemi.com", "phone": "+1-512-555-0187", "country": "USA", "city": "Austin", "payment_terms": "Net 30", "rating": 4.8},
        {"company_name": "Singapore Global Distribution", "contact_name": "Wei Ming", "email": "ops@singaporeglobal.sg", "phone": "+65-6555-0199", "country": "Singapore", "city": "Singapore", "payment_terms": "Net 30", "rating": 4.8}
    ]

    # Supplier Contracts (20 contracts)
    contracts_data = []
    for s_id in range(1, 21):
        contracts_data.append({
            "supplier_id": s_id,
            "contract_number": f"CNT-2023-{1000 + s_id}",
            "start_date": "2023-01-01",
            "end_date": "2025-12-31",
            "annual_commitment_value": round(random.uniform(150000, 850000), 2),
            "status": "active"
        })

    # Warehouses (8 warehouses)
    warehouses_data = [
        {"warehouse_code": "WH-US-WEST", "name": "Pacific Coast Gateway DC", "city": "Seattle", "state": "WA", "country": "USA", "capacity_sqft": 350000, "operational_status": "operational"},
        {"warehouse_code": "WH-US-EAST", "name": "New Jersey Atlantic DC", "city": "Newark", "state": "NJ", "country": "USA", "capacity_sqft": 420000, "operational_status": "operational"},
        {"warehouse_code": "WH-US-CENTRAL", "name": "Midwest Heartland Logistics", "city": "Chicago", "state": "IL", "country": "USA", "capacity_sqft": 500000, "operational_status": "operational"},
        {"warehouse_code": "WH-EU-NORTH", "name": "Rotterdam Port Fulfillment", "city": "Rotterdam", "state": "South Holland", "country": "Netherlands", "capacity_sqft": 380000, "operational_status": "operational"},
        {"warehouse_code": "WH-EU-CENTRAL", "name": "Frankfurt Continental Hub", "city": "Frankfurt", "state": "Hesse", "country": "Germany", "capacity_sqft": 290000, "operational_status": "operational"},
        {"warehouse_code": "WH-APAC-EAST", "name": "Tokyo Kanto Mega Facility", "city": "Yokohama", "state": "Kanagawa", "country": "Japan", "capacity_sqft": 310000, "operational_status": "operational"},
        {"warehouse_code": "WH-APAC-SOUTH", "name": "Singapore Changi Hub", "city": "Singapore", "state": "Central", "country": "Singapore", "capacity_sqft": 260000, "operational_status": "operational"},
        {"warehouse_code": "WH-UK-SOUTH", "name": "Milton Keynes London Gateway", "city": "Milton Keynes", "state": "Buckinghamshire", "country": "UK", "capacity_sqft": 240000, "operational_status": "operational"}
    ]

    # Warehouse Locations (50 locations)
    wh_locations_data = []
    zone_types = ["ambient", "ambient", "cold_storage", "high_value"]
    for i in range(50):
        wh_id = (i % 8) + 1
        aisle = f"A{((i // 4) + 1):02d}"
        shelf = f"S{(i % 4) + 1}"
        bin_code = f"BIN-{wh_id}-{aisle}-{shelf}"
        wh_locations_data.append({
            "warehouse_id": wh_id,
            "aisle": aisle,
            "shelf": shelf,
            "bin_code": bin_code,
            "zone_type": random.choice(zone_types)
        })

    # Product Categories (10 categories with parent hierarchy)
    categories_data = [
        {"parent_category_id": None, "name": "Electronics & Audio", "slug": "electronics-audio", "description": "High fidelity audio, smart screens, and peripherals"},
        {"parent_category_id": None, "name": "Office Furniture & Setup", "slug": "office-furniture", "description": "Ergonomic furniture, motorized desks, and risers"},
        {"parent_category_id": None, "name": "Kitchen & Culinary Craft", "slug": "kitchen-culinary", "description": "Artisan cookware, espresso gear, and knife craft"},
        {"parent_category_id": None, "name": "Apparel & Activewear", "slug": "apparel-activewear", "description": "Sustainable everyday apparel, outdoor clothing"},
        {"parent_category_id": None, "name": "Smart Home & Ambient Lighting", "slug": "smart-home", "description": "IoT lighting, air purification, and acoustics"},
        {"parent_category_id": None, "name": "Fitness & Recovery", "slug": "fitness-recovery", "description": "Performance exercise equipment and wellness tools"},
        {"parent_category_id": None, "name": "Travel & Luggage", "slug": "travel-luggage", "description": "Waterproof duffels, packs, and travel accessories"},
        {"parent_category_id": None, "name": "Stationery & Desk Artifacts", "slug": "stationery-desk", "description": "Fountain pens, dot-grid journals, and desk pads"},
        {"parent_category_id": 1, "name": "Wearable Tech", "slug": "wearable-tech", "description": "Smart watches, fitness trackers, and hearables"},
        {"parent_category_id": 2, "name": "Ergonomic Seating", "slug": "ergonomic-seating", "description": "Task chairs, mesh seating, and active stools"}
    ]

    # Products (60 products)
    products_master = [
        (1, 1, "EL-101", "Ultra ANC Wireless Headphones Pro", "Over-ear noise cancelling headphones with 40h battery.", 110.00, 299.99, 349.99, 140, 30),
        (1, 7, "EL-102", "Studio Pro 4K 144Hz Monitor 27in", "IPS ultra-wide color gamut monitor for creatives.", 280.00, 549.99, 599.99, 65, 15),
        (1, 11, "EL-103", "Mechanical RGB Gaming Keyboard (Brown Switches)", "Custom hot-swappable tactile switch mechanical keyboard.", 45.00, 129.50, 149.00, 180, 40),
        (1, 11, "EL-104", "Wireless Ergonomic Vertical Mouse", "Ergonomic 57-degree vertical handshake grip mouse.", 22.00, 69.99, 79.99, 210, 50),
        (1, 1, "EL-105", "Noise-Cancelling True Wireless Earbuds", "Compact IPX7 waterproof Bluetooth earbuds.", 38.00, 119.99, 139.99, 250, 60),
        (1, 7, "EL-106", "Smart 4K HDR Streaming Hub", "Dolby Vision streaming device with voice control.", 28.00, 79.99, 89.99, 320, 80),
        (1, 19, "EL-107", "Fast Charging 100W GaN Desktop Charger", "Multi-port USB-C GaN power delivery station.", 18.00, 49.99, 59.99, 450, 100),
        (2, 9, "OF-201", "Ergonomic Lumbar Mesh Office Chair", "Adjustable 3D armrests and responsive lumbar support.", 95.00, 289.00, 329.00, 85, 20),
        (2, 2, "OF-202", "Motorized Dual-Motor Standing Desk (Oak)", "Memory presets, whisper-quiet dual lifting columns.", 180.00, 519.00, 599.00, 42, 10),
        (2, 8, "OF-203", "Solid Walnut Monitor Riser Stand", "Hand-finished American walnut with aluminum legs.", 24.00, 79.00, 89.00, 115, 25),
        (2, 9, "OF-204", "Under-Desk Adjustable Footrest", "Textured massage surface with angle adjustment.", 14.00, 42.50, 49.99, 190, 30),
        (2, 3, "OF-205", "Heavy Duty Dual Monitor Gas-Spring Arm", "Supports up to two 32-inch displays with cable clips.", 32.00, 99.00, 119.00, 130, 25),
        (3, 10, "KT-301", "Cast Iron Pre-Seasoned Dutch Oven 6qt", "Enamelled vibrant finish with heat-retention core.", 36.00, 95.00, 115.00, 120, 30),
        (3, 12, "KT-302", "Artisan Ceramic Pour-Over Coffee Dripper", "Handcrafted in Kyoto with spiral extraction grooves.", 11.00, 34.99, 39.99, 340, 50),
        (3, 10, "KT-303", "Professional Damascus Steel Chef Knife 8in", "67-layer Japanese VG-10 cutting core.", 48.00, 149.00, 179.00, 95, 20),
        (3, 14, "KT-304", "Thermal Stainless Steel Tumbler 32oz", "Double-wall vacuum insulation with magnetic lid.", 8.50, 28.00, 34.00, 600, 100),
        (3, 12, "KT-305", "Handcrafted Matcha Tea Bowl Set", "Traditional earthenware chawan and bamboo whisk.", 16.00, 48.00, 58.00, 175, 40),
        (4, 4, "AP-401", "Heavyweight Organic Cotton T-Shirt", "240 GSM pre-shrunk combed organic cotton.", 8.00, 32.00, 38.00, 850, 150),
        (4, 4, "AP-402", "Brushed Fleece Zip Hoodie (Grey)", "Soft organic French terry with heavy metal zipper.", 22.00, 78.00, 89.00, 420, 80),
        (4, 5, "AP-403", "Water-Resistant City Commuter Backpack 22L", "CORDURA fabric with 16-inch laptop pocket.", 34.00, 115.00, 135.00, 190, 40),
        (4, 5, "AP-404", "Full-Grain Italian Leather Everyday Belt", "Vegetable-tanned full grain leather with brass buckle.", 18.00, 58.00, 68.00, 230, 50),
        (4, 13, "AP-405", "Merino Wool Thermal Crew Socks (3-Pack)", "Anti-odor naturally moisture-wicking merino.", 9.00, 29.50, 35.00, 510, 100),
        (5, 1, "HM-501", "Smart WiFi Color-Changing Ambient Light Bar", "RGBIC lighting synced with screen and music.", 24.00, 68.00, 79.00, 210, 40),
        (5, 7, "HM-502", "HEPA Ultra-Quiet Room Air Purifier", "H13 True HEPA filter capturing 99.97% particles.", 55.00, 149.99, 179.99, 75, 15),
        (5, 8, "HM-503", "Acoustic Felt Hexagonal Wall Tile Set (10-Pk)", "Sound-dampening eco-polyester decorative tiles.", 15.00, 45.00, 55.00, 300, 50),
        (6, 6, "FT-601", "High-Density Non-Slip Cork Yoga Mat", "All-natural sustainable cork with natural rubber base.", 18.00, 52.00, 60.00, 240, 50),
        (6, 6, "FT-602", "Adjustable Quick-Select Dumbbell Pair 50lb", "Rapid dial weight selection from 5 to 50 lbs.", 120.00, 299.00, 349.00, 35, 10),
        (6, 11, "FT-603", "Percussive Deep Tissue Massage Gun", "Quiet brushless motor with 6 swappable heads.", 39.00, 129.00, 149.00, 110, 25),
        (7, 16, "OD-701", "Ultralight 2-Person Backpacking Tent", "Silnylon 15D fabric weighing under 3.2 lbs.", 85.00, 220.00, 259.00, 60, 15),
        (7, 14, "OD-702", "Rechargeable LED Camping Lantern 1000lm", "Dual color temperature with power bank USB output.", 12.00, 39.99, 48.00, 310, 60),
        (7, 5, "OD-703", "Weatherproof Duffel Bag 65L", "Heavy duty TPU laminated tarpaulin with backpack straps.", 31.00, 89.99, 105.00, 145, 30),
        (8, 4, "BK-801", "Hardcover Dot Grid Executive Journal", "160 GSM bleed-proof bamboo paper with ribbon.", 6.50, 24.00, 28.00, 720, 120),
        (8, 3, "BK-802", "Brass Minimalist Refillable Rollerball Pen", "Machined solid raw brass with Schmidt roller refill.", 14.00, 42.00, 49.00, 380, 70),
        (1, 19, "EL-108", "Magnetic Wireless MagSafe Power Bank 10000mAh", "Strong neodymium magnets with kickstand.", 17.00, 49.99, 59.99, 410, 90),
        (1, 1, "EL-109", "Premium USB-C Condenser Microphone", "Studio-grade cardioid pickup with pop filter.", 42.00, 119.00, 139.00, 130, 30),
        (2, 2, "OF-206", "Solid Bamboo Desktop Drawer Organizer", "Natural carbonized bamboo with dividers.", 16.00, 48.00, 56.00, 220, 40),
        (3, 10, "KT-306", "Non-Stick Ceramic Frying Pan Set", "PTFE & PFOA free granite ceramic coating.", 30.00, 89.00, 105.00, 160, 35),
        (4, 13, "AP-406", "Waterproof Shell Raincoat (Packable)", "3-layer breathable membrane with taped seams.", 38.00, 120.00, 145.00, 170, 35),
        (5, 1, "HM-504", "Minimalist Sunset Projection Ambient Lamp", "Optical glass lens reproducing warm golden hour rays.", 12.00, 36.00, 42.00, 400, 80),
        (6, 6, "FT-604", "Fabric Resistance Loop Bands Set (5-Levels)", "Comfortable non-pinch fabric resistance bands.", 5.00, 19.99, 25.00, 850, 150),
        (7, 16, "OD-704", "Double Camping Hammock with Tree Straps", "210T parachute nylon with carabiners included.", 14.00, 39.00, 45.00, 280, 50),
        (8, 4, "BK-803", "Vegan Leather Desk Blotter Mat 36x18", "Waterproof surface for mouse glide and keyboard.", 11.00, 32.00, 39.00, 450, 80),
        (1, 7, "EL-110", "Ultra-Slim 65W GaN Laptop Travel Adapter", "Foldable prongs designed for international road warriors.", 19.00, 54.99, 64.99, 390, 75),
        (2, 9, "OF-207", "Cable Management Spine & Tray Kit", "Heavy duty steel channels to organize workstation cords.", 12.00, 35.00, 42.00, 310, 60),
        (3, 12, "KT-307", "Precision Electric Gooseneck Kettle", "Variable 1-degree temp control with 60min hold.", 38.00, 99.00, 115.00, 140, 30),
        (4, 4, "AP-407", "Relaxed Fit Chino Trousers", "Stretch cotton twill tailored for comfort.", 24.00, 75.00, 85.00, 260, 50),
        (5, 8, "HM-505", "Smart Ultrasonic Aroma Diffuser", "App controlled cool mist diffuser with mood light.", 16.00, 46.00, 54.00, 290, 60),
        (6, 11, "FT-605", "Smart Bluetooth Body Composition Scale", "ITO coated glass measuring BMI, body fat and muscle.", 21.00, 59.99, 69.99, 210, 40),
        (7, 14, "OD-705", "All-Weather Polarized Sunglasses", "TAC polarized UV400 lenses with TR90 frame.", 18.00, 65.00, 75.00, 320, 60),
        (8, 3, "BK-804", "Weekly Desk Pad Calendar & Habit Tracker", "Undated weekly planning tear-off sheets.", 7.00, 21.00, 25.00, 550, 100),
        (9, 1, "WT-901", "Titanium GPS Smart Adventure Watch", "Sapphire glass, topographic maps and 14-day battery.", 190.00, 449.00, 499.00, 80, 15),
        (9, 15, "WT-902", "Smart Fitness Health Ring (Size 10)", "Sleep stage tracking, heart rate variability sensors.", 95.00, 229.00, 259.00, 110, 25),
        (9, 1, "WT-903", "Bone Conduction Open-Ear Sport Headphones", "Sweatproof safety design for outdoor runners.", 35.00, 98.00, 110.00, 190, 40),
        (10, 9, "ES-1001", "Executive Ergonomic High-Back Leather Chair", "Top grain leather with synchronous recline.", 210.00, 649.00, 749.00, 45, 10),
        (10, 8, "ES-1002", "Active Balance Kneeling Chair", "Promotes upright posture and reduces lower back strain.", 48.00, 139.00, 159.00, 95, 20),
        (1, 19, "EL-111", "12-in-1 Thunderbolt 4 Docking Station", "Triple 4K display support with 96W charging.", 85.00, 219.00, 249.00, 120, 25),
        (2, 2, "OF-208", "Solid Walnut Under-Desk Cable Tray", "Natural grain finish concealing power bricks.", 15.00, 44.00, 52.00, 260, 50),
        (3, 10, "KT-308", "Electric Burr Coffee Grinder 40mm", "Conical stainless steel burrs with 30 grind steps.", 52.00, 139.00, 160.00, 85, 20),
        (4, 5, "AP-408", "Merino Wool Knit Beanie", "100% fine merino rib knit for winter warmth.", 10.00, 32.00, 38.00, 480, 90),
        (5, 7, "HM-506", "Smart Indoor Air Quality Monitor", "Tracks CO2, VOCs, PM2.5, humidity and temp.", 32.00, 89.00, 105.00, 170, 35)
    ]

    products_data = []
    for p in products_master:
        products_data.append({
            "category_id": p[0], "supplier_id": p[1], "sku": p[2], "name": p[3],
            "description": p[4], "cost_price": p[5], "price": p[6], "msrp": p[7],
            "stock_quantity": p[8], "reorder_level": p[9], "is_active": True
        })

    # Product Variants (150 variants)
    colors = ["Midnight Black", "Space Gray", "Silver White", "Navy Blue", "Forest Green", "Rose Gold"]
    sizes = ["Standard", "Small", "Medium", "Large", "XL"]
    variants_data = []
    v_count = 1
    for prod_id in range(1, 61):
        num_v = random.randint(2, 4)
        for vi in range(num_v):
            col = colors[vi % len(colors)]
            sz = sizes[vi % len(sizes)]
            add_c = round(random.choice([0.0, 5.0, 10.0, 15.0]), 2)
            sku_var = f"{products_master[prod_id - 1][2]}-V{vi+1}"
            variants_data.append({
                "product_id": prod_id,
                "sku_variant": sku_var,
                "color": col,
                "size": sz,
                "material": "Standard",
                "additional_cost": add_c,
                "stock_quantity": random.randint(10, 80)
            })
            v_count += 1

    # Product Tags (30 tags)
    tag_names = [
        "Eco-Friendly", "Best-Seller", "New-Arrival", "Wireless", "Ergonomic",
        "Staff-Pick", "Premium", "Compact", "USB-C", "Waterproof",
        "Handcrafted", "Smart-Home", "Top-Rated", "Fast-Charging", "Travel-Ready",
        "Minimalist", "High-Fidelity", "Bluetooth", "Rechargeable", "Organic",
        "Heavy-Duty", "Portable", "Limited-Edition", "Clearance", "Gift-Idea",
        "B2B-Choice", "Work-From-Home", "Modular", "Award-Winner", "Trending"
    ]
    tags_data = [{"tag_name": t, "slug": t.lower().replace(" ", "-")} for t in tag_names]

    # Product Tag Mappings (180 mappings)
    tag_mappings_data = []
    mapping_set = set()
    for pid in range(1, 61):
        chosen_tags = random.sample(range(1, 31), 3)
        for tid in chosen_tags:
            if (pid, tid) not in mapping_set:
                mapping_set.add((pid, tid))
                tag_mappings_data.append({"product_id": pid, "tag_id": tid})

    # Purchase Orders (100 POs) & Purchase Order Items (300 items)
    po_statuses = ["received", "received", "received", "sent", "draft"]
    purchase_orders_data = []
    po_items_data = []
    for po_id in range(1, 101):
        sup_id = random.randint(1, 20)
        po_date = date(2023, 1, 1) + timedelta(days=random.randint(0, 550))
        deliv_date = po_date + timedelta(days=random.randint(7, 21))
        stat = random.choice(po_statuses)
        approver = random.choice([18, 19, 15, 1])
        
        # 2 to 4 items per PO
        num_items = random.randint(2, 4)
        po_total = Decimal("0.00")
        prods = random.sample(range(1, 61), num_items)
        for pid in prods:
            c_price = Decimal(str(products_master[pid - 1][5]))
            q_ord = random.randint(20, 100)
            q_rec = q_ord if stat == "received" else (random.randint(0, q_ord // 2) if stat == "sent" else 0)
            t_cost = c_price * q_ord
            po_total += t_cost
            po_items_data.append({
                "purchase_order_id": po_id,
                "product_id": pid,
                "quantity_ordered": q_ord,
                "quantity_received": q_rec,
                "unit_cost": float(c_price),
                "total_cost": float(t_cost)
            })

        purchase_orders_data.append({
            "supplier_id": sup_id,
            "order_date": po_date.isoformat(),
            "expected_delivery_date": deliv_date.isoformat(),
            "status": stat,
            "total_cost": float(po_total),
            "approved_by_employee_id": approver
        })

    # Warehouse Inventory (350 records across warehouses)
    wh_inventory_data = []
    for wh_id in range(1, 9):
        for prod_id in range(1, 61):
            if random.random() > 0.25: # present in most warehouses
                q_on_hand = random.randint(15, 120)
                q_res = random.randint(0, min(15, q_on_hand))
                q_avail = q_on_hand - q_res
                cnt_date = (date(2024, 1, 1) + timedelta(days=random.randint(0, 180))).isoformat()
                wh_inventory_data.append({
                    "warehouse_id": wh_id,
                    "product_id": prod_id,
                    "quantity_on_hand": q_on_hand,
                    "quantity_reserved": q_res,
                    "quantity_available": q_avail,
                    "last_counted_at": cnt_date
                })

    # Inventory Logs (600 logs)
    inv_logs_data = []
    change_types = ["restock", "sale", "sale", "sale", "damaged", "return", "audit_adjustment"]
    for _ in range(600):
        pid = random.randint(1, 60)
        wh_id = random.randint(1, 8)
        c_type = random.choice(change_types)
        if c_type == "restock":
            q_chg = random.randint(25, 100)
        elif c_type in ("sale", "damaged"):
            q_chg = -random.randint(1, 5)
        else:
            q_chg = random.choice([1, -1, 2])
        prev_q = products_master[pid - 1][8]
        new_q = max(0, prev_q + q_chg)
        log_time = datetime.now() - timedelta(days=random.randint(1, 300), hours=random.randint(0, 23))
        inv_logs_data.append({
            "product_id": pid,
            "warehouse_id": wh_id,
            "change_type": c_type,
            "quantity_change": q_chg,
            "previous_quantity": prev_q,
            "new_quantity": new_q,
            "logged_at": log_time.isoformat()
        })

    # Customers (200 customers)
    countries_cities = [
        ("USA", "New York"), ("USA", "San Francisco"), ("USA", "Austin"), ("USA", "Seattle"), ("USA", "Chicago"),
        ("UK", "London"), ("UK", "Manchester"), ("Canada", "Toronto"), ("Canada", "Vancouver"),
        ("Germany", "Berlin"), ("Germany", "Munich"), ("France", "Paris"), ("France", "Lyon"),
        ("Australia", "Sydney"), ("Australia", "Melbourne"), ("Japan", "Tokyo"), ("India", "Bangalore"),
        ("India", "Mumbai"), ("Italy", "Milan"), ("Spain", "Barcelona"), ("Netherlands", "Amsterdam")
    ]
    tiers = ["Bronze", "Bronze", "Silver", "Silver", "Gold", "Platinum"]
    customers_data = []
    customer_addresses_data = []
    for cid in range(1, 201):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        co, ci = random.choice(countries_cities)
        tier = random.choice(tiers)
        s_date = (date(2022, 1, 1) + timedelta(days=random.randint(0, 900))).isoformat()
        customers_data.append({
            "first_name": fn,
            "last_name": ln,
            "email": f"{fn.lower()}.{ln.lower()}{cid}@consumer.com",
            "phone": f"+1-{random.randint(200, 999)}-555-{random.randint(1000, 9999)}",
            "country": co,
            "city": ci,
            "loyalty_tier": tier,
            "lifetime_spend": 0.0, # Updated later after orders
            "signup_date": s_date
        })

        # Address
        street = f"{random.randint(100, 9999)} {random.choice(['Grand Ave', 'Sunset Blvd', 'Kingsway', 'Park Rd', 'Market St', 'Main Way'])}"
        customer_addresses_data.append({
            "customer_id": cid,
            "address_type": "shipping",
            "street": street,
            "city": ci,
            "state": "Province/State",
            "postal_code": f"{random.randint(10000, 99999)}",
            "country": co,
            "is_default": True
        })

    # Customer Wishlists (250 wishlists)
    wishlists_data = []
    w_set = set()
    for _ in range(250):
        c_id = random.randint(1, 200)
        p_id = random.randint(1, 60)
        if (c_id, p_id) not in w_set:
            w_set.add((c_id, p_id))
            wishlists_data.append({
                "customer_id": c_id,
                "product_id": p_id,
                "priority": random.choice(["high", "medium", "low"]),
                "date_added": (date(2023, 2, 1) + timedelta(days=random.randint(0, 450))).isoformat()
            })

    # Product Reviews (400 reviews)
    headlines = [
        "Exceeded all expectations!", "Incredible build quality and finish", "Very good value for money",
        "Decent product, super fast delivery", "Absolute game changer for my desk setup", "Solid performance",
        "Could be slightly more intuitive", "Works perfectly as advertised", "Highly recommend to my team", "Top tier design and ergonomics"
    ]
    reviews_data = []
    for _ in range(400):
        p_id = random.randint(1, 60)
        c_id = random.randint(1, 200)
        rating = random.choices([5, 4, 3, 2, 1], weights=[55, 30, 8, 4, 3])[0]
        hl = random.choice(headlines)
        txt = f"I have been testing this product daily for several weeks. {hl} and the overall attention to detail is noticeable."
        r_d = (date(2023, 2, 1) + timedelta(days=random.randint(0, 500))).isoformat()
        reviews_data.append({
            "product_id": p_id,
            "customer_id": c_id,
            "rating": rating,
            "verified_purchase": True,
            "headline": hl,
            "review_text": txt,
            "helpful_votes": random.randint(0, 45),
            "created_at": r_d
        })

    # Discounts (15 discounts)
    discounts_data = [
        {"code": "SUMMER10", "description": "10% off summer campaign", "discount_type": "percentage", "discount_value": 10.00, "min_order_amount": 50.00, "usage_limit": 1000, "times_used": 142, "active": True, "expires_at": "2025-08-31"},
        {"code": "WELCOME15", "description": "15% welcome voucher for new members", "discount_type": "percentage", "discount_value": 15.00, "min_order_amount": 0.00, "usage_limit": 5000, "times_used": 680, "active": True, "expires_at": "2025-12-31"},
        {"code": "VIP25", "description": "25% discount for Gold/Platinum tiers", "discount_type": "percentage", "discount_value": 25.00, "min_order_amount": 150.00, "usage_limit": 500, "times_used": 94, "active": True, "expires_at": "2025-12-31"},
        {"code": "BLACKFRIDAY", "description": "30% off cyber weekend sale", "discount_type": "percentage", "discount_value": 30.00, "min_order_amount": 100.00, "usage_limit": 2000, "times_used": 1850, "active": False, "expires_at": "2023-11-30"},
        {"code": "FREESHIP", "description": "Free shipping promotion", "discount_type": "fixed_amount", "discount_value": 12.50, "min_order_amount": 40.00, "usage_limit": 3000, "times_used": 420, "active": True, "expires_at": "2025-12-31"},
        {"code": "SPRING20", "description": "20% spring refresh coupon", "discount_type": "percentage", "discount_value": 20.00, "min_order_amount": 80.00, "usage_limit": 1500, "times_used": 310, "active": True, "expires_at": "2025-05-31"},
        {"code": "TECHSALE", "description": "12% off audio and peripherals", "discount_type": "percentage", "discount_value": 12.00, "min_order_amount": 120.00, "usage_limit": 800, "times_used": 175, "active": True, "expires_at": "2025-09-30"},
        {"code": "FLASH50", "description": "$50 off orders over $250", "discount_type": "fixed_amount", "discount_value": 50.00, "min_order_amount": 250.00, "usage_limit": 200, "times_used": 198, "active": False, "expires_at": "2023-10-31"},
        {"code": "LOYALTY20", "description": "Exclusive $20 off loyalty reward", "discount_type": "fixed_amount", "discount_value": 20.00, "min_order_amount": 90.00, "usage_limit": 1000, "times_used": 240, "active": True, "expires_at": "2025-12-31"},
        {"code": "HOLIDAY15", "description": "15% off holiday gifting guide", "discount_type": "percentage", "discount_value": 15.00, "min_order_amount": 60.00, "usage_limit": 2500, "times_used": 890, "active": True, "expires_at": "2025-12-31"},
        {"code": "OFFICEUPGRADE", "description": "$75 off orders over $400", "discount_type": "fixed_amount", "discount_value": 75.00, "min_order_amount": 400.00, "usage_limit": 300, "times_used": 62, "active": True, "expires_at": "2025-10-31"},
        {"code": "FITNESS2024", "description": "18% off health and recovery products", "discount_type": "percentage", "discount_value": 18.00, "min_order_amount": 75.00, "usage_limit": 1200, "times_used": 280, "active": True, "expires_at": "2025-04-30"},
        {"code": "STUDENT10", "description": "10% educational student discount", "discount_type": "percentage", "discount_value": 10.00, "min_order_amount": 30.00, "usage_limit": 4000, "times_used": 510, "active": True, "expires_at": "2025-12-31"},
        {"code": "EARLYBIRD", "description": "Early bird product launch special", "discount_type": "percentage", "discount_value": 15.00, "min_order_amount": 100.00, "usage_limit": 500, "times_used": 480, "active": False, "expires_at": "2023-08-15"},
        {"code": "CYBER50", "description": "$50 off cyber week hardware", "discount_type": "fixed_amount", "discount_value": 50.00, "min_order_amount": 300.00, "usage_limit": 350, "times_used": 340, "active": False, "expires_at": "2023-11-28"}
    ]

    # Shipping Carriers (6 carriers)
    shipping_carriers_data = [
        {"carrier_name": "FedEx Express", "carrier_code": "FDX", "tracking_url_template": "https://www.fedex.com/fedextrack/?trknbr={}", "service_level": "Express Priority"},
        {"carrier_name": "United Parcel Service (UPS)", "carrier_code": "UPS", "tracking_url_template": "https://www.ups.com/track?tracknum={}", "service_level": "Ground & Air"},
        {"carrier_name": "DHL Express Global", "carrier_code": "DHL", "tracking_url_template": "https://www.dhl.com/en/express/tracking.html?AWB={}", "service_level": "International Express"},
        {"carrier_name": "USPS Priority Mail", "carrier_code": "USPS", "tracking_url_template": "https://tools.usps.com/go/TrackConfirmAction?tLabels={}", "service_level": "Standard Domestic"},
        {"carrier_name": "Royal Mail Special", "carrier_code": "RM", "tracking_url_template": "https://www.royalmail.com/track-your-item#/tracking-results/{}", "service_level": "UK Next Day"},
        {"carrier_name": "Japan Post EMS", "carrier_code": "JPEMS", "tracking_url_template": "https://trackings.post.japanpost.jp/services/srv/search/?requestNo1={}", "service_level": "Asia Pacific Air"}
    ]

    # Orders (600 orders), Order Items (~1,800 items), Payments (600), Shipments (450), Invoices (600)
    order_statuses = ["completed", "completed", "completed", "completed", "shipped", "delivered", "processing", "pending", "cancelled"]
    pay_methods = ["Credit Card", "PayPal", "Apple Pay", "Google Pay", "Stripe", "Bank Transfer"]
    pay_providers = ["Stripe", "PayPal", "Adyen", "Square", "Authorize.net"]

    orders_data = []
    order_items_data = []
    payments_data = []
    shipments_data = []
    invoices_data = []
    customer_spend_accumulator = {cid: Decimal("0.00") for cid in range(1, 201)}

    for oid in range(1, 601):
        cid = random.randint(1, 200)
        disc_id = random.choice([None, None, None, 1, 2, 3, 5, 6, 7, 9, 10, 12, 13])
        o_date = date(2023, 1, 1) + timedelta(days=random.randint(0, 580))
        status = random.choice(order_statuses)
        p_status = "paid" if status in ("completed", "shipped", "delivered", "processing") else ("refunded" if status == "cancelled" else "pending")
        p_method = random.choice(pay_methods)

        # 1 to 5 items per order
        num_items = random.randint(1, 5)
        chosen_pids = random.sample(range(1, 61), num_items)
        subtotal = Decimal("0.00")
        for pid in chosen_pids:
            p_rec = products_master[pid - 1]
            p_price = Decimal(str(p_rec[6]))
            qty = random.randint(1, 3)
            lt = p_price * qty
            subtotal += lt
            order_items_data.append({
                "order_id": oid,
                "product_id": pid,
                "variant_id": None,
                "quantity": qty,
                "unit_price": float(p_price),
                "discount_applied": 0.0,
                "line_total": float(lt)
            })

        disc_val = Decimal("0.00")
        if disc_id:
            d_entry = discounts_data[disc_id - 1]
            if d_entry["discount_type"] == "percentage":
                disc_val = subtotal * (Decimal(str(d_entry["discount_value"])) / Decimal("100"))
            else:
                disc_val = min(subtotal, Decimal(str(d_entry["discount_value"])))

        tax = round((subtotal - disc_val) * Decimal("0.08"), 2)
        shipping_fee = Decimal("0.00") if (subtotal > Decimal("100")) else Decimal("12.50")
        total_amt = round(subtotal - disc_val + tax + shipping_fee, 2)

        if p_status == "paid":
            customer_spend_accumulator[cid] += total_amt

        orders_data.append({
            "customer_id": cid,
            "discount_id": disc_id,
            "order_date": o_date.isoformat(),
            "status": status,
            "payment_method": p_method,
            "payment_status": p_status,
            "shipping_fee": float(shipping_fee),
            "tax_amount": float(tax),
            "total_amount": float(total_amt)
        })

        # Payment record
        pmt_status = "captured" if p_status == "paid" else ("refunded" if p_status == "refunded" else "authorized")
        p_time = datetime.combine(o_date, datetime.min.time()) + timedelta(minutes=random.randint(5, 60))
        payments_data.append({
            "order_id": oid,
            "transaction_id": f"TXN-2023-{oid:05d}-{random.randint(1000, 9999)}",
            "payment_date": p_time.isoformat(),
            "amount": float(total_amt),
            "payment_provider": random.choice(pay_providers),
            "payment_status": pmt_status
        })

        # Shipments (if shipped, delivered, or completed)
        if status in ("shipped", "delivered", "completed"):
            c_id = random.randint(1, 6)
            wh_orig = random.randint(1, 8)
            ship_d = o_date + timedelta(days=random.randint(1, 2))
            est_deliv = ship_d + timedelta(days=3)
            deliv_d = ship_d + timedelta(days=random.randint(2, 4)) if status in ("delivered", "completed") else None
            deliv_stat = "delivered" if status in ("delivered", "completed") else random.choice(["in_transit", "out_for_delivery"])
            tracking = f"TRK-{c_id}{oid:05d}{random.randint(1000, 9999)}"
            shipments_data.append({
                "order_id": oid,
                "carrier_id": c_id,
                "tracking_number": tracking,
                "origin_warehouse_id": wh_orig,
                "shipped_date": ship_d.isoformat(),
                "estimated_delivery_date": est_deliv.isoformat(),
                "delivered_date": deliv_d.isoformat() if deliv_d else None,
                "delivery_status": deliv_stat
            })

        # Invoices (for all 600 orders)
        inv_stat = "paid" if p_status == "paid" else ("cancelled" if status == "cancelled" else "pending")
        due_d = o_date + timedelta(days=30)
        invoices_data.append({
            "order_id": oid,
            "customer_id": cid,
            "invoice_number": f"INV-2023-{oid:05d}",
            "invoice_date": o_date.isoformat(),
            "due_date": due_d.isoformat(),
            "subtotal": float(subtotal - disc_val),
            "tax": float(tax),
            "total": float(total_amt),
            "status": inv_stat
        })

    # Update customer lifetime spend
    for cid in range(1, 201):
        customers_data[cid - 1]["lifetime_spend"] = float(customer_spend_accumulator[cid])

    # Support Tickets (300 tickets) & Support Ticket Messages (750 messages)
    ticket_categories = ["billing", "shipping", "product_defect", "return", "general_inquiry", "account"]
    ticket_priorities = ["low", "medium", "medium", "high", "urgent"]
    ticket_statuses = ["resolved", "resolved", "closed", "open", "in_progress"]
    support_tickets_data = []
    ticket_messages_data = []
    
    for tid in range(1, 301):
        cid = random.randint(1, 200)
        assigned_emp = random.choice([12, 13, 14]) # Support tier staff
        ref_order = random.randint(1, 600) if random.random() > 0.3 else None
        cat = random.choice(ticket_categories)
        prio = random.choice(ticket_priorities)
        st = random.choice(ticket_statuses)
        c_time = datetime.now() - timedelta(days=random.randint(2, 360), hours=random.randint(1, 23))
        r_time = c_time + timedelta(hours=random.randint(2, 48)) if st in ("resolved", "closed") else None
        
        subj = f"Inquiry regarding {cat.replace('_', ' ')} - Case #{tid:04d}"
        support_tickets_data.append({
            "customer_id": cid,
            "assigned_employee_id": assigned_emp,
            "order_id": ref_order,
            "subject": subj,
            "category": cat,
            "priority": prio,
            "status": st,
            "created_at": c_time.isoformat(),
            "resolved_at": r_time.isoformat() if r_time else None
        })

        # 2 to 3 messages per ticket
        ticket_messages_data.append({
            "ticket_id": tid,
            "sender_role": "customer",
            "message_body": f"Hello, I am having an issue with my {cat.replace('_', ' ')}. Could someone please check and update me?",
            "created_at": c_time.isoformat()
        })
        rep_time = c_time + timedelta(hours=random.randint(1, 4))
        ticket_messages_data.append({
            "ticket_id": tid,
            "sender_role": "support_agent",
            "message_body": "Thank you for reaching out. We have received your inquiry and are actively investigating this for you.",
            "created_at": rep_time.isoformat()
        })
        if st in ("resolved", "closed"):
            res_msg_time = rep_time + timedelta(hours=random.randint(2, 12))
            ticket_messages_data.append({
                "ticket_id": tid,
                "sender_role": "support_agent",
                "message_body": "We have resolved this issue according to company policy. Please reply if you need any further assistance!",
                "created_at": res_msg_time.isoformat()
            })

    # Customer Satisfaction Surveys (250 CSAT surveys)
    csat_data = []
    for _ in range(250):
        c_id = random.randint(1, 200)
        o_id = random.randint(1, 600)
        t_id = random.randint(1, 300) if random.random() > 0.6 else None
        nps = random.choices([10, 9, 8, 7, 6, 5, 4], weights=[40, 30, 15, 8, 4, 2, 1])[0]
        csat = min(5, max(1, (nps // 2)))
        surv_d = (date(2023, 2, 1) + timedelta(days=random.randint(0, 520))).isoformat()
        csat_data.append({
            "customer_id": c_id,
            "order_id": o_id,
            "ticket_id": t_id,
            "nps_score": nps,
            "csat_score": csat,
            "comments": "Great experience overall! Quick resolution and high quality products." if nps >= 8 else "Experience was okay, but delivery was delayed.",
            "survey_date": surv_d
        })

    # Marketing Campaigns (20 campaigns)
    campaigns_data = [
        {"campaign_name": "Q1 New Year Tech Kickoff", "channel": "Google Ads", "target_audience": "Tech Enthusiasts & Gamers", "budget": 25000.00, "actual_spend": 24500.00, "revenue_generated": 112000.00, "roi_percentage": 357.14, "start_date": "2023-01-05", "end_date": "2023-02-15", "status": "completed"},
        {"campaign_name": "Spring Ergonomics Upgrade", "channel": "Meta Ads", "target_audience": "Remote Workers & Engineers", "budget": 18000.00, "actual_spend": 17850.00, "revenue_generated": 84300.00, "roi_percentage": 372.27, "start_date": "2023-03-01", "end_date": "2023-04-15", "status": "completed"},
        {"campaign_name": "Earth Day Sustainable Apparel", "channel": "TikTok", "target_audience": "Gen Z & Eco-Conscious", "budget": 12000.00, "actual_spend": 12000.00, "revenue_generated": 48900.00, "roi_percentage": 307.50, "start_date": "2023-04-10", "end_date": "2023-04-30", "status": "completed"},
        {"campaign_name": "Summer Outdoor Gear Blast", "channel": "YouTube", "target_audience": "Hikers & Campers", "budget": 35000.00, "actual_spend": 34200.00, "revenue_generated": 168000.00, "roi_percentage": 391.23, "start_date": "2023-05-15", "end_date": "2023-07-01", "status": "completed"},
        {"campaign_name": "Back to School Workstations", "channel": "Pinterest", "target_audience": "Students & Academics", "budget": 15000.00, "actual_spend": 14900.00, "revenue_generated": 67200.00, "roi_percentage": 351.01, "start_date": "2023-08-01", "end_date": "2023-09-15", "status": "completed"},
        {"campaign_name": "Autumn Gourmet Culinary Push", "channel": "Email Newsletter", "target_audience": "Home Chefs & Coffee Lovers", "budget": 8000.00, "actual_spend": 7800.00, "revenue_generated": 52400.00, "roi_percentage": 571.79, "start_date": "2023-09-20", "end_date": "2023-10-31", "status": "completed"},
        {"campaign_name": "Early Black Friday VIP Access", "channel": "Google Ads", "target_audience": "High Lifetime Value Customers", "budget": 30000.00, "actual_spend": 29800.00, "revenue_generated": 145000.00, "roi_percentage": 386.58, "start_date": "2023-11-01", "end_date": "2023-11-20", "status": "completed"},
        {"campaign_name": "Cyber Week Omnichannel Blitz", "channel": "Omnichannel", "target_audience": "Global Shoppers", "budget": 65000.00, "actual_spend": 64950.00, "revenue_generated": 389000.00, "roi_percentage": 498.92, "start_date": "2023-11-21", "end_date": "2023-11-30", "status": "completed"},
        {"campaign_name": "Holiday Gift Guide Showcase", "channel": "Affiliate", "target_audience": "Holiday Gift Buyers", "budget": 20000.00, "actual_spend": 19500.00, "revenue_generated": 98000.00, "roi_percentage": 402.56, "start_date": "2023-12-01", "end_date": "2023-12-23", "status": "completed"},
        {"campaign_name": "New Year Fitness Resolution", "channel": "Meta Ads", "target_audience": "Fitness & Wellness", "budget": 22000.00, "actual_spend": 21800.00, "revenue_generated": 94500.00, "roi_percentage": 333.49, "start_date": "2024-01-02", "end_date": "2024-02-10", "status": "completed"},
        {"campaign_name": "Spring Workstation Renewal 2024", "channel": "LinkedIn", "target_audience": "Corporate Procurement Leads", "budget": 16000.00, "actual_spend": 15900.00, "revenue_generated": 78000.00, "roi_percentage": 390.57, "start_date": "2024-03-01", "end_date": "2024-04-15", "status": "completed"},
        {"campaign_name": "VIP Customer Appreciation Sale", "channel": "Email Newsletter", "target_audience": "Gold & Platinum Tiers", "budget": 5000.00, "actual_spend": 4850.00, "revenue_generated": 41200.00, "roi_percentage": 749.48, "start_date": "2024-04-20", "end_date": "2024-05-10", "status": "completed"},
        {"campaign_name": "Father's Day Tech & Knife Showcase", "channel": "Google Ads", "target_audience": "Gift Seekers", "budget": 14000.00, "actual_spend": 13800.00, "revenue_generated": 62000.00, "roi_percentage": 349.28, "start_date": "2024-05-25", "end_date": "2024-06-18", "status": "completed"},
        {"campaign_name": "Mid-Year Warehouse Clearance", "channel": "Omnichannel", "target_audience": "Bargain Hunters", "budget": 28000.00, "actual_spend": 27900.00, "revenue_generated": 134000.00, "roi_percentage": 380.29, "start_date": "2024-06-25", "end_date": "2024-07-15", "status": "completed"},
        {"campaign_name": "Summer Adventure Luggage Push", "channel": "Meta Ads", "target_audience": "International Travelers", "budget": 19000.00, "actual_spend": 18700.00, "revenue_generated": 89000.00, "roi_percentage": 375.94, "start_date": "2024-07-20", "end_date": "2024-08-25", "status": "completed"},
        {"campaign_name": "Fall Creator Studio Audio Push", "channel": "YouTube", "target_audience": "Podcasters & Streamers", "budget": 32000.00, "actual_spend": 31500.00, "revenue_generated": 156000.00, "roi_percentage": 395.24, "start_date": "2024-09-01", "end_date": "2024-10-15", "status": "active"},
        {"campaign_name": "Pre-Holiday Teaser Newsletter", "channel": "Email Newsletter", "target_audience": "Subscribed Newsletter Base", "budget": 4000.00, "actual_spend": 3900.00, "revenue_generated": 32000.00, "roi_percentage": 720.51, "start_date": "2024-10-20", "end_date": "2024-11-05", "status": "active"},
        {"campaign_name": "Black Friday Mega Countdown", "channel": "Omnichannel", "target_audience": "Global Shoppers", "budget": 75000.00, "actual_spend": 12000.00, "revenue_generated": 45000.00, "roi_percentage": 275.00, "start_date": "2024-11-10", "end_date": "2024-11-29", "status": "scheduled"},
        {"campaign_name": "Cyber Monday Tech Extravaganza", "channel": "Google Ads", "target_audience": "High-Intent Searchers", "budget": 50000.00, "actual_spend": 0.00, "revenue_generated": 0.00, "roi_percentage": 0.00, "start_date": "2024-12-01", "end_date": "2024-12-05", "status": "scheduled"},
        {"campaign_name": "End of Year Executive Tax Write-off", "channel": "LinkedIn", "target_audience": "C-Suite & SMB Owners", "budget": 20000.00, "actual_spend": 0.00, "revenue_generated": 0.00, "roi_percentage": 0.00, "start_date": "2024-12-10", "end_date": "2024-12-31", "status": "scheduled"}
    ]

    # Email Campaign Logs (1,200 email logs)
    email_logs_data = []
    for _ in range(1200):
        camp_id = random.randint(1, 15)
        c_id = random.randint(1, 200)
        sent_t = datetime.now() - timedelta(days=random.randint(5, 300), hours=random.randint(1, 23))
        op = random.random() > 0.45
        clk = op and (random.random() > 0.55)
        unsub = (not op) and (random.random() > 0.98)
        email_logs_data.append({
            "campaign_id": camp_id,
            "customer_id": c_id,
            "email_subject": f"Exclusive Special: Check out what's new in {campaigns_data[camp_id - 1]['campaign_name']}",
            "sent_at": sent_t.isoformat(),
            "opened": op,
            "clicked": clk,
            "unsubscribed": unsub
        })

    # Web Sessions (1,500 web sessions)
    traffic_mediums = ["cpc", "organic", "social", "email", "direct", "referral"]
    devices = ["desktop", "desktop", "mobile", "mobile", "tablet"]
    browsers = ["Chrome", "Safari", "Edge", "Firefox", "Opera"]
    landing_pages = ["/home", "/category/electronics-audio", "/category/office-furniture", "/product/EL-101", "/product/OF-202", "/deals", "/checkout"]
    web_sessions_data = []
    
    for _ in range(1500):
        c_id = random.randint(1, 200) if random.random() > 0.25 else None
        s_start = datetime.now() - timedelta(days=random.randint(1, 360), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        dur = random.randint(15, 1200)
        lp = random.choice(landing_pages)
        tm = random.choice(traffic_mediums)
        dev = random.choice(devices)
        br = random.choice(browsers)
        conv = (dur > 240) and (random.random() > 0.65)
        web_sessions_data.append({
            "customer_id": c_id,
            "session_start": s_start.isoformat(),
            "duration_seconds": dur,
            "landing_page": lp,
            "traffic_medium": tm,
            "device_type": dev,
            "browser": br,
            "converted_to_order": conv
        })

    # Affiliate Partners (20 partners)
    affiliate_data = []
    aff_names = [
        "TechGearReviews", "DeskHacks Daily", "Minimalist Living Blog", "ErgoWorkstation Hub",
        "Coffee & Knife Digest", "AudioGeek HQ", "The Daily Outdoorsman", "GadgetFlow Studio",
        "HomeOffice Perfection", "EcoLifestyle Guide", "Nordic Design Curators", "PrimeTech Influencers",
        "Nomad Developer Gear", "Gourmet Kitchen Lab", "Modern Workspace Co", "B2B Office Solutions",
        "Clean Desk Community", "Wearable Future Review", "Pro Chef Recommendations", "Smart Living Collective"
    ]
    for i, an in enumerate(aff_names):
        comm = round(random.uniform(5.0, 15.0), 2)
        refs = random.randint(15, 450)
        tot_earn = round(refs * random.uniform(25.0, 80.0), 2)
        affiliate_data.append({
            "partner_name": an,
            "website": f"https://www.{an.lower().replace(' ', '')}.com",
            "contact_email": f"partner@{an.lower().replace(' ', '')}.com",
            "commission_rate_pct": comm,
            "total_referrals": refs,
            "total_commission_earned": tot_earn,
            "payout_status": "current" if i < 18 else "pending"
        })

    # Chart of Accounts (25 general ledger accounts)
    chart_accounts_data = [
        {"account_code": "1010", "account_name": "Operating Cash Account", "account_category": "Asset", "balance": 1850000.00},
        {"account_code": "1020", "account_name": "Payroll Reserve Account", "account_category": "Asset", "balance": 450000.00},
        {"account_code": "1100", "account_name": "Accounts Receivable", "account_category": "Asset", "balance": 320000.00},
        {"account_code": "1200", "account_name": "Inventory Asset Valuation", "account_category": "Asset", "balance": 980000.00},
        {"account_code": "1500", "account_name": "Warehouse Equipment & Machinery", "account_category": "Asset", "balance": 650000.00},
        {"account_code": "1600", "account_name": "Office Furniture & Tech Infrastructure", "account_category": "Asset", "balance": 280000.00},
        {"account_code": "2010", "account_name": "Accounts Payable (Suppliers)", "account_category": "Liability", "balance": 410000.00},
        {"account_code": "2020", "account_name": "Sales Tax Payable", "account_category": "Liability", "balance": 85000.00},
        {"account_code": "2030", "account_name": "Accrued Employee Payroll", "account_category": "Liability", "balance": 145000.00},
        {"account_code": "2100", "account_name": "Long-Term Commercial Bank Debt", "account_category": "Liability", "balance": 1200000.00},
        {"account_code": "3010", "account_name": "Common Stock & Contributed Capital", "account_category": "Equity", "balance": 1500000.00},
        {"account_code": "3020", "account_name": "Retained Earnings", "account_category": "Equity", "balance": 1270000.00},
        {"account_code": "4010", "account_name": "Gross Product Sales Revenue", "account_category": "Revenue", "balance": 3850000.00},
        {"account_code": "4020", "account_name": "SaaS Subscription Recurring Revenue", "account_category": "Revenue", "balance": 240000.00},
        {"account_code": "4030", "account_name": "Shipping Income Collected", "account_category": "Revenue", "balance": 95000.00},
        {"account_code": "5010", "account_name": "Cost of Goods Sold (Materials & Freight)", "account_category": "Expense", "balance": 1420000.00},
        {"account_code": "6010", "account_name": "Salaries & Employee Wages", "account_category": "Expense", "balance": 1150000.00},
        {"account_code": "6020", "account_name": "Performance Marketing & Advertising Spend", "account_category": "Expense", "balance": 415000.00},
        {"account_code": "6030", "account_name": "Warehouse Logistics & Freight Out", "account_category": "Expense", "balance": 185000.00},
        {"account_code": "6040", "account_name": "Office Lease & Utilities", "account_category": "Expense", "balance": 120000.00},
        {"account_code": "6050", "account_name": "Software Subscriptions & Cloud Hosting (AWS/GCP)", "account_category": "Expense", "balance": 98000.00},
        {"account_code": "6060", "account_name": "Legal, Compliance & Audit Fees", "account_category": "Expense", "balance": 45000.00},
        {"account_code": "6070", "account_name": "Merchant Payment Processing Fees (Stripe/PayPal)", "account_category": "Expense", "balance": 82000.00},
        {"account_code": "6080", "account_name": "Travel, Client Entertainment & Conferences", "account_category": "Expense", "balance": 35000.00},
        {"account_code": "6090", "account_name": "Customer Support Refund Allowances", "account_category": "Expense", "balance": 28000.00}
    ]

    # Subscription Plans (5 plans)
    plans_data = [
        {"plan_name": "Starter Workspace", "billing_interval": "monthly", "price": 29.00, "trial_period_days": 14, "features_summary": "1 User, basic analytics, 5 saved queries, standard support", "is_active": True},
        {"plan_name": "Professional Team", "billing_interval": "monthly", "price": 79.00, "trial_period_days": 14, "features_summary": "Up to 5 Users, full analytics, unlimited SQL queries, priority support", "is_active": True},
        {"plan_name": "Business Growth", "billing_interval": "monthly", "price": 199.00, "trial_period_days": 30, "features_summary": "Up to 20 Users, AI schema introspection, role-based access, API access", "is_active": True},
        {"plan_name": "Enterprise Premier Annual", "billing_interval": "annual", "price": 1990.00, "trial_period_days": 30, "features_summary": "Unlimited Users, dedicated database VPC, SLA 99.99%, account manager", "is_active": True},
        {"plan_name": "Executive Custom", "billing_interval": "annual", "price": 4900.00, "trial_period_days": 0, "features_summary": "Custom enterprise deployment, tailored integrations, security audit", "is_active": True}
    ]

    # Customer Subscriptions (120 subscriptions)
    sub_statuses = ["active", "active", "active", "active", "trialing", "past_due", "cancelled"]
    subscriptions_data = []
    for sid in range(1, 121):
        cid = (sid % 200) + 1
        plan_id = random.randint(1, 5)
        st = random.choice(sub_statuses)
        plan_p = plans_data[plan_id - 1]["price"]
        mrr = plan_p if plans_data[plan_id - 1]["billing_interval"] == "monthly" else round(plan_p / 12, 2)
        s_date = date(2023, 1, 1) + timedelta(days=random.randint(0, 500))
        ren_date = s_date + timedelta(days=30 if plans_data[plan_id - 1]["billing_interval"] == "monthly" else 365)
        can_date = (s_date + timedelta(days=random.randint(15, 120))).isoformat() if st == "cancelled" else None
        subscriptions_data.append({
            "customer_id": cid,
            "plan_id": plan_id,
            "status": st,
            "start_date": s_date.isoformat(),
            "renewal_date": ren_date.isoformat(),
            "cancelled_at": can_date,
            "mrr_value": float(mrr)
        })

    # 3. BATCH INSERTS INTO SUPABASE
    print("[*] Performing high-speed batch inserts into 40 tables...")

    def insert_table(conn, table_name, insert_sql, rows, chunk_size=150):
        print(f"  [*] Seeding {table_name.ljust(30)} ({str(len(rows)).rjust(5)} rows)...", flush=True)
        if not rows:
            return
        for i in range(0, len(rows), chunk_size):
            chunk = rows[i:i + chunk_size]
            conn.execute(text(insert_sql), chunk)
            conn.commit()
        print(f"  [+] Seeded  {table_name.ljust(30)} ({str(len(rows)).rjust(5)} rows) [OK]", flush=True)

    with engine.connect() as conn:
        # Category 1: HR & Org
        insert_table(conn, "departments", "INSERT INTO departments (name, code, manager_name, annual_budget, location) VALUES (:name, :code, :manager_name, :annual_budget, :location)", departments_data)
        insert_table(conn, "job_roles", "INSERT INTO job_roles (department_id, title, min_salary, max_salary, experience_level) VALUES (:department_id, :title, :min_salary, :max_salary, :experience_level)", job_roles_data)
        insert_table(conn, "employees", "INSERT INTO employees (department_id, job_role_id, first_name, last_name, email, phone, salary, hire_date, employment_status) VALUES (:department_id, :job_role_id, :first_name, :last_name, :email, :phone, :salary, :hire_date, :employment_status)", employees_data)
        insert_table(conn, "payroll_records", "INSERT INTO payroll_records (employee_id, pay_period_month, pay_period_year, base_salary, bonus, deductions, net_pay, payment_date) VALUES (:employee_id, :pay_period_month, :pay_period_year, :base_salary, :bonus, :deductions, :net_pay, :payment_date)", payroll_data)
        insert_table(conn, "employee_leave_requests", "INSERT INTO employee_leave_requests (employee_id, leave_type, start_date, end_date, total_days, status) VALUES (:employee_id, :leave_type, :start_date, :end_date, :total_days, :status)", leave_requests_data)
        insert_table(conn, "performance_reviews", "INSERT INTO performance_reviews (employee_id, reviewer_id, review_period, performance_score, feedback_summary, promotion_eligible) VALUES (:employee_id, :reviewer_id, :review_period, :performance_score, :feedback_summary, :promotion_eligible)", perf_reviews_data)

        # Category 2: Suppliers
        insert_table(conn, "suppliers", "INSERT INTO suppliers (company_name, contact_name, email, phone, country, city, payment_terms, rating) VALUES (:company_name, :contact_name, :email, :phone, :country, :city, :payment_terms, :rating)", suppliers_data)
        insert_table(conn, "supplier_contracts", "INSERT INTO supplier_contracts (supplier_id, contract_number, start_date, end_date, annual_commitment_value, status) VALUES (:supplier_id, :contract_number, :start_date, :end_date, :annual_commitment_value, :status)", contracts_data)
        insert_table(conn, "purchase_orders", "INSERT INTO purchase_orders (supplier_id, order_date, expected_delivery_date, status, total_cost, approved_by_employee_id) VALUES (:supplier_id, :order_date, :expected_delivery_date, :status, :total_cost, :approved_by_employee_id)", purchase_orders_data)

        # Category 3: Warehousing
        insert_table(conn, "warehouses", "INSERT INTO warehouses (warehouse_code, name, city, state, country, capacity_sqft, operational_status) VALUES (:warehouse_code, :name, :city, :state, :country, :capacity_sqft, :operational_status)", warehouses_data)
        insert_table(conn, "warehouse_locations", "INSERT INTO warehouse_locations (warehouse_id, aisle, shelf, bin_code, zone_type) VALUES (:warehouse_id, :aisle, :shelf, :bin_code, :zone_type)", wh_locations_data)

        # Category 4: Products
        insert_table(conn, "product_categories", "INSERT INTO product_categories (parent_category_id, name, slug, description) VALUES (:parent_category_id, :name, :slug, :description)", categories_data)
        insert_table(conn, "products", "INSERT INTO products (category_id, supplier_id, sku, name, description, cost_price, price, msrp, stock_quantity, reorder_level, is_active) VALUES (:category_id, :supplier_id, :sku, :name, :description, :cost_price, :price, :msrp, :stock_quantity, :reorder_level, :is_active)", products_data)
        insert_table(conn, "product_variants", "INSERT INTO product_variants (product_id, sku_variant, color, size, material, additional_cost, stock_quantity) VALUES (:product_id, :sku_variant, :color, :size, :material, :additional_cost, :stock_quantity)", variants_data)
        insert_table(conn, "product_tags", "INSERT INTO product_tags (tag_name, slug) VALUES (:tag_name, :slug)", tags_data)
        insert_table(conn, "product_tag_mappings", "INSERT INTO product_tag_mappings (product_id, tag_id) VALUES (:product_id, :tag_id)", tag_mappings_data)
        insert_table(conn, "purchase_order_items", "INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, total_cost) VALUES (:purchase_order_id, :product_id, :quantity_ordered, :quantity_received, :unit_cost, :total_cost)", po_items_data)
        insert_table(conn, "warehouse_inventory", "INSERT INTO warehouse_inventory (warehouse_id, product_id, quantity_on_hand, quantity_reserved, quantity_available, last_counted_at) VALUES (:warehouse_id, :product_id, :quantity_on_hand, :quantity_reserved, :quantity_available, :last_counted_at)", wh_inventory_data)
        insert_table(conn, "inventory_logs", "INSERT INTO inventory_logs (product_id, warehouse_id, change_type, quantity_change, previous_quantity, new_quantity, logged_at) VALUES (:product_id, :warehouse_id, :change_type, :quantity_change, :previous_quantity, :new_quantity, :logged_at)", inv_logs_data)

        # Category 5: Customers
        insert_table(conn, "customers", "INSERT INTO customers (first_name, last_name, email, phone, country, city, loyalty_tier, lifetime_spend, signup_date) VALUES (:first_name, :last_name, :email, :phone, :country, :city, :loyalty_tier, :lifetime_spend, :signup_date)", customers_data)
        insert_table(conn, "customer_addresses", "INSERT INTO customer_addresses (customer_id, address_type, street, city, state, postal_code, country, is_default) VALUES (:customer_id, :address_type, :street, :city, :state, :postal_code, :country, :is_default)", customer_addresses_data)
        insert_table(conn, "customer_wishlists", "INSERT INTO customer_wishlists (customer_id, product_id, priority, date_added) VALUES (:customer_id, :product_id, :priority, :date_added)", wishlists_data)
        insert_table(conn, "product_reviews", "INSERT INTO product_reviews (product_id, customer_id, rating, verified_purchase, headline, review_text, helpful_votes, created_at) VALUES (:product_id, :customer_id, :rating, :verified_purchase, :headline, :review_text, :helpful_votes, :created_at)", reviews_data)

        # Category 6: Orders & Shipments
        insert_table(conn, "discounts", "INSERT INTO discounts (code, description, discount_type, discount_value, min_order_amount, usage_limit, times_used, active, expires_at) VALUES (:code, :description, :discount_type, :discount_value, :min_order_amount, :usage_limit, :times_used, :active, :expires_at)", discounts_data)
        insert_table(conn, "orders", "INSERT INTO orders (customer_id, discount_id, order_date, status, payment_method, payment_status, shipping_fee, tax_amount, total_amount) VALUES (:customer_id, :discount_id, :order_date, :status, :payment_method, :payment_status, :shipping_fee, :tax_amount, :total_amount)", orders_data)
        insert_table(conn, "order_items", "INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, discount_applied, line_total) VALUES (:order_id, :product_id, :variant_id, :quantity, :unit_price, :discount_applied, :line_total)", order_items_data)
        insert_table(conn, "payments", "INSERT INTO payments (order_id, transaction_id, payment_date, amount, payment_provider, payment_status) VALUES (:order_id, :transaction_id, :payment_date, :amount, :payment_provider, :payment_status)", payments_data)
        insert_table(conn, "shipping_carriers", "INSERT INTO shipping_carriers (carrier_name, carrier_code, tracking_url_template, service_level) VALUES (:carrier_name, :carrier_code, :tracking_url_template, :service_level)", shipping_carriers_data)
        insert_table(conn, "shipments", "INSERT INTO shipments (order_id, carrier_id, tracking_number, origin_warehouse_id, shipped_date, estimated_delivery_date, delivered_date, delivery_status) VALUES (:order_id, :carrier_id, :tracking_number, :origin_warehouse_id, :shipped_date, :estimated_delivery_date, :delivered_date, :delivery_status)", shipments_data)

        # Category 7: Support & CSAT
        insert_table(conn, "support_tickets", "INSERT INTO support_tickets (customer_id, assigned_employee_id, order_id, subject, category, priority, status, created_at, resolved_at) VALUES (:customer_id, :assigned_employee_id, :order_id, :subject, :category, :priority, :status, :created_at, :resolved_at)", support_tickets_data)
        insert_table(conn, "support_ticket_messages", "INSERT INTO support_ticket_messages (ticket_id, sender_role, message_body, created_at) VALUES (:ticket_id, :sender_role, :message_body, :created_at)", ticket_messages_data)
        insert_table(conn, "customer_satisfaction_surveys", "INSERT INTO customer_satisfaction_surveys (customer_id, order_id, ticket_id, nps_score, csat_score, comments, survey_date) VALUES (:customer_id, :order_id, :ticket_id, :nps_score, :csat_score, :comments, :survey_date)", csat_data)

        # Category 8: Marketing & Analytics
        insert_table(conn, "marketing_campaigns", "INSERT INTO marketing_campaigns (campaign_name, channel, target_audience, budget, actual_spend, revenue_generated, roi_percentage, start_date, end_date, status) VALUES (:campaign_name, :channel, :target_audience, :budget, :actual_spend, :revenue_generated, :roi_percentage, :start_date, :end_date, :status)", campaigns_data)
        insert_table(conn, "email_campaign_logs", "INSERT INTO email_campaign_logs (campaign_id, customer_id, email_subject, sent_at, opened, clicked, unsubscribed) VALUES (:campaign_id, :customer_id, :email_subject, :sent_at, :opened, :clicked, :unsubscribed)", email_logs_data)
        insert_table(conn, "web_sessions", "INSERT INTO web_sessions (customer_id, session_start, duration_seconds, landing_page, traffic_medium, device_type, browser, converted_to_order) VALUES (:customer_id, :session_start, :duration_seconds, :landing_page, :traffic_medium, :device_type, :browser, :converted_to_order)", web_sessions_data)
        insert_table(conn, "affiliate_partners", "INSERT INTO affiliate_partners (partner_name, website, contact_email, commission_rate_pct, total_referrals, total_commission_earned, payout_status) VALUES (:partner_name, :website, :contact_email, :commission_rate_pct, :total_referrals, :total_commission_earned, :payout_status)", affiliate_data)

        # Category 9: Accounting & Subscriptions
        insert_table(conn, "chart_of_accounts", "INSERT INTO chart_of_accounts (account_code, account_name, account_category, balance) VALUES (:account_code, :account_name, :account_category, :balance)", chart_accounts_data)
        insert_table(conn, "invoices", "INSERT INTO invoices (order_id, customer_id, invoice_number, invoice_date, due_date, subtotal, tax, total, status) VALUES (:order_id, :customer_id, :invoice_number, :invoice_date, :due_date, :subtotal, :tax, :total, :status)", invoices_data)
        insert_table(conn, "subscription_plans", "INSERT INTO subscription_plans (plan_name, billing_interval, price, trial_period_days, features_summary, is_active) VALUES (:plan_name, :billing_interval, :price, :trial_period_days, :features_summary, :is_active)", plans_data)
        insert_table(conn, "customer_subscriptions", "INSERT INTO customer_subscriptions (customer_id, plan_id, status, start_date, renewal_date, cancelled_at, mrr_value) VALUES (:customer_id, :plan_id, :status, :start_date, :renewal_date, :cancelled_at, :mrr_value)", subscriptions_data)


        # 4. Final verification & report
        all_tables = [
            "departments", "job_roles", "employees", "payroll_records", "employee_leave_requests", "performance_reviews",
            "suppliers", "supplier_contracts", "purchase_orders", "purchase_order_items",
            "warehouses", "warehouse_locations", "warehouse_inventory", "inventory_logs",
            "product_categories", "products", "product_variants", "product_tags", "product_tag_mappings",
            "customers", "customer_addresses", "customer_wishlists", "product_reviews",
            "discounts", "orders", "order_items", "payments", "shipping_carriers", "shipments",
            "support_tickets", "support_ticket_messages", "customer_satisfaction_surveys",
            "marketing_campaigns", "email_campaign_logs", "web_sessions", "affiliate_partners",
            "chart_of_accounts", "invoices", "subscription_plans", "customer_subscriptions"
        ]

        print("\n" + "=" * 65)
        print("  [SUCCESS] 40 ENTERPRISE SUPABASE TABLES SEEDED! ")
        print("=" * 65)
        total_rows = 0
        for i, tbl in enumerate(all_tables, 1):
            cnt = conn.execute(text(f'SELECT COUNT(*) FROM "{tbl}"')).scalar()
            total_rows += cnt
            print(f"  [{str(i).zfill(2)}] {tbl.ljust(30)} : {str(cnt).rjust(6)} rows")
        print("-" * 65)
        print(f"  TOTAL ENTERPRISE RECORDS SEEDED : {str(total_rows).rjust(6)} rows across 40 tables!")
        print("=" * 65 + "\n")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "postgresql://postgres:pP8M7xe9tHXETEVn@db.egpnulkdzlwodrmmdfqz.supabase.co:5432/postgres"
    populate_mega_enterprise_supabase(url)
