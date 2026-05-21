/**
 * QuickEditDashboardPage — full-page wrapper around QuickEditDashboard.
 *
 * Lives at /admin/alw-quick-edit (registered via app.addMenuLink in app.tsx),
 * so Anna can always reach the dashboard from the left sidebar, no matter
 * which page she's on.
 *
 * Why a separate route instead of a homepage widget:
 *   Strapi v5's widget API for the admin homepage is version-fragile —
 *   the registration call (app.widgets.register) silently fails to surface
 *   the widget in the "Add Widget" picker on the version Anna is running.
 *   Falling back to a dedicated route via addMenuLink gives us a reliable,
 *   always-visible entry point that uses the stable Strapi v5 menu API.
 *
 * The page just wraps QuickEditDashboard with full-page padding so it
 * looks intentional inside Strapi's content area rather than floating.
 *
 * --- Xceed pattern ---
 * Reliable way to surface a custom dashboard in Strapi v5 admin without
 * depending on the unstable widget API.
 */

import QuickEditDashboard from './QuickEditDashboard';

const QuickEditDashboardPage = () => {
  return (
    <main
      style={{
        padding: '32px 40px',
        background: '#fafafd',
        minHeight: '100vh',
      }}
    >
      <QuickEditDashboard />
    </main>
  );
};

export default QuickEditDashboardPage;
