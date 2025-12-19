import Fastify from 'fastify';
//import supabase from "./../config/supabase.config.js";
import { supabaseUrl } from "./config/supabase.config.js";
//import supabase from 'C:/Users/Térence/Desktop/RNCP6-CODE/back_Ink_and_Voices/config/supabase.config'
const fastify = Fastify();
const { ADDRESS = '0.0.0.0', PORT = '8000' } = process.env;
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
//# sourceMappingURL=index.js.map