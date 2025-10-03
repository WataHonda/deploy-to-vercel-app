import { NextResponse } from "next/server";

export async function GET() {
  // サーバーのコンソールにメッセージを出力します
  console.log("Cron job executed at:", new Date().toISOString());
  // APIにアクセスした際に、成功したことを示すJSONを返します
  return NextResponse.json({
    message: "🎉 Cron job executed successfully!",
  });
}
