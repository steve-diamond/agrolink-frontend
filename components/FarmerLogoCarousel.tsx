"use client";

import Image from "next/image";
import { useEffect } from "react";

type FarmerLogo = {
  name: string;
  tag: string;
  image: string;
};

const farmerLogos: FarmerLogo[] = [
  { name: "Maize Growers", tag: "Crop Cooperative", image: "/agropro/images/maize.jpg" },
  { name: "Cassava Network", tag: "Root Value Chain", image: "/agropro/images/cassava.jpg" },
  { name: "Plantain Union", tag: "Fresh Produce", image: "/agropro/images/plantain.jpg" },
  { name: "Fish Farmers", tag: "Aquaculture Hub", image: "/agropro/images/fish.jpeg" },
  { name: "Poultry Cluster", tag: "Livestock Group", image: "/agropro/images/chicken.jpg" },
  { name: "Vegetable Circle", tag: "Leafy Producers", image: "/agropro/images/ugu.jpg" },
  { name: "Snail Producers", tag: "Specialty Farming", image: "/agropro/images/snail.jpg" },
];

const slideGroups: FarmerLogo[][] = [
  farmerLogos.slice(0, 4),
  farmerLogos.slice(3, 7),
];

export default function FarmerLogoCarousel() {
  useEffect(() => {
    import("bootstrap");
  }, []);

  return (
    <div id="farmerLogoCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="4200">
      <div className="carousel-inner">
        {slideGroups.map((group, index) => (
          <div key={`slide-${index}`} className={`carousel-item ${index === 0 ? "active" : ""}`}>
            <div className="row g-3 justify-content-center">
              {group.map((item) => (
                <div key={item.name} className="col-12 col-sm-6 col-lg-3">
                  <article className="dos-farmer-logo-card h-100">
                    <div className="dos-farmer-logo-media">
                      <Image src={item.image} alt={item.name} fill sizes="(max-width: 1200px) 50vw, 25vw" className="dos-farmer-logo-image" />
                    </div>
                    <div className="dos-farmer-logo-body">
                      <h3>{item.name}</h3>
                      <p>{item.tag}</p>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-control-prev" type="button" data-bs-target="#farmerLogoCarousel" data-bs-slide="prev" aria-label="Previous logos">
        <span className="carousel-control-prev-icon" aria-hidden="true" />
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#farmerLogoCarousel" data-bs-slide="next" aria-label="Next logos">
        <span className="carousel-control-next-icon" aria-hidden="true" />
      </button>
    </div>
  );
}
