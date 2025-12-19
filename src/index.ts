import 'dotenv/config'
import Fastify from 'fastify';
import { createClient } from '@supabase/supabase-js';

const fastify = Fastify();

const { ADDRESS = '0.0.0.0', PORT = '8000' } = process.env;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

fastify.get('/', async (request, reply) => {
  return { message: 'Hello world!' };
});

fastify.listen({ host: ADDRESS, port: parseInt(PORT, 10) }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
  console.log(supabaseUrl);
});

export default supabase