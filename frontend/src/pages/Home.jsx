import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import AIDemo from "../components/AIDemo";
import Footer from "../components/Footer";


function Home(){

  return (

    <div className="overflow-hidden">


      <Navbar />


      <main>

        <Hero />

        <Features />

        <AIDemo />

      </main>


      <Footer />


    </div>

  );

}


export default Home;