import type { MetadataRoute } from "next";
import { getPublicCatalogue } from "@/lib/catalogue";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const { events } = await getPublicCatalogue();
	return [{ url: "https://1759empire.com.ng", lastModified: new Date() }, { url: "https://1759empire.com.ng/book", lastModified: new Date() }, { url: "https://1759empire.com.ng/events", lastModified: new Date() }, ...events.filter((event) => event.slug).map((event) => ({ url: `https://1759empire.com.ng/events/${event.slug}`, lastModified: new Date(event.created_at) }))];
}
