import type { MediaAssetSection } from "@/types";

export type MediaGuidance = {
  section: MediaAssetSection;
  key: string;
  title: string;
  placement: string;
  purpose: string;
  recommendedWidth: number;
  recommendedHeight: number;
  aspectRatio: string;
  bestImage: string;
  avoid: string;
  cmsReplacementAllowed: boolean;
  subject: string;
  ratio: string;
  dimensions: string;
};

const guidanceBySection: Record<MediaAssetSection, Omit<MediaGuidance, "section" | "key" | "subject" | "ratio" | "dimensions">[]> = {
  hero: [{ title: "Homepage Hero", placement: "Homepage opening section", purpose: "Set the first impression of 1759 Empire.", recommendedWidth: 1920, recommendedHeight: 1080, aspectRatio: "16:9", bestImage: "A strong, well-lit exterior or venue atmosphere photograph.", avoid: "Blurry photos, heavy text, cropped subjects or unrelated locations.", cmsReplacementAllowed: true }],
  rooms: [{ title: "Room Showcase", placement: "Homepage rooms section and booking cards", purpose: "Help guests understand and choose a room.", recommendedWidth: 1600, recommendedHeight: 1200, aspectRatio: "4:3", bestImage: "Clear, well-lit photography of the actual room.", avoid: "Screenshots, dark images, distorted rooms or unrelated venue photos.", cmsReplacementAllowed: true }],
  food: [{ title: "Food and Drinks", placement: "Homepage dining section", purpose: "Make the food and table experience tangible.", recommendedWidth: 1600, recommendedHeight: 1200, aspectRatio: "4:3", bestImage: "An actual 1759 dish, table or bar presentation with clean composition.", avoid: "Stock photos, unreadable menus, excessive text or unrelated dishes.", cmsReplacementAllowed: true }],
  club: [{ title: "Club Klass", placement: "Homepage nightlife section", purpose: "Show the energy and character of the night.", recommendedWidth: 1920, recommendedHeight: 1080, aspectRatio: "16:9", bestImage: "An actual Club Klass crowd, DJ or performance moment.", avoid: "Blurry crowd shots, empty rooms, fake imagery or excessive text.", cmsReplacementAllowed: true }],
  braless: [{ title: "Braless Party", placement: "Homepage Braless section", purpose: "Represent this recurring 1759 experience accurately.", recommendedWidth: 1920, recommendedHeight: 1080, aspectRatio: "16:9", bestImage: "An actual Braless Party atmosphere, performer or room moment.", avoid: "Unrelated nightlife, misleading posters or cut-off subjects.", cmsReplacementAllowed: true }],
  events: [{ title: "Event Feature", placement: "Homepage and event pages", purpose: "Help guests recognise the event and decide to enquire.", recommendedWidth: 1600, recommendedHeight: 1200, aspectRatio: "4:3", bestImage: "Approved artwork or a real event image tied to the event.", avoid: "Outdated posters, unreadable text, unrelated events or invented imagery.", cmsReplacementAllowed: true }],
  tv: [{ title: "Viewing Centre", placement: "Homepage lounge and viewing section", purpose: "Show the real viewing-centre experience.", recommendedWidth: 1920, recommendedHeight: 1080, aspectRatio: "16:9", bestImage: "The actual screens, lounge or guest viewing experience.", avoid: "Unrelated sports images, excessive text or misleading venue claims.", cmsReplacementAllowed: true }],
  gallery: [{ title: "Gallery Moment", placement: "Homepage atmosphere gallery", purpose: "Give guests a truthful sense of the wider experience.", recommendedWidth: 1600, recommendedHeight: 1200, aspectRatio: "4:3", bestImage: "A real 1759 moment with a clear subject and natural composition.", avoid: "Duplicates, blurry images, screenshots or unrelated places.", cmsReplacementAllowed: true }],
  venue: [{ title: "Venue Image", placement: "Venue and business information areas", purpose: "Explain the physical place guests will visit.", recommendedWidth: 1920, recommendedHeight: 1080, aspectRatio: "16:9", bestImage: "An actual 1759 space, entrance or guest-facing area.", avoid: "Stock photography, invented views or images with important details cut off.", cmsReplacementAllowed: true }],
  media: [{ title: "Media Feature", placement: "Media library and media hub", purpose: "Organise approved campaign and editorial content.", recommendedWidth: 1600, recommendedHeight: 1200, aspectRatio: "4:3", bestImage: "Approved 1759 campaign, behind-the-scenes or atmosphere content.", avoid: "Unapproved material, watermarks, unrelated brands or excessive text.", cmsReplacementAllowed: true }],
  dj: [{ title: "DJ Session", placement: "DJ and session media", purpose: "Identify the performer or session clearly.", recommendedWidth: 1920, recommendedHeight: 1080, aspectRatio: "16:9", bestImage: "An actual DJ booth, performer or audience moment.", avoid: "Generic stock club images, blurry frames or unrelated performers.", cmsReplacementAllowed: true }],
  conversation: [{ title: "Empire Conversation", placement: "Interview and conversation media", purpose: "Make the speaker and conversation recognisable.", recommendedWidth: 1920, recommendedHeight: 1080, aspectRatio: "16:9", bestImage: "A clear frame from the actual conversation or interview.", avoid: "Faces cut off, unreadable screenshots or unrelated people.", cmsReplacementAllowed: true }],
  fm: [{ title: "Empire FM", placement: "Radio and audio media", purpose: "Give audio content a truthful visual identity.", recommendedWidth: 1920, recommendedHeight: 1080, aspectRatio: "16:9", bestImage: "The actual studio, presenter, station or live warm-up.", avoid: "Generic radio stock art, invented claims or excessive text.", cmsReplacementAllowed: true }],
};

export function getMediaGuidance(section: MediaAssetSection, index = 0): MediaGuidance {
  const options = guidanceBySection[section];
  const selected = options[index % options.length] || options[0];
  return { section, key: `${section}-${index + 1}`, ...selected, subject: selected.bestImage, ratio: selected.aspectRatio, dimensions: `${selected.recommendedWidth} × ${selected.recommendedHeight}px` };
}

export const mediaGuidanceSections = Object.keys(guidanceBySection) as MediaAssetSection[];
