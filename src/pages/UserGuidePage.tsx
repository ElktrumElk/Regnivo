import { PageHeader } from '../components/PageHeader.tsx'
import { guideStyles } from '../styles/guideStyles.ts'

export function UserGuidePage() {
  return (
    <>
      <PageHeader eyebrow="Help" title="User guide" description="How Regnivo connects to your services, what each URL means, and how monitors use them." />
      <div className={guideStyles.classes.guide}>
        <section className={guideStyles.classes.section}>
          <h2 className={guideStyles.classes.sectionTitle}>URLs explained</h2>
          <div className={guideStyles.classes.terms}>
            <div className={guideStyles.classes.term}>
              <p className={guideStyles.classes.termName}>Service URL</p>
              <p className={guideStyles.classes.termText}>The public origin reported by your provider (Render or Vercel), for example <span className={guideStyles.classes.code}>https://my-app.onrender.com</span>. It is the root of the deployed service and is used to prefill a monitor and to know which host to scan. It is not a request path by itself.</p>
            </div>
            <div className={guideStyles.classes.term}>
              <p className={guideStyles.classes.termName}>Target URL</p>
              <p className={guideStyles.classes.termText}>The exact HTTPS address Regnivo actually requests on every scheduled check. It can be the service root or a specific route such as <span className={guideStyles.classes.code}>https://my-app.onrender.com/api/health</span>. This is the value stored on the monitor.</p>
            </div>
            <div className={guideStyles.classes.term}>
              <p className={guideStyles.classes.termName}>Endpoint / monitor</p>
              <p className={guideStyles.classes.termText}>A monitor is a target URL plus method, interval, timeout, expected status, retries, and optional request headers. Regnivo calls it on schedule and records the response.</p>
            </div>
          </div>
        </section>

        <section className={guideStyles.classes.section}>
          <h2 className={guideStyles.classes.sectionTitle}>Connect a provider</h2>
          <ol className={guideStyles.classes.list}>
            <li>Open <span className={guideStyles.classes.code}>Services</span> and choose Render or Vercel.</li>
            <li>Paste a read/write API key or token and the owner/team ID, then connect. Credentials are encrypted and stored per user.</li>
            <li>Select a service from the left to inspect its repository, live status, public endpoints, and recent deploys.</li>
          </ol>
        </section>

        <section className={guideStyles.classes.section}>
          <h2 className={guideStyles.classes.sectionTitle}>Scan endpoints</h2>
          <p className={guideStyles.classes.paragraph}>The <span className={guideStyles.classes.code}>Scan endpoints</span> button probes common API paths and any OpenAPI or Swagger document on the service origin, then lists reachable routes with their HTTP status.</p>
          <ul className={guideStyles.classes.list}>
            <li>Only public HTTPS origins are scanned. Private, loopback, metadata, and credential-bearing hosts are blocked.</li>
            <li>Press <span className={guideStyles.classes.code}>Monitor API</span> on any detected route to create a monitor whose target URL is that exact route.</li>
          </ul>
        </section>

        <section className={guideStyles.classes.section}>
          <h2 className={guideStyles.classes.sectionTitle}>Create a monitor</h2>
          <ol className={guideStyles.classes.list}>
            <li>Pick an endpoint source to prefill the target URL, or enter one manually.</li>
            <li>Adjust method, interval, timeout, expected status, and retries.</li>
            <li>Add request headers if the endpoint needs them. The first check runs right after deployment and appears in the request log.</li>
          </ol>
        </section>
      </div>
    </>
  )
}
