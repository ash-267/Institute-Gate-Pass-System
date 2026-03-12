import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import CollegeBuilding from "../img/College_building.jpeg"
import TechEvents from "../img/Campus_during_technical_events.jpeg"
import SeminarHall from "../img/Seminar_hall.jpeg"
import TEDxTeam from "../img/TEDxMMCOE_team_and_speakers.jpeg"
import "./actual.css"

const Actual = () => {
    const slides = [
        { src: CollegeBuilding, alt: "MMCOE College Building" },
        { src: TechEvents, alt: "Campus during technical events" },
        { src: SeminarHall, alt: "Seminar Hall" },
        { src: TEDxTeam, alt: "TEDxMMCOE Team and Speakers" },
    ]

    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [slides.length])

    const goToSlide = (index) => setCurrentSlide(index)
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

    return (
        <div className="home-page">

            <section className="hero-section">
                <div className="slideshow">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`slide ${index === currentSlide ? "active" : ""}`}
                        >
                            <img src={slide.src} alt={slide.alt} />
                        </div>
                    ))}

                    <button className="slide-arrow prev" onClick={prevSlide}>&#10094;</button>
                    <button className="slide-arrow next" onClick={nextSlide}>&#10095;</button>

                    <div className="slide-dots">
                        {slides.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${index === currentSlide ? "active" : ""}`}
                                onClick={() => goToSlide(index)}
                            />
                        ))}
                    </div>
                </div>

                <div className="hero-overlay">
                    <h1>SecuredVisits</h1>
                    <p>Campus Digital Gate Pass & Visitor Management System</p>
                    <Link to="/register" className="hero-btn">Register Your Visit</Link>
                </div>
            </section>

            <section className="info-section">
                <h2>About the Institute</h2>
                <div className="info-content">
                    <p>
                        Recognized as the <strong>BEST COLLEGE</strong> by SPPU, <strong>MMCOE</strong> is one of the prestigious feathers in the elite cap of Marathwada Mitra Mandal's <strong>Group of Institutions</strong>, Pune. This recognition stands as a validation of our commitment to <strong>Outcome Based Education</strong>. Since its inception in the year 2006, MMCOE has been recognized as the place <strong>Where Innovation Meets Excellence in Service of Society</strong> with the sole motto of <em>'Welfare of the Masses'</em>.
                    </p>
                    <p>
                        At MMCOE, we don't just educate engineers – we shape the problem-solvers, innovators, and leaders who will define tomorrow. Recognized as the Best <strong>Autonomous</strong> engineering institution under Savitribai Phule Pune University, we have consistently set the benchmark for <strong>academic excellence, cutting-edge research, and holistic student development, in sync with the New Education Policy (NEP) 2020</strong>.
                    </p>
                    <p>
                        What truly sets us apart is our distinguished faculty – accomplished academicians and industry veterans, who mentor students with dedication and expertise. With a strong disposition towards <strong>OBE (Outcome Based Education)</strong>, our robust industry partnerships translate into exceptional placement opportunities, with leading global companies consistently recruiting from our campus.
                    </p>
                    <p>
                        All our UG programs are NBA accredited providing tremendous strength to our Placements. Through teaching, research, and innovation, MMCOE's exceptional community pursues and eventually achieves its mission of <strong>'Welfare of the Masses.'</strong>
                    </p>

                    <h3 className="sub-heading">Fostering Technical Education!</h3>
                    <p>
                        The college has an active <strong>Robotics cell, NCC, Training and Placement cell</strong>, along with <strong>FMCIII</strong>, Incubation & Innovation centre — an initiative by MMCOE, Pune. In collaboration with Tata Technologies Ltd. and Science & Technology Park, FMCIII provides the ideal environment for startups to thrive in Pune. <strong>Through FMCIII we have 40+ Actively Engaging Startups, 20Cr Funding Raised by Program Startups, 40+ Programs, 50+ Value Partners, 100+ Events, 60+ Corporate Engagements, 15+ International Connects, 100+ Mentors.</strong>
                    </p>
                </div>
            </section>

            <section className="quick-links-section">
                <h2>Quick Access</h2>
                <div className="quick-links-grid">
                    <Link to="/register" className="quick-card">
                        <span className="quick-icon">📝</span>
                        <h3>Register Visit</h3>
                        <p>Pre-register your campus visit online</p>
                    </Link>
                    <Link to="/login" className="quick-card">
                        <span className="quick-icon">🔐</span>
                        <h3>Staff Login</h3>
                        <p>Security, Host & Admin access</p>
                    </Link>
                    <div className="quick-card">
                        <span className="quick-icon">📲</span>
                        <h3>Contact Us</h3>
                        <p>+91 1234567890</p>
                    </div>
                    <div className="quick-card">
                        <span className="quick-icon">📍</span>
                        <h3>Location</h3>
                        <p>Survey No. 18, Plot No. 5/3, Behind Vandevi Temple, Karvenagar, Pune, Maharashtra, 411052</p>
                    </div>
                </div>
            </section>

            <section className="events-section">
                <h2>Latest Events & Notices</h2>
                <div className="events-list">
                    <div className="event-card">
                        <div className="event-date">
                            <span className="day">15</span>
                            <span className="month">MAR</span>
                        </div>
                        <div className="event-info">
                            <h3>Annual Technical Festival</h3>
                            <p>Join us for three days of innovation, workshops, and competitions.</p>
                        </div>
                    </div>
                    <div className="event-card">
                        <div className="event-date">
                            <span className="day">20</span>
                            <span className="month">MAR</span>
                        </div>
                        <div className="event-info">
                            <h3>Campus Placement Drive</h3>
                            <p>Top companies visiting for recruitment. Eligible students must register.</p>
                        </div>
                    </div>
                    <div className="event-card">
                        <div className="event-date">
                            <span className="day">25</span>
                            <span className="month">MAR</span>
                        </div>
                        <div className="event-info">
                            <h3>Sports Week</h3>
                            <p>Inter-departmental sports competition begins. All are welcome to participate.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="home-footer">
                <p>&copy; 2026 SecuredVisits — Campus Gate Pass Management</p>
            </footer>
        </div>
    )
}

export default Actual
