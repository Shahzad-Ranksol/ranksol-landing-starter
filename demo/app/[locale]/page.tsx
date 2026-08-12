import { useTranslations } from "next-intl";
import { Preloader } from "@/components/ui/preloader";
import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Tour3D } from "@/components/sections/tour-3d";
import { Residences } from "@/components/sections/residences";
import { Amenities } from "@/components/sections/amenities";
import { Location } from "@/components/sections/location";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  const t = useTranslations("loading");

  return (
    <>
      <Preloader label={t("label")} />
      <Nav />
      <main>
        <Hero />
        <About />
        <Tour3D />
        <Residences />
        <Amenities />
        <Location />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
