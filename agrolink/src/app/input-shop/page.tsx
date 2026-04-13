import Link from "next/link";

export default function InputShopPage() {
  return (
    <main className="page">
      <header className="subHeader">
        <div>
          <p className="brandOverline">Farm Inputs</p>
          <h1>Input Shop</h1>
        </div>
        <Link href="/" className="homeLink">Back Home</Link>
      </header>

      <section className="gridTwo">
        <article className="card infoCard">
          <span>Hybrid Maize Seeds</span>
          <strong>Subsidy Badge: 20%</strong>
          <p>Certified seed with drought tolerance for northern zones.</p>
        </article>
        <article className="card infoCard">
          <span>NPK 20:10:10</span>
          <strong>Group Price: NGN 27,500</strong>
          <p>Join cooperative buying pool to unlock discount tiers.</p>
        </article>
        <article className="card infoCard">
          <span>Crop Protection Pack</span>
          <strong>Verified Vendor</strong>
          <p>Pest management bundle with extension-support hotline.</p>
        </article>
      </section>

      <section className="card intention">
        <h2>Group Buying Progress</h2>
        <p>37 farmers joined this week. Next discount unlock at 50 farmers.</p>
        <div className="ctaRow">
          <button className="btn btnPrimary" type="button">Join Group Buying</button>
          <button className="btn btnSecondary" type="button">View Subsidy Offers</button>
        </div>
      </section>
    </main>
  );
}
