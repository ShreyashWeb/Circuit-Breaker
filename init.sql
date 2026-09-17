-- Create databases needed by the microservices
CREATE DATABASE IF NOT EXISTS inventory_db;
CREATE DATABASE IF NOT EXISTS recommendation_db;

-- Grant root access to both
GRANT ALL PRIVILEGES ON inventory_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON recommendation_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
