import { FcuElevation } from "@/components/drawings/FcuElevation";
import { Button } from "@/components/ui/Button";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { StatusTag } from "@/components/ui/StatusTag";
import { navigation, primaryAction } from "@/data/navigation";
import { HeroStage } from "./HeroStage";

/**
 * Sheet 01, server side: claims are resolved here so the register never
 * reaches the client; `HeroStage` does the 3D and the choreography.
 */
export function Hero() {
  const product = navigation[0];
  return (
    <HeroStage
      headline={claimString("home.headline") ?? ""}
      lede={<ClaimText id="product.overview" />}
      status={
        <StatusTag>
          <ClaimText id="product.status" />
        </StatusTag>
      }
      actions={
        <>
          <Button href={primaryAction.href} size="lg" arrow>
            {primaryAction.label}
          </Button>
          <Button href={product.href} variant="secondary" size="lg">
            Explore the FCU motor
          </Button>
        </>
      }
      drawing={<FcuElevation className="size-full" />}
      sheetDrawing={<FcuElevation className="size-full" />}
    />
  );
}
