import { Link } from 'react-router-dom';
import PolicyPage, { Section } from './components/PolicyPage';

export default function Privacy() {
  return (
    <PolicyPage
      title="Privacy Policy"
      summary="This notice explains what personal data AllGamersMarket handles, why it is used, who receives it, and how you can request access, correction, erasure or withdrawal of consent."
    >
      <Section title="1. Data we collect">
        <p>
          Account data: name, email, authentication identifier, profile image and
          sign-in records. Seller data: legal/display name, phone, country,
          categories, verification information and payout records. Order data:
          listing, amount, payment and order identifiers, delivery status,
          disputes and support messages. Technical data: IP address,
          browser/device details, security events, consent choice and service logs.
        </p>

        <p>
          Do not upload government identification or confidential credentials
          unless a secure, specifically identified workflow requests them.
        </p>
      </Section>

      <Section title="2. Why we use it">
        <p>
          We use the minimum data reasonably needed to authenticate users;
          operate listings, checkout, delivery and support; prevent fraud and
          duplicate sales; verify sellers; comply with accounting, tax, legal
          and payment-provider duties; secure the service; and establish or
          defend legal claims. Optional analytics or marketing will require a
          separate choice where consent is required.
        </p>
      </Section>

      <Section title="3. Providers and recipients">
        <p>
          Data may be processed by Supabase (authentication, database and
          storage), Razorpay and its banking partners (payments and fraud
          controls), Cloudflare (hosting, security and network logs), Google
          (only when you choose Google sign-in), professional advisers and
          authorities when legally required. Buyers and sellers receive only
          the information needed to complete or resolve their transaction.
        </p>

        <p>
          These providers may process data in other countries under their own
          safeguards and applicable law.
        </p>
      </Section>

      <Section title="4. Retention">
        <p>
          We retain account data while the account is active; transaction, tax,
          fraud and dispute evidence for the period required by law or reasonably
          needed for claims; and security logs for a limited operational period.
          Data is deleted or de-identified when no longer required. A deletion
          request cannot erase records that we must keep by law or for an active
          dispute.
        </p>
      </Section>

      <Section title="5. Security">
        <p>
          We use access controls, encrypted transport, role-based database rules,
          restricted secrets and payment-provider checkout. No online system is
          risk-free. Users must protect their email, device, passwords and
          authentication methods and immediately report suspected unauthorized
          access.
        </p>
      </Section>

      <Section title="6. Your choices and rights">
        <p>
          Depending on applicable law, you may request a summary or copy of your
          data, correction, erasure, withdrawal of consent, restriction or
          objection, and grievance review. Withdrawing consent is as easy as
          contacting Support; it does not invalidate earlier lawful processing
          and may prevent use of features that require the data.
        </p>

        <p>
          Submit a request through <Link to="/support">Support</Link> or email{' '}
          <a href="mailto:privacy@allgamersmarket.com">
            privacy@allgamersmarket.com
          </a>
          . We may verify identity before acting.
        </p>
      </Section>

      <Section title="7. Cookies and children">
        <p>
          See our <Link to="/cookies">Cookie Policy</Link> and use “Cookie
          settings” in the footer. This marketplace is for adults aged 18 or
          older and is not intended to knowingly collect children’s data.
        </p>
      </Section>

      <Section title="8. Changes and complaints">
        <p>
          We will post changes here and provide additional notice for material
          changes where required. Privacy questions or complaints can be filed
          through Support or sent to{' '}
          <a href="mailto:privacy@allgamersmarket.com">
            privacy@allgamersmarket.com
          </a>
          . You may also approach the competent data-protection or consumer
          authority where you have that right.
        </p>
      </Section>
    </PolicyPage>
  );
}