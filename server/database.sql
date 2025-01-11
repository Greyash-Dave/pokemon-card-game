CREATE DATABASE pokemon_application;

CREATE TABLE result(
    id SERIAL PRIMARY KEY,
    player VARCHAR(10),
    deck_list text[],
    card_contribution text[],
    status VARCHAR(5)
);