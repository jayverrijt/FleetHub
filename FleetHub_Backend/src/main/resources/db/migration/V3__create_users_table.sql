CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Wachtwoord is 'password123' voor beide accounts ;)
INSERT INTO users (id, email, password, full_name, role) VALUES
(1, 'driver1@fleethub.nl', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'John Doe (Chauffeur)', 'ROLE_COURIER'),
(2, 'dispatcher@fleethub.nl', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Jane Smith (Planner)', 'ROLE_DISPATCHER')
ON DUPLICATE KEY UPDATE id=id;
