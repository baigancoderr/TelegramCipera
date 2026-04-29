import Footer from "../Components/Footer";
import Hero from "../Components/Hero";
import WalletHero from "../Components/Wallet/WalletHero";
import bgImg from "../assets/bgImg.png";

const Wallet = () => {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Page Content */}
      

      {/* Footer */}
     <WalletHero/>
      <Footer />
    </div>
  );
};

export default Wallet;