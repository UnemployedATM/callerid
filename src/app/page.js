import CardStack from './components/CardStack';
import AuthButtons from './components/AuthButtons';
import ExpandableCards from './components/ExpandableCards';

export default function BentoPage() {
  return (
    <main className="page-wrapper">

      <div className="scene">
        {/* Background is now locked perfectly inside the scene artboard */}
        <div className="scene-background"></div>

        {/* Logo overlay — matches scene exactly */}
        <img
          className="page-logo"
          src="/logo.png"
          alt="Bidaman"
          draggable={false}
        />

        <div className="bento-layout">

          {/* Cards 1, 2, 3 — expandable interactive cards */}
          <ExpandableCards />

          {/* Right column: Auth buttons top, Card 4 pinned to bottom */}
          <div className="right-col">
            <AuthButtons />
            <div className="card card-4" style={{ background: 'transparent', overflow: 'visible' }}>
              <CardStack />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
