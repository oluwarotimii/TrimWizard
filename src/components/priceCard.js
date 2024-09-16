import Link from "next/link";

const PriceCard = ({ planName, price, features, link, color }) => {
    return (
      <div className={`bg-white text-${color}-600 p-8 rounded-lg shadow-lg mb-6 md:mb-0 w-full md:w-1/3`}>
        <h3 className="text-2xl font-bold mb-4">{planName}</h3>
        <p className="text-lg mb-4">{features.description}</p>
        {features.details.map((detail, index) => (
          <p key={index} className="text-lg font-semibold mb-4">{detail}</p>
        ))}
        <Link href={link} className={`bg-${color}-600 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold transition-transform transform hover:scale-105`}>
          {price}
        </Link>
      </div>
    );
  };
  export default PriceCard;
  