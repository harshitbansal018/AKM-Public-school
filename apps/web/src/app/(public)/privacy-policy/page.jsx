import { getSettings, getPublicPolicies } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { text } from '@/lib/content';
import { groupPoliciesByTab } from '@/constants/policies';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import PolicyTabs from '@/components/ui/PolicyTabs/PolicyTabs';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'page_policies_title', 'Privacy Policy'),
    description: text(settings, 'page_policies_subtitle'),
    path: '/privacy-policy',
  });
}

/**
 * The school's policies — privacy, student, staff, rules — on one page, one
 * tab per heading the office set up under Website content → Privacy Policy
 * page. Only active policies are shown; a tab with nothing in it is hidden.
 */
export default async function PrivacyPolicyPage() {
  const [settings, { tabs, policies }] = await Promise.all([getSettings(), getPublicPolicies()]);
  const groups = groupPoliciesByTab(policies, tabs);
  const title = text(settings, 'page_policies_title', 'Privacy Policy');

  return (
    <>
      <PageHeader
        title={title}
        subtitle={text(settings, 'page_policies_subtitle')}
        breadcrumbs={[{ label: title }]}
      />

      <section className="section">
        <div className="container">
          {groups.length === 0 ? (
            <EmptyState
              title={text(settings, 'policies_empty_title', 'No policies published yet')}
              description={text(settings, 'policies_empty_description')}
            />
          ) : (
            <PolicyTabs groups={groups} />
          )}
        </div>
      </section>
    </>
  );
}
