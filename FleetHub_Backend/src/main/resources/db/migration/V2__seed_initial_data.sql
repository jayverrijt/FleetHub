-- 1. Voertuigen
INSERT INTO vehicles (id, license_plate, model, status, battery_capacity_kwh, current_range_km, assigned_driver_id)
VALUES 
    (1, 'VH-01-AB', 'Nissan e-NV200', 'ON_ROUTE', 40, 180, 1),
    (2, 'VH-02-CD', 'Renault Kangoo E-Tech', 'ON_ROUTE', 45, 210, 2)
ON DUPLICATE KEY UPDATE 
    license_plate = VALUES(license_plate),
    assigned_driver_id = VALUES(assigned_driver_id);

-- 2. Routes
INSERT INTO routes (id, name, driver_id, vehicle_id, status)
VALUES
    (104, 'Route #104 - Eindhoven & Helmond', 1, 1, 'IN_PROGRESS'),
    (105, 'Route #105 - Tilburg & Veldhoven', 2, 2, 'IN_PROGRESS')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    status = VALUES(status);

-- 3. STOPS VOOR ROUTE #104 (Driver 1: Alleen Eindhoven -> Helmond)
INSERT INTO delivery_stops (id, route_id, driver_id, order_number, recipient_name, sequence_order, address, city, latitude, longitude, status, estimated_arrival)
VALUES
    (1, 104, 1, 'ORD-1001', 'Fontys Rachelsmolen R1', 1, 'Rachelsmolen 1', 'Eindhoven', 51.4518, 5.4815, 'PENDING', NOW() + INTERVAL 30 MINUTE),
    (2, 104, 1, 'ORD-1002', 'Sophie Jansen', 2, 'Frederiklaan 10', 'Eindhoven', 51.4419, 5.4674, 'PENDING', NOW() + INTERVAL 60 MINUTE),
    (3, 104, 1, 'ORD-1004-SENKAYA', 'Senkaya Kebab Doner', 3, 'Marconilaan 23-B', 'Eindhoven', 51.4521, 5.4608, 'PENDING', NOW() + INTERVAL 90 MINUTE),
    (4, 104, 1, 'ORD-TEST-PICNICHLM', 'Klant Picnic Helmond', 4, 'Duizeldonksestraat 15', 'Helmond', 51.4682, 5.6698, 'PENDING', NOW() + INTERVAL 120 MINUTE),
    (5, 104, 1, 'ORD-1003', 'Jay Verrijt', 5, 'Kievitstraat 36', 'Helmond', 51.48865, 5.6552, 'PENDING', NOW() + INTERVAL 150 MINUTE)
ON DUPLICATE KEY UPDATE 
    sequence_order = VALUES(sequence_order),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude);

-- 4. STOPS VOOR ROUTE #105 (Driver 2: Tilburg & Veldhoven)
INSERT INTO delivery_stops (id, route_id, driver_id, order_number, recipient_name, sequence_order, address, city, latitude, longitude, status, estimated_arrival)
VALUES
    (6, 105, 2, 'ORD-2001', 'Daan Peters', 1, 'Heuvelstraat 42', 'Tilburg', 51.5562, 5.0864, 'PENDING', NOW() + INTERVAL 30 MINUTE),
    (7, 105, 2, 'ORD-2002', 'Emma Hermans', 2, 'Kerkstraat 8', 'Veldhoven', 51.4182, 5.4042, 'PENDING', NOW() + INTERVAL 60 MINUTE)
ON DUPLICATE KEY UPDATE 
    sequence_order = VALUES(sequence_order),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude);
