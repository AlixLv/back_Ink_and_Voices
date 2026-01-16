"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseKey = exports.supabaseUrl = void 0;
require("dotenv/config");
var supabase_js_1 = require("@supabase/supabase-js");
exports.supabaseUrl = process.env.SUPABASE_URL;
exports.supabaseKey = process.env.SUPABASE_KEY;
if (!exports.supabaseUrl || !exports.supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined');
}
var supabase = (0, supabase_js_1.createClient)(exports.supabaseUrl, exports.supabaseKey);
