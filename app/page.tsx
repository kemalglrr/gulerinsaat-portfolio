import Navigation from './(public)/components/Navigation'
import Hero from './(public)/components/Hero'
import Projects from './(public)/components/Projects'
import Contact from './(public)/components/Contact'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Projects />
      <Contact />
    </main>
  )
}
