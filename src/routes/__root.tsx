import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/90 backdrop-blur border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10 md:py-6">
        <Link to="/" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="font-serif text-xl tracking-tight md:text-2xl">Studio Demo</span>
          <span className="eyebrow mt-1 text-[0.6rem]">Hair studio · demo</span>
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="link-underline text-[0.72rem] uppercase tracking-[0.28em] text-foreground/80 hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Link to="/booking" className="btn-outline">
            Book
          </Link>
        </div>
        <button
          className="md:hidden p-2 -mr-2"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="flex flex-col gap-1.5">
            <span
              className={`h-px w-6 bg-foreground transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-6 bg-foreground transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </div>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <nav className="flex flex-col px-6 py-6 gap-5">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-[0.75rem] uppercase tracking-[0.28em]"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/booking"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 w-full text-center"
            >
              Book Appointment
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 grid gap-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-3xl md:text-4xl leading-tight max-w-md">
            Beauty crafted with care.
            <br />A fictional demo studio.
          </div>
          <Link to="/booking" className="btn-outline mt-8 inline-block">
            Book an Appointment
          </Link>
        </div>
        <div>
          <div className="eyebrow mb-4">Visit</div>
          <p className="text-sm leading-relaxed text-foreground/80">
            Rua Exemplo 123
            <br />
            0000-000 Cidade Demo
          </p>
          <div className="eyebrow mt-6 mb-3">Hours</div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Tue – Fri · 10:00 – 20:00
            <br />
            Sat · 09:00 – 18:00
            <br />
            Sun – Mon · Closed
          </p>
        </div>
        <div>
          <div className="eyebrow mb-4">Contact</div>
          <a href="tel:+351000000000" className="link-underline block text-sm">
            +351 000 000 000
          </a>
          <a href="mailto:hello@example.com" className="link-underline block text-sm mt-2">
            hello@example.com
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="link-underline block text-sm mt-2"
          >
            Instagram
          </a>
          <div className="eyebrow mt-6 mb-3">Menu</div>
          <div className="flex flex-col gap-2">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="link-underline text-sm w-fit">
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} Studio Demo. Fictional business for demonstration only.
          </span>
          <span className="tracking-[0.2em] uppercase">Demo project</span>
        </div>
      </div>
    </footer>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-24">
      <div className="max-w-md text-center">
        <div className="eyebrow">404</div>
        <h1 className="mt-4 font-serif text-5xl">Page not found</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you're looking for has drifted away.
        </p>
        <div className="mt-8">
          <Link to="/" className="btn-outline">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-24">
      <div className="max-w-md text-center">
        <div className="eyebrow">Something went wrong</div>
        <h1 className="mt-4 font-serif text-4xl">This page didn't load</h1>
        <p className="mt-4 text-sm text-muted-foreground">Try refreshing or return home.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary"
          >
            Try again
          </button>
          <a href="/" className="btn-outline">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Studio Demo — Salon Booking Demo" },
      {
        name: "description",
        content:
          "Balayage, hair colour, bridal styling and beauty crafted with precision and care. A fictional salon used to demo online booking.",
      },
      { name: "author", content: "Studio Demo" },
      { property: "og:site_name", content: "Studio Demo" },
      { property: "og:title", content: "Studio Demo — Salon Booking Demo" },
      {
        property: "og:description",
        content:
          "Balayage, hair colour, bridal styling and beauty crafted with precision and care. A fictional salon used to demo online booking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Studio Demo — Salon Booking Demo" },
      {
        name: "twitter:description",
        content:
          "Balayage, hair colour, bridal styling and beauty crafted with precision and care. A fictional salon used to demo online booking.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Inter:wght@300;400;500&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HairSalon",
          name: "Studio Demo",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Rua Exemplo 123",
            addressLocality: "Cidade Demo",
            addressCountry: "PT",
          },
          telephone: "+351000000000",
          priceRange: "€€€",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
