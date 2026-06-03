import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";
import Team from "../components/landing/Team";

function Landing() {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <CTA />
            <Team />
            <Footer />
        </>
    );
}

export default Landing;