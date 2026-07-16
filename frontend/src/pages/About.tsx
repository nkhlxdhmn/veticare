export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-16 md:space-y-24 animate-fade-in py-10 md:py-16 px-4 md:px-6">
      <div className="space-y-6 text-center">
        <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight">The Vision</h1>
        <p className="text-xl md:text-2xl text-textSecondary font-light leading-relaxed">
          Reimagining pet healthcare through elegant design and advanced machine learning.
        </p>
      </div>

      <div className="space-y-16">
        <section className="space-y-6">
          <h2 className="text-3xl font-serif border-b border-borderLight pb-4">Our Mission</h2>
          <div className="prose prose-lg text-textSecondary font-light max-w-none leading-loose">
            <p>
              VetiCare was founded on a simple principle: pet healthcare should be intuitive, beautiful, and accessible. We believe that by combining elegant editorial design with powerful artificial intelligence, we can empower pet owners to make better decisions about their companions' health.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-serif border-b border-borderLight pb-4">Machine Learning Pipeline</h2>
          <div className="prose prose-lg text-textSecondary font-light max-w-none leading-loose">
            <p>
              At the core of VetiCare is our predictive health model. Trained on extensive veterinary datasets, our algorithms analyze symptoms to identify potential health risks before they become emergencies. 
            </p>
            <p className="mt-4">
              The pipeline processes text input through natural language processing to extract key symptom indicators, passing them through an ensemble model that provides confidence scores and severity ratings in real-time.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-serif border-b border-borderLight pb-4">Architecture</h2>
          <div className="prose prose-lg text-textSecondary font-light max-w-none leading-loose">
            <p>
              Built for scale and security, VetiCare utilizes a modern tech stack. The frontend emphasizes typography and whitespace using React and TailwindCSS. The backend is powered by FastAPI, leveraging PostgreSQL for reliable data storage and Redis for high-performance rate limiting.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
