import { Hero } from "@/components/home/Hero";
import { LatestPosts } from "@/components/home/LatestPosts";
import { PortalSection } from "@/components/home/PortalSection";
import { ServiceBlocks } from "@/components/home/ServiceBlocks";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiceBlocks />
      <LatestPosts />
      <PortalSection />
    </>
  );
}
