/**
 * 관리자 계정 생성 스크립트
 *
 * 사용법:
 *   node scripts/create-admin.js <이메일> <비밀번호> [이름]
 *
 * 예시:
 *   node scripts/create-admin.js admin@anseonggold.co.kr mypassword 관리자
 *
 * 실행 전 .env.local에 Supabase 설정이 필요합니다.
 */

const { createClient } = require("@supabase/supabase-js");
const { createHash } = require("crypto");

require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ .env.local에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요.");
  process.exit(1);
}

const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.error("사용법: node scripts/create-admin.js <이메일> <비밀번호> [이름]");
  process.exit(1);
}

async function main() {
  const db = createClient(supabaseUrl, serviceRoleKey);
  const passwordHash = createHash("sha256").update(password).digest("hex");

  const { data, error } = await db
    .from("admin_users")
    .insert({
      email,
      password_hash: passwordHash,
      name: name || "관리자",
    })
    .select()
    .single();

  if (error) {
    console.error("❌ 생성 실패:", error.message);
    process.exit(1);
  }

  console.log("✅ 관리자 계정이 생성되었습니다.");
  console.log(`   이메일: ${data.email}`);
  console.log(`   이름: ${data.name}`);
}

main();
