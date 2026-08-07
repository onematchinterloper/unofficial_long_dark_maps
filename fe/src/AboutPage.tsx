export default function AboutPage() {
  return (
    <article className="aboutPage">
      <div className="aboutPage__content">
        <p className="aboutPage__eyebrow">Unofficial fan project</p>
        <h1>About &amp; credits</h1>
        <p className="aboutPage__intro">
          Unofficial Long Dark Maps is a mobile-friendly viewer that brings community-made maps together in one
          place. Choose a region, select Pilgrim, Interloper, or topographic where available, then pan and zoom to
          explore it.
        </p>

        <section>
          <h2>Credits and map sources</h2>
          <p>
            I did not create any of the maps shown on this site; I merely compiled and presented links to maps made
            by members of The Long Dark community.
          </p>
          <p>Known map contributors:</p>
          <ul>
            <li>
              <strong>delta</strong> — creator of the topographic maps, sourced from the{' '}
              <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=1142193220" target="_blank" rel="noreferrer">
                The Long Dark Topographic Maps Steam Community guide
              </a>.
            </li>
            <li>
              <strong>HokuOwl</strong> — creator of the updated region maps sourced from the{' '}
              <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3255435617" target="_blank" rel="noreferrer">
                Updated Region Maps [2025] Steam Community guide
              </a>.
            </li>
            <li>
              <a href="https://www.reddit.com/user/PercyRiverwood/" target="_blank" rel="noreferrer">
                <strong>Percy Riverwood</strong>
              </a>{' '}
              — creator of the{' '}
              <a
                href="https://www.reddit.com/r/thelongdark/comments/1n5zo36/zoc_mining_buildingconcentrator_map/"
                target="_blank"
                rel="noreferrer"
              >
                Zone of Contamination mining building/Concentrator map
              </a>.
            </li>
            <li>
              <strong>stmSantana and XHeadGaming</strong> — contributors to the{' '}
              <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=1901570789" target="_blank" rel="noreferrer">
                Detailed Region Maps Steam Community guide
              </a>.
            </li>
            <li>
              <strong>Krueger</strong> — creator of the{' '}
              <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=2899955301" target="_blank" rel="noreferrer">
                Tales from the Far Territory map locations Steam Community guide
              </a>.
            </li>
          </ul>
          <p>
            Special thanks to <strong>Elektronixx</strong> for compiling the <code>maps.json</code> data, overworld map
            data, and map source links in the{' '}
            <a href="https://github.com/Elektronixx/TLD-Interactive-Map" target="_blank" rel="noreferrer">
              TLD Interactive Map project
            </a>.
          </p>
          <p>
            Map images are loaded from their original externally hosted sources. All maps belong to their respective
            community creators, and this project does not claim authorship or ownership of them. If you know of a
            missing or incorrect credit, please open an issue so it can be corrected.
          </p>
        </section>

        <section>
          <h2>Disclaimer</h2>
          <p>
            This is an unofficial fan-made project. It is not affiliated with, endorsed by, or sponsored by
            Hinterland Studio. The Long Dark and related names and artwork are property of their respective owners.
            Map information may be incomplete or become outdated as the game changes.
          </p>
        </section>

        <section>
          <h2>Privacy</h2>
          <p>
            The site has no accounts or backend. It stores small cookies only to remember viewer preferences such as
            map type and menu state. Map images are served by external hosts, which may receive normal request data
            such as your IP address and browser information when an image loads.
          </p>
        </section>

        <section>
          <h2>Feedback and contributions</h2>
          <p>
            Found an incorrect link, missing credit, outdated map, or viewer bug? Open an issue or contribute on the{' '}
            <a href="https://github.com/onematchinterloper/unofficial_long_dark_maps" target="_blank" rel="noreferrer">
              GitHub repository
            </a>.
          </p>
        </section>
      </div>
    </article>
  )
}
