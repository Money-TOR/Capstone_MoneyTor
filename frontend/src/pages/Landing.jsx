import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";
import ChatbotButton from "../components/shared/chatbotButton";
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
            <ChatbotButton />
        </>
    );
}

export default Landing;