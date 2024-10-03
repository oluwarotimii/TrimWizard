import { useState } from 'react';
import '@/styles/globals.css';

const packages = [
  {
    id: 1,
    name: 'Free',
    price: 'Try for Free',
    // account: 'Account No: 123456789',
  },
  {
    id: 2,
    name: 'Basic',
    price: '₦5,000/month',
    account: 'Account No: 987654321',
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

    // Add the email to Google Sheets (you can call your backend API here)

    alert(`Please transfer to ${selectedPackage.account} and send your payment receipt to WhatsApp.\nLink: ${whatsappLink}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-4">Select Your Package</h1>
        <p className="text-xl mb-6">Choose a plan and complete your payment.</p>
      </header>

      <section className="flex flex-col items-center">
        {packages.map(pkg => (
          <div 
            key={pkg.id} 
            className={`w-full max-w-md p-4 border rounded-lg cursor-pointer ${selectedPackage?.id === pkg.id ? 'bg-gray-800' : 'bg-gray-700'}`}
            onClick={() => handlePackageSelect(pkg)}
          >
            <h2 className="text-2xl font-semibold">{pkg.name}</h2>
            <p className="text-xl">{pkg.price}</p>
            {selectedPackage?.id === pkg.id && (
              <p className="mt-2">Transfer to: {pkg.account}</p>
            )}
          </div>
        ))}
      </section>

      {selectedPackage && (
        <form onSubmit={handleSubmit} className="mt-6">
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
            className="bg-white text-blue-500 px-4 py-2 rounded-lg ml-2"
          >
            Proceed
          </button>
        </form>
      )}
    </div>
  );
}
