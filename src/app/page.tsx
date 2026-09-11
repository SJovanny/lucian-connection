import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";

export default async function Home() {
  const locale = await getLocale();
  redirect({ href: "/", locale });
}
