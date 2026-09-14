const cleanUrl = (value: string | undefined) => value?.trim().replace(/\/$/, "") || "";

/** Canonical Greenatics site used by runtimes when they need an explicit way home. */
export const greenaticsPublicUrl = cleanUrl(process.env.NEXT_PUBLIC_GREENATICS_PUBLIC_URL)
  || (process.env.NODE_ENV === "production" ? "https://greenatics.com.co" : "http://localhost:3001");
