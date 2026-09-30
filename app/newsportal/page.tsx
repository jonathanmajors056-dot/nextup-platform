import { Shell } from "@/components/Shell";
import { NewsPortal } from "@/components/NewsPortal";
import { listNews, listNewsProviders, listSavedNews } from "@/lib/news";
import { getViewerId } from "@/lib/identity";

export const metadata = { title: "NewsPortal — NextUp", description: "Live technology news from India and the world." };

export default async function NewsPortalPage() {
  const viewerId = await getViewerId();
  const [items, saved] = await Promise.all([listNews(), listSavedNews(viewerId)]);
  return <Shell><main className="main news-main"><NewsPortal initialItems={items} initialSaved={saved} providers={listNewsProviders()} /></main></Shell>;
}
