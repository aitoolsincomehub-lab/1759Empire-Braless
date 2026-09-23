import Link from "next/link";
import BrandedMedia from "@/components/BrandedMedia";
import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";
import { getPublicCatalogue, isApprovedPublicAsset } from "@/lib/catalogue";
import type { MenuItem } from "@/types";

function isDrinkCategory(category: string) {
  return /drink|beverage|cocktail|mocktail|wine|beer|spirit|bar|juice/i.test(category);
}

function MenuGroup({ title, items }: { title: string; items: MenuItem[] }) {
  const groups = Array.from(new Set(items.map((item) => item.category))).map((name) => ({ items: items.filter((item) => item.category === name), name }));

  return <section className="menuSection">
    <div className="menuSectionHeader"><p className="eyebrow">1759 EMPIRE</p><h2>{title}</h2></div>
    {groups.length === 0 ? <p className="menuEmpty">No {title.toLowerCase()} are currently published.</p> : groups.map((group) => {
      const label = group.name || "Menu";
      return <section className="menuCategory" id={label.toLowerCase().replace(/[^a-z0-9]+/g, "-")} key={label}>
        <h3>{label}</h3>
        <div className="menuItems">{group.items.map((item) => <article className="menuItem" key={item.id}>
          {isApprovedPublicAsset(item.image_url) && <BrandedMedia className="menuItemImage" src={item.image_url || ""} alt={item.name} fallback={item.name} />}
          <div className="menuItemCopy"><div className="menuItemHeading"><h4>{item.name}</h4>{item.price > 0 && <strong>₦{item.price.toLocaleString()}</strong>}</div>{item.description && <p>{item.description}</p>}</div>
        </article>)}</div>
      </section>;
    })}
  </section>;
}

export default async function MenuPage() {
  const catalogue = await getPublicCatalogue();
  const food = catalogue.menu.filter((item) => !isDrinkCategory(item.category));
  const drinks = catalogue.menu.filter((item) => isDrinkCategory(item.category));
  const whatsapp = catalogue.settings.whatsapp_number;

  return <main className="menuPage">
    <nav className="nav darkNav menuNav"><Link className="brand" href="/">1759 <span>EMPIRE</span></Link><div className="navActions"><Link className="textButton dark" href="/">Back home</Link>{whatsapp && <TrackedWhatsAppLink className="textButton dark" context="menu" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello 1759 Empire, I would like to enquire about dining.")}`}>Dining enquiry</TrackedWhatsAppLink>}</div></nav>
    <header className="menuHero"><p className="eyebrow">DINE · DRINK</p><h1>The 1759<br /><em>menu.</em></h1><p>Food for the table, drinks for the night and a reason to stay a little longer.</p><nav className="menuCategoryNav" aria-label="Menu sections"><a href="#food">Food</a><a href="#drinks">Drinks</a></nav></header>
    <div className="menuContent"><div id="food"><MenuGroup title="Food" items={food} /></div><div id="drinks"><MenuGroup title="Drinks" items={drinks} /></div></div>
    <section className="menuCta"><p className="eyebrow">PLAN YOUR VISIT</p><h2>Come hungry.<br /><em>Stay for the atmosphere.</em></h2>{whatsapp && <TrackedWhatsAppLink className="button" context="menu_cta" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello 1759 Empire, I would like to enquire about dining.")}`}>Enquire about dining</TrackedWhatsAppLink>}</section>
  </main>;
}