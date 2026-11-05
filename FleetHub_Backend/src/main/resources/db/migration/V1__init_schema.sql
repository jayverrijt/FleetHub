-- 1. Voertuigen
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL,
    battery_capacity_kwh INT NOT NULL,
    current_range_km INT NOT NULL,
    assigned_driver_id BIGINT NULL
);

-- 2. Routes (moet vóór delivery_stops staan!)
CREATE TABLE IF NOT EXISTS routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    driver_id BIGINT NULL,
    vehicle_id BIGINT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_routes_driver (driver_id),
    CONSTRAINT fk_routes_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- 3. Afleverstops (verwijst naar routes)
CREATE TABLE IF NOT EXISTS delivery_stops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT NULL,
    driver_id BIGINT NOT NULL,
    order_number VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    sequence_order INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DOUBLE NULL,
    longitude DOUBLE NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    estimated_arrival DATETIME NULL,
    completed_at DATETIME NULL,
    CONSTRAINT uq_stops_order_number UNIQUE (order_number),
    CONSTRAINT fk_stops_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_stops_driver (driver_id),
    INDEX idx_stops_route (route_id)
);
