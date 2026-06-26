import { Route, Switch, Redirect } from 'wouter';
import { lazy, Suspense } from 'react';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Lazy load pages for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const JoinPage = lazy(() => import('./pages/JoinPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const MembersPage = lazy(() => import('./pages/MembersPage'));
const MemberProfilePage = lazy(() => import('./pages/MemberProfilePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const DiscussionsPage = lazy(() => import('./pages/DiscussionsPage'));
const DiscussionDetailPage = lazy(() => import('./pages/DiscussionDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminMembers = lazy(() => import('./pages/admin/Members'));
const AdminApplications = lazy(() => import('./pages/admin/Applications'));
const AdminEvents = lazy(() => import('./pages/admin/Events'));
const AdminOpportunities = lazy(() => import('./pages/admin/Opportunities'));
const AdminArticles = lazy(() => import('./pages/admin/Articles'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      </div>
    </div>
  );
}

function PrivateRoute({ component: Component, roles, ...rest }: any) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Redirect to="/" />;
  return <Component {...rest} />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/join" component={JoinPage} />

        {/* Admin routes */}
        <Route path="/admin">
          {() => (
            <AdminLayout>
              <Suspense fallback={<PageLoader />}>
                <PrivateRoute component={AdminDashboard} roles={['admin', 'moderator']} />
              </Suspense>
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/members">
          {() => (
            <AdminLayout>
              <Suspense fallback={<PageLoader />}>
                <PrivateRoute component={AdminMembers} roles={['admin', 'moderator']} />
              </Suspense>
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/applications">
          {() => (
            <AdminLayout>
              <Suspense fallback={<PageLoader />}>
                <PrivateRoute component={AdminApplications} roles={['admin', 'moderator']} />
              </Suspense>
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/events">
          {() => (
            <AdminLayout>
              <Suspense fallback={<PageLoader />}>
                <PrivateRoute component={AdminEvents} roles={['admin', 'moderator']} />
              </Suspense>
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/opportunities">
          {() => (
            <AdminLayout>
              <Suspense fallback={<PageLoader />}>
                <PrivateRoute component={AdminOpportunities} roles={['admin', 'moderator']} />
              </Suspense>
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/articles">
          {() => (
            <AdminLayout>
              <Suspense fallback={<PageLoader />}>
                <PrivateRoute component={AdminArticles} roles={['admin', 'moderator']} />
              </Suspense>
            </AdminLayout>
          )}
        </Route>

        {/* Public + member routes */}
        <Route>
          {() => (
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/about" component={AboutPage} />
                  <Route path="/contact" component={ContactPage} />
                  <Route path="/events" component={EventsPage} />
                  <Route path="/events/:id" component={EventDetailPage} />
                  <Route path="/knowledge" component={KnowledgePage} />
                  <Route path="/knowledge/:id" component={ArticlePage} />
                  <Route path="/members" component={() => <PrivateRoute component={MembersPage} />} />
                  <Route path="/members/:id" component={() => <PrivateRoute component={MemberProfilePage} />} />
                  <Route path="/opportunities" component={() => <PrivateRoute component={OpportunitiesPage} />} />
                  <Route path="/discussions" component={() => <PrivateRoute component={DiscussionsPage} />} />
                  <Route path="/discussions/:id" component={() => <PrivateRoute component={DiscussionDetailPage} />} />
                  <Route path="/profile" component={() => <PrivateRoute component={ProfilePage} />} />
                  <Route path="/chat" component={() => <PrivateRoute component={ChatPage} />} />
                  <Route>
                    {() => (
                      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
                        <div>
                          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                          <p className="text-xl text-muted-foreground mb-6">الصفحة غير موجودة</p>
                          <a href="/" className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                            العودة للرئيسية
                          </a>
                        </div>
                      </div>
                    )}
                  </Route>
                </Switch>
              </Suspense>
            </Layout>
          )}
        </Route>
      </Switch>
    </Suspense>
  );
}
