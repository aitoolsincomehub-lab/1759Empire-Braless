import type { MetadataRoute } from "next";
import { getPublicCatalogue } from "@/lib/catalogue";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const { events } = await getPublicCatalogue();
	return [{ url: "https://1759empire.com", lastModified: new Date() }, { url: "https://1759empire.com/book", lastModified: new Date() }, { url: "https://1759empire.com/events", lastModified: new Date() }, ...events.filter((event) => event.slug).map((event) => ({ url: `https://1759empire.com/events/${event.slug}`, lastModified: new Date(event.created_at) }))];
}
