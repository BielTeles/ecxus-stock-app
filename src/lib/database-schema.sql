-- =====================================================
-- ECXUS STOCK APP - DATABASE SCHEMA
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: products (componentes eletrônicos)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit VARCHAR(10) NOT NULL DEFAULT 'pcs',
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (purchase_price >= 0),
    sell_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (sell_price >= 0),
    min_stock INTEGER NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    location VARCHAR(50),
    supplier VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);
CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity);

-- =====================================================
-- TABELA: finished_products (produtos acabados)
-- =====================================================
CREATE TABLE IF NOT EXISTS finished_products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(20) NOT NULL CHECK (category IN ('SMD', 'PTH', 'MIXED')),
    estimated_time INTEGER NOT NULL DEFAULT 0 CHECK (estimated_time >= 0), -- em minutos
    sell_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (sell_price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISCONTINUED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_finished_products_code ON finished_products(code);
CREATE INDEX IF NOT EXISTS idx_finished_products_category ON finished_products(category);
CREATE INDEX IF NOT EXISTS idx_finished_products_status ON finished_products(status);

-- =====================================================
-- TABELA: bom_items (Bill of Materials - Lista de Materiais)
-- =====================================================
CREATE TABLE IF NOT EXISTS bom_items (
    id BIGSERIAL PRIMARY KEY,
    finished_product_id BIGINT NOT NULL REFERENCES finished_products(id) ON DELETE CASCADE,
    component_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    process VARCHAR(10) NOT NULL CHECK (process IN ('SMD', 'PTH')),
    position VARCHAR(20), -- Ex: R1, C5, U3
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar duplicatas
    UNIQUE(finished_product_id, component_id, position)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_bom_items_finished_product ON bom_items(finished_product_id);
CREATE INDEX IF NOT EXISTS idx_bom_items_component ON bom_items(component_id);

-- =====================================================
-- TABELA: production_orders (ordens de produção)
-- =====================================================
CREATE TABLE IF NOT EXISTS production_orders (
    id BIGSERIAL PRIMARY KEY,
    finished_product_id BIGINT NOT NULL REFERENCES finished_products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    planned_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    planned_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    actual_end_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER NOT NULL DEFAULT 0 CHECK (estimated_duration >= 0), -- em minutos
    notes TEXT,
    assigned_operator VARCHAR(100),
    station VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints de datas
    CHECK (planned_end_date >= planned_start_date),
    CHECK (actual_end_date IS NULL OR actual_start_date IS NOT NULL),
    CHECK (actual_end_date IS NULL OR actual_end_date >= actual_start_date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_production_orders_finished_product ON production_orders(finished_product_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_orders_priority ON production_orders(priority);
CREATE INDEX IF NOT EXISTS idx_production_orders_dates ON production_orders(planned_start_date, planned_end_date);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finished_products_updated_at 
    BEFORE UPDATE ON finished_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bom_items_updated_at 
    BEFORE UPDATE ON bom_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_orders_updated_at 
    BEFORE UPDATE ON production_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Opcional para multi-tenancy
-- =====================================================

-- Habilitar RLS (descomente para usar)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE finished_products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo para usuários autenticados)
-- CREATE POLICY "Allow all for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow all for authenticated users" ON finished_products FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow all for authenticated users" ON bom_items FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow all for authenticated users" ON production_orders FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- DADOS DE EXEMPLO (opcional)
-- =====================================================

-- Inserir algumas categorias de exemplo
INSERT INTO products (name, code, description, category, quantity, unit, purchase_price, sell_price, min_stock, location, supplier) VALUES
('Resistor 10K 0805', 'R-10K-0805', 'Resistor SMD 10K ohm 0805', 'Resistores', 1000, 'pcs', 0.01, 0.02, 100, 'A1-01', 'Mouser'),
('Capacitor 100nF 0603', 'C-100N-0603', 'Capacitor cerâmico 100nF 0603', 'Capacitores', 500, 'pcs', 0.03, 0.05, 50, 'A1-02', 'Digikey'),
('LED Verde 3mm', 'LED-G-3MM', 'LED verde 3mm THT', 'LEDs', 200, 'pcs', 0.10, 0.20, 20, 'B2-01', 'Farnell')
ON CONFLICT (code) DO NOTHING;

-- Inserir um produto acabado de exemplo
INSERT INTO finished_products (name, code, description, category, estimated_time, sell_price, status) VALUES
('Circuito LED Simples', 'CIRCUIT-LED-001', 'Circuito com LED e resistor limitador', 'MIXED', 15, 5.00, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =====================================================

-- View: Produtos com estoque baixo
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    id,
    name,
    code,
    category,
    quantity,
    min_stock,
    (quantity - min_stock) AS stock_difference,
    supplier
FROM products 
WHERE quantity <= min_stock
ORDER BY (quantity - min_stock), category;

-- View: BOM completa com detalhes dos componentes
CREATE OR REPLACE VIEW bom_details AS
SELECT 
    fp.id AS finished_product_id,
    fp.name AS finished_product_name,
    fp.code AS finished_product_code,
    bi.id AS bom_item_id,
    bi.quantity AS bom_quantity,
    bi.process,
    bi.position,
    p.id AS component_id,
    p.name AS component_name,
    p.code AS component_code,
    p.category AS component_category,
    p.quantity AS available_quantity,
    p.purchase_price,
    (bi.quantity * p.purchase_price) AS total_cost,
    CASE 
        WHEN p.quantity >= bi.quantity THEN 'OK'
        ELSE 'INSUFFICIENT'
    END AS availability_status
FROM bom_items bi
JOIN finished_products fp ON bi.finished_product_id = fp.id
JOIN products p ON bi.component_id = p.id
ORDER BY fp.name, bi.process, bi.position;

-- View: Ordens de produção com detalhes
CREATE OR REPLACE VIEW production_orders_details AS
SELECT 
    po.id,
    po.quantity,
    po.status,
    po.priority,
    po.planned_start_date,
    po.planned_end_date,
    po.actual_start_date,
    po.actual_end_date,
    po.estimated_duration,
    po.assigned_operator,
    po.station,
    fp.name AS product_name,
    fp.code AS product_code,
    fp.category AS product_category,
    po.created_at,
    po.updated_at
FROM production_orders po
JOIN finished_products fp ON po.finished_product_id = fp.id
ORDER BY po.created_at DESC;

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função: Calcular custo total de uma BOM
CREATE OR REPLACE FUNCTION calculate_bom_cost(finished_product_id_param BIGINT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_cost DECIMAL(10,2) := 0;
BEGIN
    SELECT COALESCE(SUM(bi.quantity * p.purchase_price), 0)
    INTO total_cost
    FROM bom_items bi
    JOIN products p ON bi.component_id = p.id
    WHERE bi.finished_product_id = finished_product_id_param;
    
    RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Função: Verificar disponibilidade para produção
CREATE OR REPLACE FUNCTION check_production_availability(
    finished_product_id_param BIGINT,
    quantity_param INTEGER
)
RETURNS TABLE(
    component_id BIGINT,
    component_name VARCHAR(100),
    needed INTEGER,
    available INTEGER,
    sufficient BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        (bi.quantity * quantity_param) AS needed,
        p.quantity AS available,
        (p.quantity >= bi.quantity * quantity_param) AS sufficient
    FROM bom_items bi
    JOIN products p ON bi.component_id = p.id
    WHERE bi.finished_product_id = finished_product_id_param;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE products IS 'Tabela de componentes eletrônicos do estoque';
COMMENT ON TABLE finished_products IS 'Tabela de produtos acabados que podem ser manufaturados';
COMMENT ON TABLE bom_items IS 'Bill of Materials - lista de componentes necessários para cada produto acabado';
COMMENT ON TABLE production_orders IS 'Ordens de produção para manufatura dos produtos acabados';

COMMENT ON COLUMN products.min_stock IS 'Estoque mínimo para alertas de reposição';
COMMENT ON COLUMN finished_products.estimated_time IS 'Tempo estimado de produção em minutos';
COMMENT ON COLUMN production_orders.estimated_duration IS 'Duração estimada da ordem em minutos';

-- =====================================================
-- FIM DO SCHEMA
-- ===================================================== 