import Image from "next/image";
import type { WondergreenReference } from "@/data/wondergreen-public";
import { getProductAssetPolicy, getPublicProductAsset } from "@/data/public-assets";
import styles from "./wondergreen-product-row.module.css";

export function WondergreenProductRow({ reference }: { reference: WondergreenReference }) {
  const asset = getPublicProductAsset(reference.slug);
  const policy = getProductAssetPolicy(reference.slug);
  const label = reference.formula ? `${reference.name} · ${reference.formula}` : reference.name;

  return (
    <div className={styles.row} data-product-slug={reference.slug} data-asset-status={policy?.status ?? "UNREGISTERED"}>
      <div className={styles.visual}>
        {asset?.publicPath ? (
          <Image src={asset.publicPath} alt={`Packshot aprobado de ${label}`} fill sizes="58px" />
        ) : (
          <span className={styles.placeholder} aria-label={`Packshot de ${label} pendiente de aprobación`}>Packshot<br />por aprobar</span>
        )}
      </div>
      <div className={styles.copy}>
        <strong>{label}</strong>
        <span>{policy?.status === "APPROVED_PUBLIC" ? "Activo visual aprobado" : "Activo visual pendiente"}</span>
      </div>
      <small className={styles.status}>{reference.publicStatus}</small>
    </div>
  );
}
