import { Link } from 'react-router-dom';
import PolicyPage, { Section } from './components/PolicyPage';

export default function Legal() {
  return (
    <PolicyPage
      title="Terms of Service"
      summary="Game accounts and digital goods may be non-transferable under a publisher's rules. A purchase does not override those rules, and a publisher may restrict or close an account. Only listings expressly permitted by the applicable publisher are allowed here."
    >
      <Section title="1. Agreement and operator">
        <p>
          These Terms govern access to AllGamersMarket and form a contract between
          the site operator (“AllGamersMarket”, “we”) and each visitor, buyer or
          seller. By creating an account, applying as a seller, listing, or placing
          an order, you agree to these Terms and the policies linked below. If you
          do not agree, do not use the service.
        </p>

        <p>
          You must be at least 18 and legally able to contract. Do not use the
          service for a minor or from a place where the transaction is unlawful.
        </p>
      </Section>

      <Section title="2. Marketplace role">
        <p>
          AllGamersMarket provides listing, payment, delivery and dispute tools.
          Unless a listing says that AllGamersMarket is the seller, the seller—not
          AllGamersMarket—is responsible for ownership, accuracy, legality,
          authorization, delivery and continuing validity of the listing.
        </p>

        <p>
          Game publishers do not sponsor, endorse or control this marketplace.
          Trademarks identify compatibility only.
        </p>
      </Section>

      <Section title="3. Publisher rules and transfer risk">
        <p>
          A seller may list only a product, service or account that the publisher
          expressly permits to be sold or transferred. Ownership of credentials
          alone is not sufficient authorization. We may remove a listing or suspend
          funds whenever authorization cannot be demonstrated.
        </p>

        <p>
          Buyers understand that publishers may restrict transfers, reclaim content,
          reset credentials, suspend access or close an account. Review the{' '}
          <Link to="/account-transfer-risks">
            Account Transfer Risk Disclosure
          </Link>{' '}
          before ordering.
        </p>
      </Section>

      <Section title="4. Listings and seller promises">
        <p>
          Sellers must complete requested identity and business checks, disclose
          their legal identity and contact details, describe the product accurately,
          disclose region/platform restrictions and defects, keep evidence of lawful
          acquisition, and cooperate with disputes. Stolen, hacked, botted,
          duplicated, counterfeit, financed, recalled or unauthorized products are
          prohibited.
        </p>

        <p>
          Sellers appoint AllGamersMarket to collect buyer payments only under the
          approved marketplace payment arrangement. Off-platform payments and
          attempts to bypass fees or safeguards are prohibited. The{' '}
          <Link to="/marketplace-rules">Marketplace Rules</Link> form part of these
          Terms.
        </p>
      </Section>

      <Section title="5. Orders, prices and delivery">
        <p>
          The checkout page shows the final amount before payment. An order is
          accepted only after the payment provider confirms capture and the platform
          records the order. We may cancel and refund an order affected by pricing,
          inventory, fraud, compliance or technical errors.
        </p>

        <p>
          Delivery method and expected timing appear on the listing. Buyers must
          inspect delivery promptly, secure permitted credentials, and report issues
          through Support with evidence. Never send passwords or payment credentials
          in public chat.
        </p>
      </Section>

      <Section title="6. Refunds, disputes and chargebacks">
        <p>
          Refund decisions follow our{' '}
          <Link to="/refund-policy">Refund and Cancellation Policy</Link> and
          mandatory consumer law. “Digital product” does not remove rights that
          cannot legally be waived. Filing a knowingly false chargeback, fabricating
          evidence or retaining usable delivery after a refund may result in account
          suspension and recovery action.
        </p>
      </Section>

      <Section title="7. Acceptable use">
        <p>
          You must not commit fraud, impersonate another person, launder funds, evade
          sanctions or taxes, infringe intellectual property, distribute malware,
          scrape personal data, manipulate reviews, abuse support, interfere with
          security, or use a purchase for cheating or unlawful conduct.
        </p>
      </Section>

      <Section title="8. Suspension and preservation">
        <p>
          We may hold delivery or seller payouts, request verification, remove
          content, preserve evidence, or suspend access where reasonably necessary
          to prevent harm, investigate a complaint, follow law, protect users, or
          comply with a publisher or payment provider.
        </p>
      </Section>

      <Section title="9. Disclaimers and liability">
        <p>
          The service is provided with reasonable care but availability is not
          guaranteed. To the maximum extent allowed by law, we are not responsible
          for publisher actions, game changes, unauthorized seller conduct or
          indirect losses that we could not reasonably control. Nothing in these
          Terms excludes liability or consumer rights that applicable law does not
          allow us to exclude.
        </p>
      </Section>

      <Section title="10. Privacy, changes and governing law">
        <p>
          Our <Link to="/privacy">Privacy Policy</Link> explains personal-data
          processing. Material changes will be announced before they apply where
          required. These Terms are governed by the laws of India, subject to any
          mandatory rights and forum available to a consumer.
        </p>

        <p>
          Questions and complaints may be submitted through{' '}
          <Link to="/support">Support</Link>. Legal notices may be emailed to{' '}
          <a href="mailto:legal@allgamersmarket.com">
            legal@allgamersmarket.com
          </a>
          .
        </p>
      </Section>
    </PolicyPage>
  );
}