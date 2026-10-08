INSERT INTO vehicles (license_plate, model, status, battery_capacity_kwh, current_range_km, assigned_driver_id)
VALUES
    ('VH-01-AB', 'Nissan e-NV200', 'AVAILABLE', 40, 180, 1),
    ('VH-02-CD', 'Renault Kangoo E-Tech', 'ON_ROUTE', 45, 210, 2)
    ON DUPLICATE KEY UPDATE license_plate=license_plate;

INSERT INTO delivery_stops (driver_id, vehicle_id, order_number, recipient_name, sequence_order, address, city, status, estimated_arrival)
VALUES
    (1, 1, 'ORD-1001', 'Jan de Vries', 1, 'Rachelsmolen 1', 'Eindhoven', 'PENDING', NOW()),
    (1, 1, 'ORD-1002', 'Sophie Jansen', 2, 'Frederiklaan 10', 'Eindhoven', 'PENDING', NOW())
    ON DUPLICATE KEY UPDATE sequence_order=sequence_order;