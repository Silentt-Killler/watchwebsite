import HeroSlider from '@/components/home/HeroSlider'
import CategorySection from '@/components/home/CategorySection'
import ProductSection from '@/components/home/ProductSection'
import BrandSection from '@/components/home/BrandSection'

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <CategorySection />
      <ProductSection />
      <BrandSection />
      {/* Add more sections here later */}
    </>
  )
}
