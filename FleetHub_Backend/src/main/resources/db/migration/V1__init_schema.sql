CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL,
    battery_capacity_kwh INT NOT NULL, current_range_km INT NOT NULL,
    assigned_driver_id BIGINT NULL
    );

CREATE TABLE IF NOT EXISTS delivery_stops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    driver_id BIGINT NOT NULL,
    vehicle_id BIGINT NULL,
    order_number VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    sequence_order INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL,
    estimated_arrival DATETIME NULL,
    completed_at DATETIME NULL,
    INDEX idx_stops_driver (driver_id),
    CONSTRAINT fk_stops_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
    );