import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
export const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined');
}
const supabase = createClient(supabaseUrl, supabaseKey);
// export default supabase
//# sourceMappingURL=supabase.config.js.map