import { useEffect } from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ScrollProgress } from "@/components/common/ScrollProgress"
import Home from "@/pages/Home"
import OfferingDetail from "@/pages/OfferingDetail"
import Newsletter from "@/pages/Newsletter"
import NewsletterPost from "@/pages/NewsletterPost"
import Support from "@/pages/Support"
import Admin from "@/pages/Admin"
import NotFound from "@/pages/NotFound"

/** Scroll to top on route change, or to the hash target if present. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <div className="relative min-h-screen">
      <div className="noise" aria-hidden="true" />
      <ScrollProgress />
      <ScrollManager />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solutions/:slug" element={<OfferingDetail />} />
          <Route path="/services/:slug" element={<OfferingDetail />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/newsletter/:slug" element={<NewsletterPost />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
