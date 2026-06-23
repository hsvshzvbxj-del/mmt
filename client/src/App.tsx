import { Route, Switch, Redirect } from 'wouter';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import ContactPage from './pages/ContactPage';
import MembersPage from './pages/MembersPage';
import MemberProfilePage from './pages/MemberProfilePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import KnowledgePage from './pages/KnowledgePage';
import ArticlePage from './pages/ArticlePage';
import DiscussionsPage from './pages/DiscussionsPage';
import DiscussionDetailPage from './pages/DiscussionDetailPage';
import ProfilePage from './pages/ProfilePage';

import AdminDashboard from './pages/admin/Dashboard';
import AdminMembers from './pages/admin/Members';
import AdminApplications from './pages/admin/Applications';
import AdminEvents from './pages/admin/Events';
import AdminOpportunities from './pages/admin/Opportunities';
import AdminArticles from './pages/admin/Articles';

function PrivateRoute({ component: Component, roles, ...rest }: any) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Redirect to="/" />;
  return <Component {...rest} />;
}

export default function App() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/join" component={JoinPage} />

      {/* Admin routes */}
      <Route path="/admin/:rest*">
        {() => (
          <AdminLayout>
            <Switch>
              <Route path="/admin" component={() => <PrivateRoute component={AdminDashboard} roles={['admin', 'moderator']} />} />
              <Route path="/admin/members" component={() => <PrivateRoute component={AdminMembers} roles={['admin', 'moderator']} />} />
              <Route path="/admin/applications" component={() => <PrivateRoute component={AdminApplications} roles={['admin', 'moderator']} />} />
              <Route path="/admin/events" component={() => <PrivateRoute component={AdminEvents} roles={['admin', 'moderator']} />} />
              <Route path="/admin/opportunities" component={() => <PrivateRoute component={AdminOpportunities} roles={['admin', 'moderator']} />} />
              <Route path="/admin/articles" component={() => <PrivateRoute component={AdminArticles} roles={['admin', 'moderator']} />} />
            </Switch>
          </AdminLayout>
        )}
      </Route>

      {/* Public + member routes */}
      <Route>
        {() => (
          <Layout>
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
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}
