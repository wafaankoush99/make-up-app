DROP TABLE IF EXISTS makeup;
CREATE TABLE makeup(
    id SERIAL PRIMARY KEY,
    productname VARCHAR(255),
    price VARCHAR(255),
    img VARCHAR(255),
    descrip TEXT
)
