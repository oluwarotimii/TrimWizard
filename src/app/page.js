import Link from 'next/link';
import PriceCard from '@/components/priceCard';

export default function Landing() {
  const pricingPlans = [
    {
      id: 1,
      planName: 'Free',
      price: 'Try for Free',
      features: {
        description: 'Basic image cropping with limited features.',
        details: ['Up to 5 images', 'No watermark'],
      },
      account: 'Account No: 123456789',
    },
    {
      id: 2,
      planName: 'Basic',
      price: '₦5,000/month',
      features: {
        description: 'Advanced cropping features and higher image limits.',
        details: ['Unlimited cropping of images', 'No watermark, faster processing'],
      },
      account: 'Account No: 987654321',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      {/* Header */}
      <header className="text-center mb-10">
        <title>Trim Wizard</title>
        <h1 className="text-5xl m-20 font-bold mb-4">Welcome to TrimWizard</h1>
        <p className="text-xl mb-6">The ultimate tool for image cropping and editing.</p>
        <Link 
          href="/trimmer"
          className="bg-white text-blue-500 px-6 py-3 rounded-lg shadow-lg text-lg font-semibold transition-transform transform hover:scale-105 hover:shadow-xl"
        >
          Get Started
        </Link>
      </header>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto px-6 md:px-12 py-16 flex flex-col md:flex-row justify-around items-center text-center md:text-left">
        <div className="w-full md:w-1/3 mb-8 md:mb-0">
          <h2 className="text-3xl font-semibold mb-4 animate__animated animate__fadeIn animate__delay-1s">
            Easy Upload
          </h2>
          <p className="text-lg">
            Seamlessly upload your images with a simple drag-and-drop interface.
          </p>
        </div>
        <div className="w-full md:w-1/3 mb-8 md:mb-0">
          <h2 className="text-3xl font-semibold mb-4 animate__animated animate__fadeIn animate__delay-2s">
            Powerful Cropping
          </h2>
          <p className="text-lg">
            Crop your images with precision and flexibility to fit your needs.
          </p>
        </div>
        <div className="w-full md:w-1/3">
          <h2 className="text-3xl font-semibold mb-4 animate__animated animate__fadeIn animate__delay-3s">
            Download & Share
          </h2>
          <p className="text-lg">
            Download your edited images.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
   {/* Pricing Section */}
<section className="w-full max-w-6xl mx-auto px-6 md:px-12 py-16 text-gray-800 text-center">
  <h2 className="text-4xl font-bold mb-8">Choose Your Plan</h2>
  <div className="flex flex-col md:flex-row justify-center items-center md:space-x-6 mb-10"> {/* Add margin-bottom here */}
    {pricingPlans.map((plan, index) => (
      <PriceCard 
        key={index} 
        planName={plan.planName} 
        price={plan.price} 
        features={plan.features} 
        link={`/subscribe/${plan.planName.toLowerCase()}`} 
        color="blue" 
      />
    ))}
  </div>
  <Link 
    href="/pay"  // corrected from "/pay" to "/payment"
    className="bg-white text-blue-500 px-6 py-3 rounded-lg shadow-lg text-lg font-semibold mt-6"
  >
    Proceed to Payment
  </Link>
</section>


      {/* Footer */}
      <footer className="text-center py-6 mt-10 border-t border-white">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Oluwarotimi. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
