import { useEffect, useState } from 'react'
import slide1 from '../../assets/login_slide1.webp'
import slide2 from '../../assets/login_slide2.webp'
import slide3 from '../../assets/login_slide3.webp'
import './login-slideshow.css'

type LoginSlide = {
  image: string
  title: string
  subtitle: string
}

const SLIDES: LoginSlide[] = [
  { image: slide1, title: 'Welcome to University HomeStay POS', subtitle: 'Your smarter way to manage sales.' },
  { image: slide2, title: 'Food & Meal Management', subtitle: 'Manage snacks, meals, and drinks with ease.' },
  { image: slide3, title: 'Sales & Transactions', subtitle: 'Track every transaction with confidence.' }
]

export function LoginSlideshow() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(media.matches)
    media.addEventListener('change', updatePreference)
    return () => media.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const timer = window.setTimeout(() => setActiveSlide((current) => (current + 1) % SLIDES.length), 5_000)
    return () => window.clearTimeout(timer)
  }, [activeSlide, cycle, reducedMotion])

  function selectSlide(index: number): void {
    setActiveSlide(index)
    setCycle((current) => current + 1)
  }

  return (
    <section className="login-slideshow" aria-label="University HomeStay POS highlights">
      <div className="login-slideshow__images">
        {SLIDES.map((slide, index) => <img key={slide.image} src={slide.image} alt="" className={index === activeSlide ? 'is-active' : ''} />)}
      </div>
      <div className="login-slideshow__shade" />
      <div className="login-slideshow__caption">
        <h2>{SLIDES[activeSlide].title}</h2>
        <p>{SLIDES[activeSlide].subtitle}</p>
        <div className="login-slideshow__dots" aria-label="Choose slideshow image">
          {SLIDES.map((slide, index) => <button key={slide.title} type="button" className={index === activeSlide ? 'is-active' : ''} aria-label={`Show slide ${index + 1}: ${slide.title}`} aria-current={index === activeSlide ? 'true' : undefined} onClick={() => selectSlide(index)} />)}
        </div>
      </div>
    </section>
  )
}
