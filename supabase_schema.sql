-- Supabase Schema for SafeCut

-- Creating 'users' table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('client', 'barber')) NOT NULL
);

-- Creating 'districts' table
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE
);

-- Insert default data into 'districts'
INSERT INTO districts (name, is_active)
VALUES ('Північний', TRUE);

-- Creating 'barbers' table
CREATE TABLE barbers (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    photo_url VARCHAR(255),
    district_id INT REFERENCES districts(id)
);

-- Creating 'services' table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE
);

-- Insert default data into 'services'
INSERT INTO services (name, price)
VALUES ('Стрижка', 500.00),
       ('Борода', 100.00),
       ('Батько і Син', 300.00);

-- Creating 'bookings' table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES users(id),
    barber_id INT NOT NULL REFERENCES barbers(id),
    date DATE NOT NULL,
    time_slot VARCHAR(10) CHECK (time_slot IN ('10:00', '12:00', '14:00', '16:00', '18:00', '20:00')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'completed', 'rejected')) DEFAULT 'pending',
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'crypto')) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);

-- Creating 'messages' table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id),
    sender_id INT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
