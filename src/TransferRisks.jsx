import PolicyPage, { Section } from './components/PolicyPage';

export default function TransferRisks() {
  return (
    <PolicyPage
      title="Account Transfer Risk Disclosure"
      eyebrow="Read before buying"
      summary="High risk: many publishers prohibit account sales. A transferred account may be suspended, closed or recovered even after a successful payment. AllGamersMarket cannot override a publisher’s rules or guarantee permanent access."
    >
      <Section title="Publisher restrictions">
        <p>
          Game access is usually a personal, revocable licence—not ownership of
          the game or its servers. Publishers may prohibit sharing, sale,
          purchase or transfer and may act without compensating a marketplace
          buyer. Check the publisher’s current terms before purchasing.
        </p>
      </Section>

      <Section title="Recovery and security">
        <p>
          A previous holder may retain recovery information, devices, receipts
          or linked accounts. Changing an email or password may not remove that
          risk. Never assume “full access” means permanent ownership or publisher
          support.
        </p>
      </Section>

      <Section title="Value and compatibility">
        <p>
          Game updates can alter ranks, items, currency, availability and value.
          Region, platform, age, device and identity restrictions may prevent
          use. Screenshots show a point in time and should be verified against
          the written listing.
        </p>
      </Section>

      <Section title="Your acknowledgement">
        <p>
          Only proceed if the publisher permits the transaction, the listing
          explains the restrictions, and you can tolerate the disclosed loss
          risk. If those conditions are not met, do not buy and report the
          listing to Support.
        </p>
      </Section>
    </PolicyPage>
  );
}