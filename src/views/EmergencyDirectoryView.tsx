import { useState } from "react";
import { Phone, ShieldAlert, CheckCircle2, ExternalLink, Clock, Building2, Search } from "lucide-react";
import { OFFICIAL_EMERGENCY_CONTACTS, type EmergencyContact } from "@/lib/jharkhandData";

export function EmergencyDirectoryView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredContacts = OFFICIAL_EMERGENCY_CONTACTS.filter((contact) => {
    const matchesSearch =
      !searchQuery.trim() ||
      contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.hindiTitle.includes(searchQuery) ||
      contact.number.includes(searchQuery) ||
      contact.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || contact.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-bold text-destructive uppercase tracking-wider mb-2">
          <ShieldAlert className="size-3.5 animate-pulse" /> 24x7 Jharkhand Emergency Contacts
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Emergency & Verified Helpline Directory
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Official, verified helpline numbers for Police, Medical Ambulance, Women Safety, Child Protection, Disaster Control, and Chief Minister Jansamvad.
        </p>
      </header>

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emergency service, 112, 181, 108, ambulance, police..."
              className="h-10 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {[
            { id: "All", label: "All Contacts" },
            { id: "police", label: "Police & Fire (112, 101)" },
            { id: "medical", label: "Medical & Ambulance (108)" },
            { id: "women_child", label: "Women & Child Safety (181, 1098)" },
            { id: "gov_helpline", label: "CM Jansamvad (181)" },
            { id: "disaster", label: "Disaster Management (1070)" },
            { id: "legal_aid", label: "Free Legal Aid (15100)" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* EMERGENCY CONTACTS GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {filteredContacts.map((contact) => (
          <article
            key={contact.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                    <CheckCircle2 className="size-3" /> Verified Source
                  </span>
                  <h2 className="text-lg font-extrabold text-foreground mt-1.5 leading-snug">
                    {contact.title}
                  </h2>
                  <p className="text-xs font-semibold text-primary">{contact.hindiTitle}</p>
                </div>

                {/* 1-TAP DIAL BUTTON */}
                <a
                  href={`tel:${contact.number}`}
                  className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-extrabold text-destructive-foreground shadow-md hover:bg-destructive/90 transition-all shrink-0 active:scale-95"
                >
                  <Phone className="size-4 fill-current animate-bounce" />
                  <span>Call {contact.number}</span>
                </a>
              </div>

              <p className="text-xs leading-5 text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50 mt-2">
                {contact.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground flex-wrap gap-2">
              <span className="flex items-center gap-1">
                <Building2 className="size-3.5 text-primary shrink-0" />
                <span className="truncate max-w-[200px]">{contact.department}</span>
              </span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Clock className="size-3 text-emerald-600" />
                {contact.availableHours}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

