const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Model-like functions for Result
const Result = {
  create: async (data) => {
    const { data: result, error } = await supabase
      .from('result')
      .insert([data])
      .select();
    if (error) throw error;
    return result[0];
  },
  findAll: async (criteria = {}) => {
    let query = supabase.from('result').select('*');
    
    // Add where clauses if criteria provided
    Object.entries(criteria).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  findOne: async (criteria) => {
    let query = supabase.from('result').select('*');
    
    Object.entries(criteria).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  }
};

// Model-like functions for Decklist
const Decklist = {
  create: async (data) => {
    const { data: deck, error } = await supabase
      .from('decks')
      .insert([data])
      .select();
    if (error) throw error;
    return deck[0];
  },
  findAll: async (criteria = {}) => {
    let query = supabase.from('decks').select('*');
    
    Object.entries(criteria).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  findOne: async (criteria) => {
    let query = supabase.from('decks').select('*');
    
    Object.entries(criteria).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  }
};

// Model-like functions for User
const User = {
  create: async (data) => {
    const { data: user, error } = await supabase
      .from('users')
      .insert([data])
      .select();
    if (error) throw error;
    return user[0];
  },
  findOne: async (criteria) => {
    let query = supabase.from('users').select('*');
    
    Object.entries(criteria).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.single();
    if (error && error.code !== 'PGRST116') return null; // No rows returned
    if (error) throw error;
    return data;
  },
  findAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) throw error;
    return data;
  }
};

// Model-like functions for PokemonData
const PokemonData = {
  create: async (data) => {
    const { data: pokemon, error } = await supabase
      .from('pokemon_data')
      .insert([data])
      .select();
    if (error) throw error;
    return pokemon[0];
  },
  findOne: async (criteria) => {
    let query = supabase.from('pokemon_data').select('*');
    
    if (criteria['data.name']) {
      query = query.eq('data->>name', criteria['data.name']);
      delete criteria['data.name'];
    }
    
    Object.entries(criteria).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.single();
    if (error && error.code !== 'PGRST116') return null;
    if (error) throw error;
    return data;
  },
  upsert: async (data) => {
    const { data: pokemon, error } = await supabase
      .from('pokemon_data')
      .upsert(data)
      .select();
    if (error) throw error;
    return pokemon[0];
  }
};

module.exports = {
  supabase,
  Result,
  Decklist,
  User,
  PokemonData
};