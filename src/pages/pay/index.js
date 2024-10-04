import { useState } from 'react';
import '@/styles/globals.css';

const packages = [
  {
    id: 2,
    name: 'Basic',
    price: '₦5,000/month',
    account: ' Transfer to account No: 1849501433',
    bankName: 'Access Bank',
    Account_Name: 'Oluwarotimi Adewumi',
  },
];

export default function Payment() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [email, setEmail] = useState('');

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !selectedPackage) {
      alert('Please enter your email and select a package.');
      return;
    }

    const message = `Hi, I have made a payment for the ${selectedPackage.name}. Here is my email: ${email}`;
    const whatsappLink = `https://wa.me/+2347036109595?text=${encodeURIComponent(message)}`;

    // Redirect to WhatsApp with prefilled message
    window.open(whatsappLink, '_blank');

    alert(`Please transfer to ${selectedPackage.account} and send your payment receipt to the WhatsApp link.`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-4">Select Your Package</h1>
        <p className="text-xl mb-6">Choose a plan and complete your payment.</p>
      </header>

      {/* Instructions Section */}
      <section className="text-center mb-8 max-w-2xl">
        <p className="text-lg">
          Please select a package, transfer the payment to the account provided, and send your payment receipt
          along with your email to the WhatsApp number listed below.
        </p>
        <p className="text-lg font-semibold mt-4">
          WhatsApp: <a href="https://wa.me/+2347036109595" className="text-green-300">+234 703 610 9595</a>
        </p>

        <p className="text-lg font-semibold mt-4"> Send the Payment receipt </p>
      </section>

      {/* Package Selection */}
   {/* Package Selection */}
<section className="flex flex-col items-center">
  {packages.map(pkg => (
    <div
      key={pkg.id}
      className={`w-full max-w-md p-4 mb-4 border rounded-lg cursor-pointer transition-all transform hover:scale-105 ${selectedPackage?.id === pkg.id ? 'bg-gray-800' : 'bg-gray-700'}`}
      onClick={() => handlePackageSelect(pkg)}
    >
      <h2 className="text-2xl font-semibold">{pkg.name}</h2>
      <p className="text-xl">{pkg.price}</p>
      {selectedPackage?.id === pkg.id && (
        <div className="mt-2">
          <p className="text-lg">Bank: {pkg.bankName}</p>
          <p className="text-lg">Account: {pkg.account}</p>
          <p className="text-lg">Account: {pkg.Account_Name}</p>
        </div>
      )}
    </div>
  ))}
</section>


      {/* Proceed with Payment */}
      {selectedPackage && (
        <form onSubmit={handleSubmit} className="mt-6 flex items-center">
          <input
            type="email"   
            placeholder="Enter your email"
            className="p-2 rounded-lg text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-white text-blue-500 px-4 py-2 rounded-lg ml-2 transition-all transform hover:scale-105"
          >
            Proceed
          </button>
        </form>
      )}
    </div>
  );
}
