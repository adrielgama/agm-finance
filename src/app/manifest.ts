import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AGM Finance",
    short_name: "AGM Finance",
    description: "Controle financeiro da AGM Digital",
    start_url: "/",
    display: "standalone",
    background_color: "#2B335B",
    theme_color: "#2B335B",
    icons: [
      {
        src: "/brand/agm-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/agm-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
