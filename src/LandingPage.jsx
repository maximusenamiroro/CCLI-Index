import { Home, UtensilsCrossed, Bus, Wifi } from 'lucide-react'

function LandingPage({ onStart }) {
  return (
    <div className="landing">
      <div className="landing-bars" aria-hidden="true">
        <span className="bar bar-1" />
        <span className="bar bar-2" />
        <span className="bar bar-3" />
        <span className="bar bar-4" />
      </div>

      <p className="landing-eyebrow">Campus Cost of Living Index</p>
      <h1 className="landing-title">What does student life actually cost?</h1>
      <p className="landing-sub">
        A short, anonymous survey on housing, food, transport, and everyday
        spending — built by students, for students across Nigeria.
      </p>

      <button className="btn-start" onClick={onStart}>
        Start the survey
      </button>
      <p className="landing-meta">Takes about 5 minutes · fully anonymous</p>

      <div className="landing-categories">
        <div className="category">
          <Home size={18} strokeWidth={1.75} />
          <p>Housing</p>
        </div>
        <div className="category">
          <UtensilsCrossed size={18} strokeWidth={1.75} />
          <p>Food</p>
        </div>
        <div className="category">
          <Bus size={18} strokeWidth={1.75} />
          <p>Transport</p>
        </div>
        <div className="category">
          <Wifi size={18} strokeWidth={1.75} />
          <p>Data</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage