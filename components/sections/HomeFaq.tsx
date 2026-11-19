import { ScrollScene } from "@/components/motion/ScrollScene";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { Disclosure } from "@/components/ui/Disclosure";
import { TextLink } from "@/components/ui/TextLink";
import { primaryAction } from "@/data/navigation";
import { products } from "@/data/products";
import type { Product } from "@/data/types";

// The product's own FAQ, so home and product page can't drift apart and no
// extra claims need approving. Only items whose answer may be shown.
const defaultProduct = products[0];
const items = (product: Product) =>
  product.faq.filter((item) => claimString(item.answer) !== null);

export const homeFaqShown = () => items(defaultProduct).length > 0;

/**
 * The Questions sheet, just before Inquiry; the product page reuses it with
 * its own product. The left column is a framed
 * block with a hatched edge that stays in view while the questions scroll
 * past on desktop, so the column is never an empty half of the sheet.
 */
export function HomeFaq({ product = defaultProduct }: { product?: Product }) {
  return (
    <ScrollScene
      id="questions"
      sheet="Questions"
      env="sheet"
      className="grid items-start gap-x-gutter gap-y-6 px-margin py-scene lg:grid-cols-12"
    >
      <div className="flex border border-rule lg:sticky lg:top-[calc(var(--spacing-header)+var(--spacing-4))] lg:col-span-4">
        <span
          aria-hidden="true"
          className="w-2 shrink-0 border-rule border-r hatch-rule"
        />
        <div className="flex flex-col gap-3 p-3 lg:p-4">
          <h2 className="type-display-l">Questions about our motors</h2>
          <p className="measure type-body text-ink-muted">
            Where the motor stands, and how an evaluation starts. Anything not
            covered here, ask our engineers.
          </p>
          <div>
            <TextLink href={primaryAction.href} arrow>
              {primaryAction.label}
            </TextLink>
          </div>
        </div>
      </div>
      <div className="flex flex-col border-rule border-b lg:col-span-7 lg:col-start-6">
        {items(product).map((item) => (
          <Disclosure
            key={item.answer}
            summary={<span className="type-lede">{item.question}</span>}
          >
            <p className="measure type-body text-ink-muted">
              <ClaimText id={item.answer} />
            </p>
          </Disclosure>
        ))}
      </div>
    </ScrollScene>
  );
}
