import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import QuizForm from '../components/QuizForm.jsx';
import { SITE } from '../config/site.js';
export default function Home() {
  return (
    <>
      <Header />
      <main className="hero">
        <section className="pitch" aria-labelledby="h1">
          <h1 id="h1">Could you qualify for disability benefits?</h1>
          <p className="callout">You may be eligible for up to {SITE.maxBenefit} every month in disability benefits.*</p>
          <p className="answer">Answer a few questions to see if you qualify.</p>
          <p className="lead">Living with a health condition while money is tight is hard enough. Answer a few short questions and we'll help you understand your options and what to do next.</p>
          <ul className="points">
            <li><strong>Seven short questions.</strong> Most people finish in about two minutes.</li>
            <li><strong>No pressure.</strong> Answering doesn't commit you to anything, and you can go back and change any answer.</li>
            <li><strong>Your details stay private.</strong> We only use your contact information to respond to your request.</li>
          </ul>
          <dl className="stats">{SITE.stats.map((s) => <div key={s.label}><dt>{s.value}</dt><dd>{s.label}</dd></div>)}</dl>
          <p className="footnote">*Maximum possible benefit per SSA. Individual amounts vary. Not available to California residents.</p>
        </section>
        <section className="formwrap" aria-label="Benefits survey"><QuizForm /></section>
      </main>
      <Footer />
    </>
  );
}
