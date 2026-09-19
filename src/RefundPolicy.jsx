import { Link } from 'react-router-dom';
import PolicyPage, { Section } from './components/PolicyPage';

export default function RefundPolicy() {
  return (
    <PolicyPage
      title="Refund and Cancellation Policy"
      summary="We do not use a blanket ‘no refunds’ rule. Eligibility depends on payment, delivery, listing accuracy, evidence, publisher action and rights that cannot be waived under applicable law."
    >
      <Section title="Before delivery">
        <p>
          Ask Support to cancel immediately. If delivery has not started and the
          transaction can safely be reversed, we will cancel and refund.
          Payment-provider or banking processing times may apply.
        </p>
      </Section>

      <Section title="Eligible cases">
        <p>
          A refund, replacement or other remedy may be available for a duplicate
          charge, verified unauthorized payment, non-delivery, invalid credentials
          at delivery, material mismatch with the approved listing, or seller
          recovery/compromise during an expressly stated protection period. Report
          access problems as soon as possible and no later than 7 days after delivery
          unless the listing gives a longer period or law requires otherwise.
        </p>
      </Section>

      <Section title="Normally ineligible cases">
        <p>
          A remedy may be refused where evidence shows buyer misuse, sharing or resale;
          loss caused by changing or failing to secure credentials; device/region
          incompatibility disclosed before purchase; a change of mind after usable
          digital delivery; cheating or publisher enforcement caused by buyer conduct;
          or materially false information.
        </p>

        <p>
          Publisher suspension remains a known risk and is not automatically refundable
          when the listing clearly disclosed it, but this does not excuse an unauthorized
          or misrepresented sale.
        </p>
      </Section>

      <Section title="How to claim">
        <p>
          Open a ticket through <Link to="/support">Support</Link>, select the order,
          describe the issue and attach non-sensitive evidence. Do not expose full
          passwords or payment credentials. We may temporarily secure delivery and
          seller funds while reviewing both sides.
        </p>
      </Section>

      <Section title="Decision and timing">
        <p>
          We aim to acknowledge a complaint within 48 hours and resolve it within
          30 days, sooner where practical. Approved refunds return to the original
          payment method; bank timing is outside our control. This policy does not
          limit mandatory consumer remedies.
        </p>
      </Section>
    </PolicyPage>
  );
}