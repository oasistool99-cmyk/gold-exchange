import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 공개 클라이언트 (브라우저용 - published 글만 읽기 가능)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 관리자 클라이언트 (서버 전용 - 모든 작업 가능)
export function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}
