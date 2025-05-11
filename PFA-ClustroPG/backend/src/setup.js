const { Pool } = require('pg');

const pool = new Pool({
  user: 'authuser',
  host: 'localhost',
  database: 'authdb',
  password: 'secret123',
  port: 5432,
});

const createUsersTable = async () => {
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar'
      ) THEN
        ALTER TABLE users ADD COLUMN avatar TEXT;
      END IF;
    END;
    $$;
  `);
  console.log('✅ Users table altered (avatar column ensured)');
  process.exit();
};

createUsersTable();